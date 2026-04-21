export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PATIENT';
  patientId?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { email: string; name: string };
  measurements?: Measurement[];
  mealPlans?: MealPlan[];
  appointments?: Appointment[];
}

export interface Measurement {
  id: string;
  patientId: string;
  measurementNumber: number;
  measurementDate: string;
  weight: number;
  height: number;
  seatedHeight: number | null;
  age: number | null;
  diameters: {
    biacromial: number | null;
    thoraxTransverse: number | null;
    thoraxAP: number | null;
    biIliocrestid: number | null;
    humeral: number | null;
    femoral: number | null;
    head: number | null;
  } | null;
  perimeters: {
    relaxedArm: number | null;
    flexedArm: number | null;
    forearm: number | null;
    mesoChest: number | null;
    minWaist: number | null;
    maxHips: number | null;
    upperThigh: number | null;
    medialThigh: number | null;
    maxCalf: number | null;
  } | null;
  skinfolds: {
    triceps: number | null;
    subscapular: number | null;
    supraspinal: number | null;
    abdominal: number | null;
    medialThigh: number | null;
    calf: number | null;
  } | null;
  bodyComposition: {
    adipose: { kg: number | null; pct: number | null };
    muscle: { kg: number | null; pct: number | null };
    residual: { kg: number | null; pct: number | null };
    bone: { kg: number | null; pct: number | null };
    skin: { kg: number | null; pct: number | null };
  } | null;
  sumOf6Skinfolds: number | null;
  muscleOseousIndex: number | null;
  basalMetabolism: number | null;
  physicalActivityLevel: string | null;
  totalEnergyExpenditure: number | null;
  objectives: {
    targetSkinfolds: number | null;
    adiposeDeficitKg: number | null;
    deficitMonths: number | null;
    targetIMO: number | null;
    muscleGainKg: number | null;
    surplusMonths: number | null;
  } | null;
  pdfUrl: string | null;
  createdAt: string;
}

export interface Prescription {
  moment: string;
  items: string[];
  examples: string[];
}

export interface MealPlan {
  id: string;
  patientId: string;
  planDate: string;
  objective: string;
  prescriptions: Prescription[];
  suggestions: string | null;
  flexFreeMeals: number;
  totalWeeklyMeals: number;
  pdfUrl: string | null;
  isActive: boolean;
  createdAt: string;
  exchanges?: Exchange[];
}

export type Semaforo = 'GREEN' | 'YELLOW' | 'RED';

export interface Exchange {
  id: string;
  mealPlanId: string;
  category: string;
  name: string;
  portion: string;
  grams: string | null;
  semaforo: Semaforo;
}

export interface Recipe {
  title: string;
  ingredients: string;
  instructions: string;
  mealMoment: string;
}

export interface FavoriteRecipe extends Recipe {
  id: string;
  patientId: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  scheduledDate: string;
  patientNotes: string | null;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  measurementsThisMonth: number;
  upcomingAppointments: number;
  plansThisMonth: number;
}
