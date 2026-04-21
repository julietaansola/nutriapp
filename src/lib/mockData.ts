import type { Patient, Measurement, MealPlan, Exchange, Appointment, DashboardStats, Recipe } from '../types';

export const mockMeasurements: Measurement[] = [
  {
    id: 'm1', patientId: 'p1', measurementNumber: 1, measurementDate: '2025-03-26',
    weight: 71.7, height: 153.6, seatedHeight: 85.5, age: 34.38,
    diameters: { biacromial: 39.4, thoraxTransverse: 27.9, thoraxAP: 18.6, biIliocrestid: 32.8, humeral: 6.4, femoral: 9.3, head: 55.0 },
    perimeters: { relaxedArm: 32.3, flexedArm: 32.0, forearm: 25.0, mesoChest: 97.5, minWaist: 85.0, maxHips: 108.1, upperThigh: 63.0, medialThigh: 53.8, maxCalf: 35.6 },
    skinfolds: { triceps: 22.4, subscapular: 24.0, supraspinal: 26.0, abdominal: 36.0, medialThigh: 27.4, calf: 12.8 },
    bodyComposition: { adipose: { kg: 23.72, pct: 33.09 }, muscle: { kg: 28.11, pct: 39.21 }, residual: { kg: 7.91, pct: 11.03 }, bone: { kg: 8.56, pct: 11.94 }, skin: { kg: 3.40, pct: 4.75 } },
    sumOf6Skinfolds: 148.6, muscleOseousIndex: 3.28, basalMetabolism: 1442.87,
    physicalActivityLevel: 'Liviana', totalEnergyExpenditure: 2164.31,
    objectives: { targetSkinfolds: 135, adiposeDeficitKg: 2.0, deficitMonths: 1.4, targetIMO: 3.28, muscleGainKg: 0, surplusMonths: 0 },
    pdfUrl: null, createdAt: '2025-03-26',
  },
  {
    id: 'm2', patientId: 'p1', measurementNumber: 2, measurementDate: '2025-07-02',
    weight: 68.7, height: 153.6, seatedHeight: 85.5, age: 34.64,
    diameters: { biacromial: 39.4, thoraxTransverse: 27.9, thoraxAP: 18.6, biIliocrestid: 32.8, humeral: 6.4, femoral: 9.3, head: 55.0 },
    perimeters: { relaxedArm: 31.5, flexedArm: 32.0, forearm: 24.2, mesoChest: 94.3, minWaist: 81.0, maxHips: 108.0, upperThigh: 65.0, medialThigh: 56.0, maxCalf: 35.0 },
    skinfolds: { triceps: 18.6, subscapular: 19.4, supraspinal: 22.0, abdominal: 30.0, medialThigh: 26.0, calf: 12.0 },
    bodyComposition: { adipose: { kg: 21.57, pct: 31.40 }, muscle: { kg: 27.80, pct: 40.47 }, residual: { kg: 7.60, pct: 11.06 }, bone: { kg: 8.56, pct: 12.46 }, skin: { kg: 3.17, pct: 4.61 } },
    sumOf6Skinfolds: 128.0, muscleOseousIndex: 3.25, basalMetabolism: 1420.5,
    physicalActivityLevel: 'Liviana', totalEnergyExpenditure: 2130.75,
    objectives: { targetSkinfolds: 120, adiposeDeficitKg: 1.5, deficitMonths: 1.0, targetIMO: 3.30, muscleGainKg: 0.5, surplusMonths: 1.5 },
    pdfUrl: null, createdAt: '2025-07-02',
  },
  {
    id: 'm3', patientId: 'p1', measurementNumber: 3, measurementDate: '2025-08-06',
    weight: 68.5, height: 153.6, seatedHeight: 85.5, age: 34.74,
    diameters: { biacromial: 39.4, thoraxTransverse: 27.9, thoraxAP: 18.6, biIliocrestid: 32.8, humeral: 6.4, femoral: 9.3, head: 55.0 },
    perimeters: { relaxedArm: 32.0, flexedArm: 32.6, forearm: 24.2, mesoChest: 94.5, minWaist: 80.3, maxHips: 105.0, upperThigh: 63.0, medialThigh: 56.0, maxCalf: 35.0 },
    skinfolds: { triceps: 19.0, subscapular: 18.4, supraspinal: 20.4, abdominal: 28.0, medialThigh: 26.0, calf: 12.0 },
    bodyComposition: { adipose: { kg: 21.26, pct: 31.04 }, muscle: { kg: 27.88, pct: 40.70 }, residual: { kg: 7.54, pct: 11.01 }, bone: { kg: 8.56, pct: 12.49 }, skin: { kg: 3.26, pct: 4.76 } },
    sumOf6Skinfolds: 123.8, muscleOseousIndex: 3.26, basalMetabolism: 1418.2,
    physicalActivityLevel: 'Liviana', totalEnergyExpenditure: 2127.3,
    objectives: { targetSkinfolds: 115, adiposeDeficitKg: 1.2, deficitMonths: 0.8, targetIMO: 3.30, muscleGainKg: 0.5, surplusMonths: 1.5 },
    pdfUrl: null, createdAt: '2025-08-06',
  },
];

export const mockExchanges: Exchange[] = [
  { id: 'e1', mealPlanId: 'mp1', category: 'cereal', name: 'Pan integral/salvado', portion: '1 rodaja', grams: '25g', semaforo: 'GREEN' },
  { id: 'e2', mealPlanId: 'mp1', category: 'cereal', name: 'Galleta de arroz', portion: '2 unidades', grams: '15g', semaforo: 'GREEN' },
  { id: 'e3', mealPlanId: 'mp1', category: 'cereal', name: 'Avena', portion: '2 cdas. soperas', grams: '15g', semaforo: 'GREEN' },
  { id: 'e4', mealPlanId: 'mp1', category: 'cereal', name: 'Pochoclos', portion: '1 taza tipo té', grams: '130g', semaforo: 'YELLOW' },
  { id: 'e5', mealPlanId: 'mp1', category: 'cereal', name: 'Galletitas dulces', portion: '1 unidad', grams: '10g', semaforo: 'RED' },
  { id: 'e6', mealPlanId: 'mp1', category: 'cereal', name: 'Turrón Arcor', portion: '1 unidad', grams: '25g', semaforo: 'RED' },
  { id: 'e7', mealPlanId: 'mp1', category: 'cereal', name: 'Copos de maíz sin azúcar', portion: '½ taza', grams: '15g', semaforo: 'GREEN' },
  { id: 'e8', mealPlanId: 'mp1', category: 'cereal', name: 'Granola íntegra', portion: '2 cdas. al ras', grams: '20g', semaforo: 'GREEN' },
  { id: 'e10', mealPlanId: 'mp1', category: 'fruta', name: 'Fruta fresca (manzana, banana)', portion: '1 unidad pequeña', grams: '150g', semaforo: 'GREEN' },
  { id: 'e11', mealPlanId: 'mp1', category: 'fruta', name: 'Fruta fresca (durazno, naranja, kiwi)', portion: '1 unidad mediana', grams: '200g', semaforo: 'GREEN' },
  { id: 'e12', mealPlanId: 'mp1', category: 'fruta', name: 'Frutos rojos, frutilla, uvas', portion: '1 taza', grams: '200g', semaforo: 'GREEN' },
  { id: 'e13', mealPlanId: 'mp1', category: 'fruta', name: 'Jugo natural exprimido', portion: '1 vaso', grams: '200ml', semaforo: 'YELLOW' },
  { id: 'e14', mealPlanId: 'mp1', category: 'proteina_manana', name: 'Huevo', portion: '1 unidad', grams: '50g', semaforo: 'GREEN' },
  { id: 'e15', mealPlanId: 'mp1', category: 'proteina_manana', name: 'Whey protein', portion: '½ scoop', grams: '15.5g', semaforo: 'GREEN' },
  { id: 'e16', mealPlanId: 'mp1', category: 'proteina_manana', name: 'Yogur Ser Pro+', portion: '½ pote', grams: '87g', semaforo: 'GREEN' },
  { id: 'e17', mealPlanId: 'mp1', category: 'proteina_manana', name: 'Jamón cocido', portion: '2 fetas', grams: '40g', semaforo: 'GREEN' },
  { id: 'e18', mealPlanId: 'mp1', category: 'proteina_manana', name: 'Barrita proteica', portion: '½ barrita', grams: '30g', semaforo: 'YELLOW' },
  { id: 'e19', mealPlanId: 'mp1', category: 'proteina_almuerzo', name: 'Pechuga de pollo', portion: '1 mediana', grams: '200g crudo', semaforo: 'GREEN' },
  { id: 'e20', mealPlanId: 'mp1', category: 'proteina_almuerzo', name: 'Carne magra (peceto, lomo)', portion: 'Tamaño de la mano', grams: '200g crudo', semaforo: 'GREEN' },
  { id: 'e21', mealPlanId: 'mp1', category: 'proteina_almuerzo', name: 'Merluza', portion: '2 filetes', grams: '', semaforo: 'GREEN' },
  { id: 'e22', mealPlanId: 'mp1', category: 'proteina_almuerzo', name: 'Milanesa al horno', portion: '1 palma', grams: '130g', semaforo: 'YELLOW' },
  { id: 'e23', mealPlanId: 'mp1', category: 'proteina_almuerzo', name: 'Hamburguesa Paty', portion: '2 unidades', grams: '160g', semaforo: 'RED' },
  { id: 'e24', mealPlanId: 'mp1', category: 'hidrato', name: 'Arroz o polenta', portion: '6 cdas. cocido', grams: '70g crudo', semaforo: 'GREEN' },
  { id: 'e25', mealPlanId: 'mp1', category: 'hidrato', name: 'Fideos', portion: '1 plato playo', grams: '70g crudo', semaforo: 'GREEN' },
  { id: 'e26', mealPlanId: 'mp1', category: 'hidrato', name: 'Papa/batata', portion: '3 chicas', grams: '300g', semaforo: 'GREEN' },
  { id: 'e27', mealPlanId: 'mp1', category: 'hidrato', name: 'Ñoquis', portion: '25 unidades', grams: '150g', semaforo: 'YELLOW' },
  { id: 'e28', mealPlanId: 'mp1', category: 'hidrato', name: 'Masa de tarta', portion: '¼ tapa', grams: '', semaforo: 'RED' },
  { id: 'e30', mealPlanId: 'mp1', category: 'grasa', name: 'Aceite oliva/girasol/canola', portion: '1 cda. sopera', grams: '15g', semaforo: 'GREEN' },
  { id: 'e31', mealPlanId: 'mp1', category: 'grasa', name: 'Palta', portion: '½ unidad', grams: '100g', semaforo: 'GREEN' },
  { id: 'e32', mealPlanId: 'mp1', category: 'grasa', name: 'Frutos secos', portion: '10 unidades', grams: '20g', semaforo: 'GREEN' },
  { id: 'e33', mealPlanId: 'mp1', category: 'grasa', name: 'Mayonesa light', portion: '1½ cdas.', grams: '15g', semaforo: 'YELLOW' },
  { id: 'e34', mealPlanId: 'mp1', category: 'grasa', name: 'Manteca/ghee', portion: '1 cda.', grams: '15g', semaforo: 'RED' },
  { id: 'e35', mealPlanId: 'mp1', category: 'practico', name: 'Pancakes Granger (3 cdas)', portion: '= 1 cereal + 1 proteína', grams: '', semaforo: 'GREEN' },
  { id: 'e36', mealPlanId: 'mp1', category: 'practico', name: 'Yogur Ser Pro+ (1 pote)', portion: '= 2 proteínas', grams: '', semaforo: 'GREEN' },
  { id: 'e37', mealPlanId: 'mp1', category: 'practico', name: 'Barra íntegra proteica', portion: '= 1 cereal + 1 prote + 1 fruta', grams: '', semaforo: 'YELLOW' },
];

export const mockMealPlan: MealPlan = {
  id: 'mp1', patientId: 'p1', planDate: '2025-08-06', objective: 'Descenso de tejido adiposo',
  isActive: true, flexFreeMeals: 4, totalWeeklyMeals: 28, pdfUrl: null, createdAt: '2025-08-06',
  suggestions: 'No consumir más de 2 huevos enteros por día. Hidratarse con 2-3 vasos por comida.',
  prescriptions: [
    { moment: 'Mañana/Tarde', items: ['Infusiones libres', '3 Opciones de proteína', '2 Frutas', '1 Grasa'], examples: ['Post entreno: 1 huevo duro + 1 fruta. Tarde: 1 yogur + 1 fruta + 10 frutos secos.', 'Media mañana: 1 huevo + ½ palta. Tarde: 2 rollitos de jamón cocido y queso + 2 frutas.'] },
    { moment: 'Mediodía', items: ['0,7 Porción de Proteínas (150g crudo / 120g cocido)', '½ Porción de Hidratos de Carbono (35g crudo)', 'Verdura libre (excepto papa, batata, palta, aceitunas)', '1 Grasa'], examples: ['Wok de pollo, arroz yamaní y verduras.', 'Carne al horno con verduras asadas + ensalada.'] },
    { moment: 'Noche', items: ['0,7 Porción de Proteínas (150g crudo / 120g cocido)', '½ Porción de Hidratos de Carbono (35g crudo)', 'Verdura libre (excepto papa, batata, palta, aceitunas)', '1 Grasa'], examples: ['35g de fideos en crudo con carne magra y vegetales.', 'Pastel de boniato y pollo.'] },
  ],
  exchanges: mockExchanges,
};

export const mockPatient: Patient = {
  id: 'p1', userId: 'u2', firstName: 'Julieta', lastName: 'Ansola',
  birthDate: '1990-10-15', phone: '+54 11 5555-1234', email: 'julieta@example.com',
  notes: 'Paciente comprometida. Entrena 3 veces por semana.',
  createdAt: '2025-03-01', updatedAt: '2025-08-06',
  measurements: mockMeasurements, mealPlans: [mockMealPlan],
};

export const mockStats: DashboardStats = {
  totalPatients: 12, measurementsThisMonth: 8, upcomingAppointments: 5, plansThisMonth: 3,
};

export const mockAppointment: Appointment = {
  id: 'a1', patientId: 'p1', scheduledDate: '2026-05-15T10:00:00',
  patientNotes: 'Consultar sobre suplementación de proteína post-entreno.',
  status: 'scheduled', createdAt: '2025-08-06',
};

export const mockRecipes: Recipe[] = [
  { title: 'Wok de pollo con arroz yamaní', ingredients: '200g pechuga (0.7 proteína)\n35g arroz yamaní crudo (½ hidrato)\nVerduras libres: brócoli, zanahoria, morrón\n1 cda aceite oliva (1 grasa)', instructions: 'Saltear el pollo con las verduras y salsa de soja. Servir sobre el arroz.', mealMoment: 'mediodía' },
  { title: 'Ensalada completa con atún', ingredients: '1 lata atún + 1 huevo (0.7 proteína)\n150g papa (½ hidrato)\nLechuga, tomate, pepino libres\n1 cda aceite oliva (1 grasa)', instructions: 'Hervir la papa y el huevo. Armar la ensalada.', mealMoment: 'mediodía' },
  { title: 'Carne al horno con verduras asadas', ingredients: '200g peceto (0.7 proteína)\n150g batata (½ hidrato)\nZapallito, berenjena, cebolla libres\n½ palta (1 grasa)', instructions: 'Hornear la carne con verduras 30 min.', mealMoment: 'mediodía' },
  { title: 'Fideos con bolognesa light', ingredients: '35g fideos crudo (½ hidrato)\n200g carne picada magra (0.7 proteína)\nTomate, cebolla, morrón libres\n1 cda aceite (1 grasa)', instructions: 'Preparar la salsa. Mezclar con fideos cocidos.', mealMoment: 'mediodía' },
  { title: 'Bowl de quinoa con cerdo', ingredients: '200g solomillo cerdo (0.7 proteína)\n35g quinoa cruda (½ hidrato)\nRúcula, tomate cherry libres\n10 aceitunas (1 grasa)', instructions: 'Cocinar quinoa, grillar cerdo. Armar bowl.', mealMoment: 'mediodía' },
];
