import fs from 'fs';
import pdf from 'pdf-parse';

function parseNumber(str: string | undefined): number | null {
  if (!str) return null;
  const cleaned = str.replace(',', '.').replace(/[^\d.\-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function extractValue(text: string, label: string): number | null {
  // Match patterns like "Peso (kg)  71,70" or "Biacromial  39,40  43,65  2,92"
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escaped}[\\s]*([\\d]+[,.]?[\\d]*)`, 'i');
  const match = text.match(regex);
  return match ? parseNumber(match[1]) : null;
}

function extractSection(text: string, startLabel: string, endLabel: string): string {
  const startIdx = text.indexOf(startLabel);
  const endIdx = endLabel ? text.indexOf(endLabel, startIdx + startLabel.length) : text.length;
  if (startIdx === -1) return '';
  return text.substring(startIdx, endIdx === -1 ? undefined : endIdx);
}

export async function parseAntropometriaPdf(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  const text = data.text;

  // Basic data
  const weight = extractValue(text, 'Peso \\(kg\\)');
  const height = extractValue(text, 'Talla \\(cm\\)');
  const seatedHeight = extractValue(text, 'Talla sentado');
  const age = extractValue(text, 'Edad:');
  const measurementNumber = extractValue(text, 'Número de medición:');

  // Measurement date
  const dateMatch = text.match(/Fecha de medición:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  let measurementDate: string | null = null;
  if (dateMatch) {
    const parts = dateMatch[1].split('/');
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    measurementDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  // Diameters
  const diameters = {
    biacromial: extractValue(text, 'Biacromial'),
    thoraxTransverse: extractValue(text, 'Tórax Transverso') ?? extractValue(text, 'Torax Transverso'),
    thoraxAP: extractValue(text, 'Tórax Anteroposterior') ?? extractValue(text, 'Torax Anteroposterior'),
    biIliocrestid: extractValue(text, 'Bi-iliocrestídeo') ?? extractValue(text, 'Bi-iliocrestideo'),
    humeral: extractValue(text, 'Humeral'),
    femoral: extractValue(text, 'Femoral'),
    head: extractValue(text, 'Cabeza'),
  };

  // Perimeters
  const perimeters = {
    relaxedArm: extractValue(text, 'Brazo Relajado'),
    flexedArm: extractValue(text, 'Brazo Flexionado'),
    forearm: extractValue(text, 'Antebrazo'),
    mesoChest: extractValue(text, 'Tórax Mesoesternal') ?? extractValue(text, 'Torax Mesoesternal'),
    minWaist: extractValue(text, 'Cintura'),
    maxHips: extractValue(text, 'Caderas'),
    upperThigh: extractValue(text, 'Muslo \\(superior\\)') ?? extractValue(text, 'Muslo superior'),
    medialThigh: extractValue(text, 'Muslo \\(medial\\)') ?? extractValue(text, 'Muslo medial'),
    maxCalf: extractValue(text, 'Pantorrilla'),
  };

  // Skinfolds
  const skinfolds = {
    triceps: extractValue(text, 'Tríceps') ?? extractValue(text, 'Triceps'),
    subscapular: extractValue(text, 'Subescapular'),
    supraspinal: extractValue(text, 'Supraespinal'),
    abdominal: extractValue(text, 'Abdominal'),
    medialThigh: null as number | null, // complex to extract, usually near "Muslo medial" in skinfolds section
    calf: null as number | null,
  };

  // Try to extract skinfold values from the skinfolds section specifically
  const skinfoldsSection = extractSection(text, 'PLIEGUES', 'FRACCIONAMIENTO');
  if (skinfoldsSection) {
    const sfMedialThigh = extractValue(skinfoldsSection, 'Muslo');
    const sfCalf = extractValue(skinfoldsSection, 'Pantorrilla') ?? extractValue(skinfoldsSection, 'Pierna');
    if (sfMedialThigh) skinfolds.medialThigh = sfMedialThigh;
    if (sfCalf) skinfolds.calf = sfCalf;
  }

  // Body composition
  const bodyComposition = {
    adipose: { kg: null as number | null, pct: null as number | null },
    muscle: { kg: null as number | null, pct: null as number | null },
    residual: { kg: null as number | null, pct: null as number | null },
    bone: { kg: null as number | null, pct: null as number | null },
    skin: { kg: null as number | null, pct: null as number | null },
  };

  // Try to parse body composition from the fraccionamiento section
  const fracSection = extractSection(text, 'FRACCIONAMIENTO', 'Evolucion');
  if (fracSection) {
    // Pattern: percentage then kg value
    const compRegex = /Masa\s+(Adiposa|Muscular|Residual|Ósea|de la Piel).*?(\d+[.,]\d+)%.*?(\d+[.,]\d+)/gs;
    let compMatch;
    while ((compMatch = compRegex.exec(fracSection)) !== null) {
      const type = compMatch[1];
      const pct = parseNumber(compMatch[2]);
      const kg = parseNumber(compMatch[3]);
      if (type.includes('Adiposa')) { bodyComposition.adipose = { kg, pct }; }
      else if (type.includes('Muscular')) { bodyComposition.muscle = { kg, pct }; }
      else if (type.includes('Residual')) { bodyComposition.residual = { kg, pct }; }
      else if (type.includes('sea')) { bodyComposition.bone = { kg, pct }; }
      else if (type.includes('Piel')) { bodyComposition.skin = { kg, pct }; }
    }

    // Alternative: look for tabular format with % and kg values
    if (!bodyComposition.adipose.kg) {
      const lines = fracSection.split('\n');
      for (const line of lines) {
        const nums = line.match(/(\d+[.,]\d+)/g)?.map(n => parseNumber(n)) || [];
        if (line.includes('Adiposa') && nums.length >= 2) {
          bodyComposition.adipose = { pct: nums.find(n => n && n < 100) || null, kg: nums.find(n => n && n > 5) || null };
        }
        if (line.includes('Muscular') && nums.length >= 2) {
          bodyComposition.muscle = { pct: nums.find(n => n && n < 100) || null, kg: nums.find(n => n && n > 5) || null };
        }
        if (line.includes('Residual') && nums.length >= 2) {
          bodyComposition.residual = { pct: nums.find(n => n && n < 100) || null, kg: nums.find(n => n && n > 5) || null };
        }
        if ((line.includes('Ósea') || line.includes('Osea')) && nums.length >= 2) {
          bodyComposition.bone = { pct: nums.find(n => n && n < 100) || null, kg: nums.find(n => n && n > 1) || null };
        }
        if (line.includes('Piel') && nums.length >= 2) {
          bodyComposition.skin = { pct: nums.find(n => n && n < 100) || null, kg: nums.find(n => n && n > 1) || null };
        }
      }
    }
  }

  // Sum of 6 skinfolds
  const sum6Match = text.match(/Suma de 6 pliegues.*?(\d+[.,]\d+)/i);
  const sumOf6Skinfolds = sum6Match ? parseNumber(sum6Match[1]) : null;

  // Muscle/Osseous index
  const imoMatch = text.match(/[IÍií]ndice m[uú]sculo.*?(\d+[.,]\d+)/i) ?? text.match(/Imo.*?(\d+[.,]\d+)/i);
  const muscleOseousIndex = imoMatch ? parseNumber(imoMatch[1]) : null;

  // Basal metabolism
  const mbMatch = text.match(/Metabolismo Basal.*?(\d+[.,]\d+)/i);
  const basalMetabolism = mbMatch ? parseNumber(mbMatch[1]) : null;

  // Activity level
  const actMatch = text.match(/Nivel de actividad f[ií]sica:\s*(\w+)/i);
  const physicalActivityLevel = actMatch ? actMatch[1] : null;

  // Total energy
  const geMatch = text.match(/Gasto energ[eé]tico total.*?(\d+[.,]\d+)/i);
  const totalEnergyExpenditure = geMatch ? parseNumber(geMatch[1]) : null;

  // Objectives
  let objectives = null;
  const objSection = extractSection(text, 'Objetivo', 'Metabolismo');
  if (objSection) {
    const targetSkinfoldsMatch = objSection.match(/Sumatoria de pliegues\s*(\d+[.,]?\d*)/i);
    const adiposeDeficitMatch = objSection.match(/kilos de tejido adiposo.*?(\d+[.,]\d+)/i);
    const deficitMonthsMatch = objSection.match(/meses de d[eé]ficit.*?(\d+[.,]\d+)/i);
    const targetIMOMatch = objSection.match(/I\s*M\/O\s*(\d+[.,]\d+)/i);
    objectives = {
      targetSkinfolds: targetSkinfoldsMatch ? parseNumber(targetSkinfoldsMatch[1]) : null,
      adiposeDeficitKg: adiposeDeficitMatch ? parseNumber(adiposeDeficitMatch[1]) : null,
      deficitMonths: deficitMonthsMatch ? parseNumber(deficitMonthsMatch[1]) : null,
      targetIMO: targetIMOMatch ? parseNumber(targetIMOMatch[1]) : null,
    };
  }

  return {
    measurementNumber: measurementNumber ? Math.round(measurementNumber) : null,
    measurementDate,
    weight,
    height,
    seatedHeight,
    age,
    diameters,
    perimeters,
    skinfolds,
    bodyComposition,
    sumOf6Skinfolds,
    muscleOseousIndex,
    basalMetabolism,
    physicalActivityLevel,
    totalEnergyExpenditure,
    objectives,
    rawPdfText: text,
  };
}

export async function parsePlanAlimentarioPdf(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  const text = data.text;

  // Objective - usually on second or third line
  const lines = text.split('\n').filter(l => l.trim());
  const objectiveMatch = text.match(/(?:Descenso|Mantenimiento|Aumento|Ganancia)\s+de\s+[\wáéíóú\s]+/i);
  const objective = objectiveMatch ? objectiveMatch[0].trim() : (lines[1]?.trim() || 'Plan de alimentación');

  // Prescriptions
  const prescriptions: Array<{ moment: string; items: string[]; examples: string[] }> = [];

  // Morning/afternoon
  const morningSection = extractSection(text, 'mañana', 'MEDIOD');
  if (morningSection) {
    const items = morningSection.match(/-\s*(.+)/g)?.map(i => i.replace(/^-\s*/, '').trim()) || [];
    const examples = morningSection.match(/Ejemplo[^:]*[:àá]\s*(.+)/gi)?.map(e => e.replace(/Ejemplo[^:]*[:àá]\s*/i, '').trim()) || [];
    prescriptions.push({ moment: 'Mañana/Tarde', items, examples });
  }

  // Midday
  const middaySection = extractSection(text, 'MEDIODÍA', 'NOCHE');
  if (middaySection) {
    const items = middaySection.match(/-\s*(.+)/g)?.map(i => i.replace(/^-\s*/, '').trim()) || [];
    const examples = middaySection.match(/Ejemplo[^:]*[:àá]\s*(.+)/gi)?.map(e => e.replace(/Ejemplo[^:]*[:àá]\s*/i, '').trim()) || [];
    prescriptions.push({ moment: 'Mediodía', items, examples });
  }

  // Night
  const nightSection = extractSection(text, 'NOCHE', 'Sistema de intercambios');
  if (!nightSection) {
    const nightAlt = extractSection(text, 'NOCHE', 'Cereal');
    if (nightAlt) {
      const items = nightAlt.match(/-\s*(.+)/g)?.map(i => i.replace(/^-\s*/, '').trim()) || [];
      const examples = nightAlt.match(/Ejemplo[^:]*[:àá]\s*(.+)/gi)?.map(e => e.replace(/Ejemplo[^:]*[:àá]\s*/i, '').trim()) || [];
      prescriptions.push({ moment: 'Noche', items, examples });
    }
  } else {
    const items = nightSection.match(/-\s*(.+)/g)?.map(i => i.replace(/^-\s*/, '').trim()) || [];
    const examples = nightSection.match(/Ejemplo[^:]*[:àá]\s*(.+)/gi)?.map(e => e.replace(/Ejemplo[^:]*[:àá]\s*/i, '').trim()) || [];
    prescriptions.push({ moment: 'Noche', items, examples });
  }

  // Extract exchanges by category
  const exchanges: Array<{ category: string; name: string; portion: string; grams: string; semaforo: string }> = [];

  function parseExchangeTable(section: string, category: string) {
    // Look for rows with food name, portion, and grams
    const tableLines = section.split('\n').filter(l => l.trim());
    for (const line of tableLines) {
      // Skip headers and labels
      if (line.match(/^(Un intercambio|Gramos|Opción|Cereal|Fruta|Proteín|Hidratos|Grasas|Verdura|Aliment)/i)) continue;
      if (line.trim().length < 3) continue;

      // Determine semaforo based on context or default
      let semaforo = 'GREEN';
      // These will be approximate — the PDF layout makes exact color extraction hard
      // We'll set some known red/yellow items
      const redItems = ['galletitas dulces', 'turrón', 'mayonesa común', 'crema', 'manteca', 'aceite de coco', 'coco rallado', 'hamburguesa paty'];
      const yellowItems = ['granola', 'almohaditas', 'pochoclos', 'milanesa', 'queso de máquina', 'queso de rallar', 'mayonesa light', 'crema light'];

      const nameLower = line.toLowerCase();
      if (redItems.some(r => nameLower.includes(r))) semaforo = 'RED';
      else if (yellowItems.some(y => nameLower.includes(y))) semaforo = 'YELLOW';

      // Try to parse: name | portion | grams
      const parts = line.split(/\t|  {2,}/);
      if (parts.length >= 2) {
        exchanges.push({
          category,
          name: parts[0].trim(),
          portion: parts[1]?.trim() || '',
          grams: parts[2]?.trim() || '',
          semaforo,
        });
      }
    }
  }

  // Parse each exchange section
  const cerealSection = extractSection(text, 'Cereal', 'Fruta');
  if (cerealSection) parseExchangeTable(cerealSection, 'cereal');

  const frutaSection = extractSection(text, 'Fruta', 'Proteín');
  if (frutaSection) parseExchangeTable(frutaSection, 'fruta');

  const protMorningSection = extractSection(text, 'Proteínas (Mañana', 'Proteínas almuerzo');
  if (protMorningSection) parseExchangeTable(protMorningSection, 'proteina_manana');

  const protLunchSection = extractSection(text, 'Proteínas almuerzo', 'Verdura');
  if (protLunchSection) parseExchangeTable(protLunchSection, 'proteina_almuerzo');

  const verduraSection = extractSection(text, 'Verdura', 'Hidratos');
  if (verduraSection) parseExchangeTable(verduraSection, 'verdura');

  const hidratoSection = extractSection(text, 'Hidratos de carbono', 'Grasas');
  if (hidratoSection) parseExchangeTable(hidratoSection, 'hidrato');

  const grasaSection = extractSection(text, 'Grasas', 'Alimentos prácticos');
  if (!grasaSection) {
    const grasaAlt = extractSection(text, 'Grasas', 'Condimentos');
    if (grasaAlt) parseExchangeTable(grasaAlt, 'grasa');
  } else {
    parseExchangeTable(grasaSection, 'grasa');
  }

  const practicoSection = extractSection(text, 'Alimentos prácticos', 'Recomendaciones');
  if (practicoSection) parseExchangeTable(practicoSection, 'practico');

  // Flexibility
  const flexMatch = text.match(/(\d+)\s*comidas?\s*(libres?|a la semana)/i);
  const flexFreeMeals = flexMatch ? parseInt(flexMatch[1]) : 4;

  // Suggestions
  const suggestionsMatch = text.match(/Algunas sugerencias([\s\S]*?)(?:Aclaración|Prescripción)/i);
  const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : null;

  return {
    objective,
    prescriptions,
    exchanges,
    flexFreeMeals,
    totalWeeklyMeals: 28,
    suggestions,
    rawPdfText: text,
  };
}
