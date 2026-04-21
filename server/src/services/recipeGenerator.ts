import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface MealPlanWithExchanges {
  objective: string;
  prescriptions: any;
  exchanges: Array<{
    category: string;
    name: string;
    portion: string;
    grams: string | null;
    semaforo: string;
  }>;
}

export async function generateRecipeIdeas(
  plan: MealPlanWithExchanges,
  mealMoment: string
): Promise<Array<{ title: string; ingredients: string; instructions: string; mealMoment: string }>> {
  const prescription = (plan.prescriptions as any[])?.find(
    (p: any) => p.moment?.toLowerCase().includes(mealMoment.toLowerCase())
  );

  const exchangesByCategory: Record<string, string[]> = {};
  for (const ex of plan.exchanges) {
    if (!exchangesByCategory[ex.category]) exchangesByCategory[ex.category] = [];
    exchangesByCategory[ex.category].push(`${ex.name} (${ex.portion}${ex.grams ? ` = ${ex.grams}` : ''})`);
  }

  const prompt = `Sos una nutricionista argentina. Generá 5 ideas de platos para el momento "${mealMoment}" basándote en el plan de alimentación del paciente.

OBJETIVO DEL PLAN: ${plan.objective}

PRESCRIPCIÓN PARA ${mealMoment.toUpperCase()}:
${prescription ? prescription.items?.join('\n') : 'No especificada'}

SISTEMA DE INTERCAMBIOS DISPONIBLE:
${Object.entries(exchangesByCategory)
  .map(([cat, items]) => `${cat}: ${items.slice(0, 8).join(', ')}`)
  .join('\n')}

INSTRUCCIONES:
- Generá exactamente 5 ideas de platos
- Cada plato debe respetar las porciones prescritas
- Expresá los ingredientes en las porciones del sistema de intercambios (ej: "1 porción de proteína = 200g pechuga")
- Usá ingredientes accesibles en Argentina
- Incluí opciones variadas (no repetir proteínas)
- Formato de respuesta: JSON array con objetos {title, ingredients, instructions}
- "ingredients" debe ser un string con cada ingrediente en una línea nueva
- "instructions" debe ser breve (2-3 oraciones)
- No uses markdown, solo JSON puro`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No se pudo parsear la respuesta del modelo');
    }

    const recipes = JSON.parse(jsonMatch[0]);
    return recipes.map((r: any) => ({
      title: r.title,
      ingredients: r.ingredients,
      instructions: r.instructions || '',
      mealMoment,
    }));
  } catch (error) {
    console.error('Error calling Claude API:', error);
    // Return fallback recipes
    return getFallbackRecipes(mealMoment);
  }
}

function getFallbackRecipes(mealMoment: string) {
  const fallbacks: Record<string, Array<{ title: string; ingredients: string; instructions: string; mealMoment: string }>> = {
    'mañana': [
      { title: 'Tostadas con huevo y palta', ingredients: '1 huevo revuelto (1 proteína)\n½ palta (1 grasa)\n1 rodaja pan integral (1 cereal)', instructions: 'Tostar el pan, preparar el huevo revuelto y agregar la palta pisada encima.', mealMoment },
      { title: 'Yogur con frutas y avena', ingredients: '1 yogur Ser Pro+ (1 proteína)\n1 fruta mediana picada (1 fruta)\n2 cdas avena (1 cereal)', instructions: 'Mezclar el yogur con la fruta cortada y la avena. Dejar reposar 5 min.', mealMoment },
      { title: 'Licuado proteico', ingredients: '½ scoop whey protein (1 proteína)\n1 banana chica (1 fruta)\n1 vaso leche descremada (1 proteína)', instructions: 'Licuar todos los ingredientes con hielo.', mealMoment },
      { title: 'Rollitos de jamón y queso con fruta', ingredients: '2 fetas jamón cocido (1 proteína)\n2 cdas queso port salut (1 grasa)\n1 manzana (1 fruta)', instructions: 'Armar rollitos con el jamón y queso. Acompañar con la fruta.', mealMoment },
      { title: 'Pancakes de avena', ingredients: '3 cdas pancakes Granger (1 cereal + 1 proteína)\n1 fruta mediana (1 fruta)\n10 frutos secos (1 grasa)', instructions: 'Preparar los pancakes según el paquete. Servir con fruta y frutos secos.', mealMoment },
    ],
    'mediodía': [
      { title: 'Wok de pollo con arroz yamaní', ingredients: '200g pechuga (0.7 proteína)\n35g arroz yamaní crudo (½ hidrato)\nVerduras libres: brócoli, zanahoria, morrón\n1 cda aceite oliva (1 grasa)', instructions: 'Saltear el pollo con las verduras y salsa de soja. Servir sobre el arroz.', mealMoment },
      { title: 'Ensalada completa con atún', ingredients: '1 lata atún natural + 1 huevo (0.7 proteína)\n150g papa (½ hidrato)\nLechuga, tomate, pepino libres\n1 cda aceite oliva (1 grasa)', instructions: 'Hervir la papa y el huevo. Armar la ensalada con todo.', mealMoment },
      { title: 'Carne al horno con verduras asadas', ingredients: '200g peceto (0.7 proteína)\n150g batata (½ hidrato)\nZapallito, berenjena, cebolla libres\n½ palta (1 grasa)', instructions: 'Hornear la carne con las verduras 30 min. Servir con palta.', mealMoment },
      { title: 'Fideos con salsa bolognesa light', ingredients: '35g fideos crudo (½ hidrato)\n200g carne picada magra (0.7 proteína)\nTomate, cebolla, morrón libres\n1 cda aceite oliva (1 grasa)', instructions: 'Preparar la salsa con la carne y verduras. Mezclar con los fideos cocidos.', mealMoment },
      { title: 'Bowl de quinoa con cerdo', ingredients: '200g solomillo cerdo (0.7 proteína)\n35g quinoa cruda (½ hidrato)\nRúcula, tomate cherry, pepino libres\n10 aceitunas (1 grasa)', instructions: 'Cocinar la quinoa y grillar el cerdo. Armar el bowl con verduras frescas.', mealMoment },
    ],
    'noche': [
      { title: 'Merluza al horno con puré de papa', ingredients: '2 filetes merluza (0.7 proteína)\n150g papa (½ hidrato)\nEspinaca, tomate libres\n1 cda aceite oliva (1 grasa)', instructions: 'Hornear la merluza con limón. Preparar puré con la papa.', mealMoment },
      { title: 'Omelette de verduras con tostada', ingredients: '2 huevos + 2 claras (0.7 proteína)\n1 rodaja pan integral (½ hidrato)\nEspinaca, champiñones, tomate libres\n2 cdas queso cremón light (1 grasa)', instructions: 'Batir huevos, agregar verduras y cocinar. Acompañar con tostada.', mealMoment },
      { title: 'Pastel de pollo y batata', ingredients: '200g pechuga desmenuzada (0.7 proteína)\n150g batata (½ hidrato)\nCebolla, morrón, choclo libres\n1 cda aceite (1 grasa)', instructions: 'Hacer un relleno con el pollo y verduras. Cubrir con puré de batata y gratinar.', mealMoment },
      { title: 'Cuscús con vegetales y huevo', ingredients: '3 cdas cuscús cocido (½ hidrato)\n2 huevos + 2 claras (0.7 proteína)\nZapallito, cebolla de verdeo, zanahoria libres\n15 aceitunas (1 grasa)', instructions: 'Hidratar el cuscús, saltear verduras y mezclar todo. Agregar huevo duro.', mealMoment },
      { title: 'Milanesa al horno con ensalada', ingredients: '1 milanesa de pollo al horno (0.7 proteína)\n3 papines (½ hidrato)\nLechuga, tomate, rúcula libres\n1 cda aceite oliva (1 grasa)', instructions: 'Hornear la milanesa sin aceite. Acompañar con papines y ensalada.', mealMoment },
    ],
  };

  const key = mealMoment.toLowerCase().includes('mañana') || mealMoment.toLowerCase().includes('tarde') ? 'mañana' : mealMoment.toLowerCase().includes('medio') ? 'mediodía' : 'noche';
  return fallbacks[key] || fallbacks['mediodía'];
}
