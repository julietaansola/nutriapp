import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NutriApp database...');

  // Clean existing data
  await prisma.exchange.deleteMany();
  await prisma.favoriteRecipe.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user (nutricionista)
  const adminPassword = await bcrypt.hash('voit2025', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'nutri@nutriapp.com',
      password: adminPassword,
      name: 'Nutricionista',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin creado:', admin.email);

  // Create patient user
  const patientPassword = await bcrypt.hash('paciente2025', 10);
  const patientUser = await prisma.user.create({
    data: {
      email: 'julieta@example.com',
      password: patientPassword,
      name: 'Julieta Ansola',
      role: 'PATIENT',
    },
  });

  // Create patient record
  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      firstName: 'Julieta',
      lastName: 'Ansola',
      birthDate: new Date('1990-10-15'),
      phone: '+54 11 5555-1234',
      email: 'julieta@example.com',
      notes: 'Paciente comprometida con el plan. Entrena 3 veces por semana (musculación + funcional). Objetivo principal: descenso de tejido adiposo manteniendo masa muscular.',
    },
  });
  console.log('✅ Paciente creada:', patient.firstName, patient.lastName);

  // Measurement 1 - March 2025
  await prisma.measurement.create({
    data: {
      patientId: patient.id,
      measurementNumber: 1,
      measurementDate: new Date('2025-03-26'),
      weight: 71.7,
      height: 153.6,
      seatedHeight: 85.5,
      age: 34.38,
      diameters: {
        biacromial: 39.4, thoraxTransverse: 27.9, thoraxAP: 18.6,
        biIliocrestid: 32.8, humeral: 6.4, femoral: 9.3, head: 55.0,
      },
      perimeters: {
        relaxedArm: 32.3, flexedArm: 32.0, forearm: 25.0,
        mesoChest: 97.5, minWaist: 85.0, maxHips: 108.1,
        upperThigh: 63.0, medialThigh: 53.8, maxCalf: 35.6,
      },
      skinfolds: {
        triceps: 22.4, subscapular: 24.0, supraspinal: 26.0,
        abdominal: 36.0, medialThigh: 27.4, calf: 12.8,
      },
      bodyComposition: {
        adipose: { kg: 23.72, pct: 33.09 },
        muscle: { kg: 28.11, pct: 39.21 },
        residual: { kg: 7.91, pct: 11.03 },
        bone: { kg: 8.56, pct: 11.94 },
        skin: { kg: 3.40, pct: 4.75 },
      },
      sumOf6Skinfolds: 148.6,
      muscleOseousIndex: 3.28,
      basalMetabolism: 1442.87,
      physicalActivityLevel: 'Liviana',
      totalEnergyExpenditure: 2164.31,
      objectives: {
        targetSkinfolds: 135,
        adiposeDeficitKg: 2.0,
        deficitMonths: 1.4,
        targetIMO: 3.28,
        muscleGainKg: 0,
        surplusMonths: 0,
      },
    },
  });

  // Measurement 2 - July 2025
  await prisma.measurement.create({
    data: {
      patientId: patient.id,
      measurementNumber: 2,
      measurementDate: new Date('2025-07-02'),
      weight: 68.7,
      height: 153.6,
      seatedHeight: 85.5,
      age: 34.64,
      diameters: {
        biacromial: 39.4, thoraxTransverse: 27.9, thoraxAP: 18.6,
        biIliocrestid: 32.8, humeral: 6.4, femoral: 9.3, head: 55.0,
      },
      perimeters: {
        relaxedArm: 31.5, flexedArm: 32.0, forearm: 24.2,
        mesoChest: 94.3, minWaist: 81.0, maxHips: 108.0,
        upperThigh: 65.0, medialThigh: 56.0, maxCalf: 35.0,
      },
      skinfolds: {
        triceps: 18.6, subscapular: 19.4, supraspinal: 22.0,
        abdominal: 30.0, medialThigh: 26.0, calf: 12.0,
      },
      bodyComposition: {
        adipose: { kg: 21.57, pct: 31.40 },
        muscle: { kg: 27.80, pct: 40.47 },
        residual: { kg: 7.60, pct: 11.06 },
        bone: { kg: 8.56, pct: 12.46 },
        skin: { kg: 3.17, pct: 4.61 },
      },
      sumOf6Skinfolds: 128.0,
      muscleOseousIndex: 3.25,
      basalMetabolism: 1420.5,
      physicalActivityLevel: 'Liviana',
      totalEnergyExpenditure: 2130.75,
      objectives: {
        targetSkinfolds: 120,
        adiposeDeficitKg: 1.5,
        deficitMonths: 1.0,
        targetIMO: 3.30,
        muscleGainKg: 0.5,
        surplusMonths: 1.5,
      },
    },
  });

  // Measurement 3 - August 2025
  await prisma.measurement.create({
    data: {
      patientId: patient.id,
      measurementNumber: 3,
      measurementDate: new Date('2025-08-06'),
      weight: 68.5,
      height: 153.6,
      seatedHeight: 85.5,
      age: 34.74,
      diameters: {
        biacromial: 39.4, thoraxTransverse: 27.9, thoraxAP: 18.6,
        biIliocrestid: 32.8, humeral: 6.4, femoral: 9.3, head: 55.0,
      },
      perimeters: {
        relaxedArm: 32.0, flexedArm: 32.6, forearm: 24.2,
        mesoChest: 94.5, minWaist: 80.3, maxHips: 105.0,
        upperThigh: 63.0, medialThigh: 56.0, maxCalf: 35.0,
      },
      skinfolds: {
        triceps: 19.0, subscapular: 18.4, supraspinal: 20.4,
        abdominal: 28.0, medialThigh: 26.0, calf: 12.0,
      },
      bodyComposition: {
        adipose: { kg: 21.26, pct: 31.04 },
        muscle: { kg: 27.88, pct: 40.70 },
        residual: { kg: 7.54, pct: 11.01 },
        bone: { kg: 8.56, pct: 12.49 },
        skin: { kg: 3.26, pct: 4.76 },
      },
      sumOf6Skinfolds: 123.8,
      muscleOseousIndex: 3.26,
      basalMetabolism: 1418.2,
      physicalActivityLevel: 'Liviana',
      totalEnergyExpenditure: 2127.3,
      objectives: {
        targetSkinfolds: 115,
        adiposeDeficitKg: 1.2,
        deficitMonths: 0.8,
        targetIMO: 3.30,
        muscleGainKg: 0.5,
        surplusMonths: 1.5,
      },
    },
  });
  console.log('✅ 3 mediciones creadas');

  // Active meal plan - August 2025
  const plan = await prisma.mealPlan.create({
    data: {
      patientId: patient.id,
      planDate: new Date('2025-08-06'),
      objective: 'Descenso de tejido adiposo',
      isActive: true,
      flexFreeMeals: 4,
      totalWeeklyMeals: 28,
      suggestions: 'No consumir más de 2 huevos enteros por día. Hidratarse con 2-3 vasos por comida. Si no consumís proteínas animales en una comida, agregar ½ limón o 1 mandarina para absorción de hierro.',
      prescriptions: [
        {
          moment: 'Mañana/Tarde',
          items: [
            'Infusiones libres',
            '3 Opciones de proteína',
            '2 Frutas',
            '1 Grasa',
          ],
          examples: [
            'Post entreno: 1 huevo duro + 1 fruta. Tarde: 1 yogur + 1 fruta + 10 frutos secos.',
            'Media mañana: 1 huevo + ½ palta. Tarde: 2 rollitos de jamón cocido y queso + 2 frutas.',
          ],
        },
        {
          moment: 'Mediodía',
          items: [
            '0,7 Porción de Proteínas (150g crudo / 120g cocido)',
            '½ Porción de Hidratos de Carbono (35g crudo)',
            'Verdura libre (excepto papa, batata, palta, aceitunas)',
            '1 Grasa',
          ],
          examples: [
            'Wok de pollo, arroz yamaní y verduras.',
            'Carne al horno con verduras asadas + ensalada.',
          ],
        },
        {
          moment: 'Noche',
          items: [
            '0,7 Porción de Proteínas (150g crudo / 120g cocido)',
            '½ Porción de Hidratos de Carbono (35g crudo)',
            'Verdura libre (excepto papa, batata, palta, aceitunas)',
            '1 Grasa',
          ],
          examples: [
            '35g de fideos en crudo con carne magra y vegetales.',
            'Pastel de boniato y pollo.',
          ],
        },
      ],
    },
  });

  // Create exchanges
  const exchangesData = [
    // Cereales
    { category: 'cereal', name: 'Pan integral/salvado', portion: '1 rodaja', grams: '25g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Galleta de arroz', portion: '2 unidades', grams: '15g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Avena', portion: '2 cdas. soperas', grams: '15g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Harina integral/arroz/quinoa', portion: '1 cda. colmada', grams: '20g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Copos de maíz sin azúcar', portion: '½ taza', grams: '15g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Fibritas de salvado', portion: '3 cdas. soperas', grams: '20g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Granola íntegra', portion: '2 cdas. al ras', grams: '20g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Pochoclos', portion: '1 taza tipo té', grams: '130g', semaforo: 'YELLOW' as const },
    { category: 'cereal', name: 'Pasta/Arroz', portion: '⅓ taza cocido', grams: '25g crudo', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Papa', portion: '1 unidad chica', grams: '70g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Garbanzos/Hummus', portion: '3 cdas. cocido', grams: '45g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Rapiditas light', portion: '1 unidad', grams: '25g', semaforo: 'GREEN' as const },
    { category: 'cereal', name: 'Galletitas dulces', portion: '1 unidad', grams: '10g', semaforo: 'RED' as const },
    { category: 'cereal', name: 'Turrón Arcor', portion: '1 unidad', grams: '25g', semaforo: 'RED' as const },
    { category: 'cereal', name: 'Barrita íntegra/muecas negra', portion: '½ barrita', grams: '27g', semaforo: 'YELLOW' as const },

    // Frutas
    { category: 'fruta', name: 'Fruta fresca (manzana, banana)', portion: '1 unidad pequeña', grams: '150g', semaforo: 'GREEN' as const },
    { category: 'fruta', name: 'Fruta fresca (durazno, naranja, pera, kiwi)', portion: '1 unidad mediana', grams: '200g', semaforo: 'GREEN' as const },
    { category: 'fruta', name: 'Frutos rojos, frutilla, uvas', portion: '1 taza', grams: '200g', semaforo: 'GREEN' as const },
    { category: 'fruta', name: 'Ensalada de frutas', portion: '1 vaso', grams: '200g', semaforo: 'GREEN' as const },
    { category: 'fruta', name: 'Jugo natural exprimido', portion: '1 vaso', grams: '200ml', semaforo: 'YELLOW' as const },
    { category: 'fruta', name: 'Fruta disecada (pasas)', portion: '½ taza', grams: '30g', semaforo: 'YELLOW' as const },

    // Proteínas mañana/tarde
    { category: 'proteina_manana', name: 'Huevo', portion: '1 unidad', grams: '50g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Claras', portion: '2 unidades', grams: '35g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Whey protein', portion: '½ scoop', grams: '15.5g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Leche descremada', portion: '1 vaso', grams: '150ml', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Queso port salut', portion: '2 cdas.', grams: '20g', semaforo: 'YELLOW' as const },
    { category: 'proteina_manana', name: 'Jamón cocido', portion: '2 fetas', grams: '40g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Yogur Ser Pro+', portion: '½ pote', grams: '87g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Yogur griego Kay', portion: '1 pote chico', grams: '100g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Ricotta descremada', portion: '2 cdas. soperas', grams: '50g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Atún al natural', portion: '½ lata', grams: '60g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Yogurisimo sin azúcar', portion: '½ pote', grams: '150g', semaforo: 'GREEN' as const },
    { category: 'proteina_manana', name: 'Barrita proteica (ENA/Iron Bar)', portion: '½ barrita', grams: '30g', semaforo: 'YELLOW' as const },

    // Proteínas almuerzo/cena
    { category: 'proteina_almuerzo', name: 'Pechuga de pollo', portion: '1 mediana', grams: '200g crudo', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Carne magra (peceto, lomo, cuadril)', portion: 'Tamaño de la mano', grams: '200g crudo', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Cerdo magro (solomillo, carré)', portion: 'Tamaño de la mano', grams: '200g crudo', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Pata muslo sin piel', portion: '1 pata muslo', grams: '', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Merluza', portion: '2 unidades', grams: '', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Atún natural + 1 huevo', portion: '1 lata + 1 huevo', grams: '100g', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Milanesa de pollo/vaca al horno', portion: '1 unidad palma', grams: '130g', semaforo: 'YELLOW' as const },
    { category: 'proteina_almuerzo', name: 'Huevos', portion: '2 huevos + 2 claras', grams: '', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Lentejas', portion: '¾ taza crudo', grams: '80g crudo', semaforo: 'GREEN' as const },
    { category: 'proteina_almuerzo', name: 'Hamburguesa Paty', portion: '2 unidades', grams: '160g', semaforo: 'RED' as const },

    // Hidratos
    { category: 'hidrato', name: 'Arroz o polenta', portion: '6 cdas. cocido', grams: '70g crudo', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Fideos', portion: '1 plato playo', grams: '70g crudo', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Quinoa/mijo/amaranto/trigo burgol', portion: '2 pocillos cocido', grams: '70g crudo', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Cuscús', portion: '¾ taza cocido', grams: '70g crudo', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Papa/batata/boniato', portion: '3 chicas o 1½ mediana', grams: '300g', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Legumbres', portion: '6 cdas. cocido', grams: '70g crudo', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Rapiditas light', portion: '3 unidades', grams: '75g', semaforo: 'GREEN' as const },
    { category: 'hidrato', name: 'Pan lactal', portion: '4 rodajas', grams: '100g', semaforo: 'YELLOW' as const },
    { category: 'hidrato', name: 'Ñoquis', portion: '25 unidades', grams: '150g', semaforo: 'YELLOW' as const },
    { category: 'hidrato', name: 'Ravioles', portion: '15 unidades', grams: '100g', semaforo: 'YELLOW' as const },
    { category: 'hidrato', name: 'Masa de tarta', portion: '¼ de una tapa', grams: '', semaforo: 'RED' as const },

    // Verduras (libres)
    { category: 'verdura', name: 'Todas las verduras', portion: 'Cantidad libre', grams: '', semaforo: 'GREEN' as const },
    { category: 'verdura', name: 'Excepto: papa, batata (hidratos)', portion: 'Ver hidratos', grams: '', semaforo: 'GREEN' as const },
    { category: 'verdura', name: 'Excepto: palta, aceitunas (grasas)', portion: 'Ver grasas', grams: '', semaforo: 'GREEN' as const },

    // Grasas
    { category: 'grasa', name: 'Aceite (oliva, girasol, canola)', portion: '1 cda. sopera', grams: '15g', semaforo: 'GREEN' as const },
    { category: 'grasa', name: 'Semillas molidas', portion: '2 cdas. soperas', grams: '30g', semaforo: 'GREEN' as const },
    { category: 'grasa', name: 'Aceitunas', portion: '15 unidades', grams: '60g', semaforo: 'GREEN' as const },
    { category: 'grasa', name: 'Palta', portion: '½ unidad', grams: '100g', semaforo: 'GREEN' as const },
    { category: 'grasa', name: 'Frutos secos', portion: '10 unidades', grams: '20g', semaforo: 'GREEN' as const },
    { category: 'grasa', name: 'Pasta 100% maní', portion: '1 cda. sopera', grams: '15g', semaforo: 'GREEN' as const },
    { category: 'grasa', name: 'Queso cremón light', portion: '3 cdas. soperas', grams: '40g', semaforo: 'YELLOW' as const },
    { category: 'grasa', name: 'Mayonesa light', portion: '1½ cdas.', grams: '15g', semaforo: 'YELLOW' as const },
    { category: 'grasa', name: 'Queso de rallar', portion: '2 cdas. soperas', grams: '15g', semaforo: 'YELLOW' as const },
    { category: 'grasa', name: 'Mayonesa común', portion: '2 cdas. soperas', grams: '30g', semaforo: 'RED' as const },
    { category: 'grasa', name: 'Manteca/ghee', portion: '1 cda. sopera', grams: '15g', semaforo: 'RED' as const },
    { category: 'grasa', name: 'Crema', portion: '2 cdas. soperas', grams: '15g', semaforo: 'RED' as const },

    // Prácticos
    { category: 'practico', name: 'Pancakes Granger (3 cdas)', portion: '= 1 cereal + 1 proteína', grams: '', semaforo: 'GREEN' as const },
    { category: 'practico', name: 'Yogur Ser Pro+ (1 pote)', portion: '= 2 proteínas', grams: '', semaforo: 'GREEN' as const },
    { category: 'practico', name: 'Barra Vitalgy/Íntegra', portion: '= 2 cereales', grams: '', semaforo: 'YELLOW' as const },
    { category: 'practico', name: 'Barra íntegra proteica / Ki bar', portion: '= 1 cereal + 1 prote + 1 fruta', grams: '', semaforo: 'YELLOW' as const },
    { category: 'practico', name: 'Barra CRUDDA', portion: '= 1 cereal + 1 proteína', grams: '', semaforo: 'GREEN' as const },
  ];

  await prisma.exchange.createMany({
    data: exchangesData.map(ex => ({ ...ex, mealPlanId: plan.id })),
  });
  console.log('✅ Plan alimentario con', exchangesData.length, 'intercambios');

  // Create upcoming appointment
  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      scheduledDate: new Date('2026-05-15T10:00:00'),
      patientNotes: 'Consultar sobre suplementación de proteína post-entreno.',
      status: 'scheduled',
    },
  });
  console.log('✅ Turno creado');

  console.log('\n🎉 Seed completado!');
  console.log('   Admin: nutri@nutriapp.com / voit2025');
  console.log('   Paciente: julieta@example.com / paciente2025');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
