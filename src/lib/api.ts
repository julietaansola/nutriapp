import type {
  AuthResponse, Patient, Measurement, MealPlan,
  DashboardStats, Recipe, FavoriteRecipe, Appointment,
} from '../types';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('voit_token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

// Auth
export const login = (email: string, password: string) =>
  fetchApi<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

// Patients
export const getPatients = (search?: string) =>
  fetchApi<Patient[]>(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const getPatient = (id: string) =>
  fetchApi<Patient>(`/patients/${id}`);

export const getDashboardStats = () =>
  fetchApi<DashboardStats>('/patients/stats');

export const updatePatientNotes = (id: string, notes: string) =>
  fetchApi<{ notes: string }>(`/patients/${id}/notes`, { method: 'PUT', body: JSON.stringify({ notes }) });

// Measurements
export const getMeasurements = (patientId: string) =>
  fetchApi<Measurement[]>(`/measurements/patient/${patientId}`);

export const createMeasurement = (patientId: string, data: Partial<Measurement>) =>
  fetchApi<Measurement>(`/measurements/${patientId}`, { method: 'POST', body: JSON.stringify(data) });

export async function uploadMeasurementPdf(patientId: string, file: File) {
  const token = localStorage.getItem('voit_token');
  const form = new FormData();
  form.append('pdf', file);
  const res = await fetch(`${BASE}/measurements/upload/${patientId}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Error al subir PDF');
  return res.json();
}

// Meal Plans
export const getMealPlans = (patientId: string) =>
  fetchApi<MealPlan[]>(`/mealplans/patient/${patientId}`);

export const getActiveMealPlan = (patientId: string) =>
  fetchApi<MealPlan>(`/mealplans/active/${patientId}`);

export const createMealPlan = (patientId: string, data: any) =>
  fetchApi<MealPlan>(`/mealplans/${patientId}`, { method: 'POST', body: JSON.stringify(data) });

export async function uploadPlanPdf(patientId: string, file: File) {
  const token = localStorage.getItem('voit_token');
  const form = new FormData();
  form.append('pdf', file);
  const res = await fetch(`${BASE}/mealplans/upload/${patientId}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Error al subir PDF');
  return res.json();
}

// Recipes
export const generateRecipes = (patientId: string, mealMoment: string) =>
  fetchApi<Recipe[]>('/recipes/generate', { method: 'POST', body: JSON.stringify({ patientId, mealMoment }) });

export const getFavorites = (patientId: string) =>
  fetchApi<FavoriteRecipe[]>(`/recipes/favorites/${patientId}`);

export const addFavorite = (data: { patientId: string; title: string; ingredients: string; instructions: string; mealMoment: string }) =>
  fetchApi<FavoriteRecipe>('/recipes/favorites', { method: 'POST', body: JSON.stringify(data) });

export const removeFavorite = (id: string) =>
  fetchApi<{ ok: boolean }>(`/recipes/favorites/${id}`, { method: 'DELETE' });

// Appointments
export const getAppointments = (patientId: string) =>
  fetchApi<Appointment[]>(`/appointments/patient/${patientId}`);

export const getNextAppointment = (patientId: string) =>
  fetchApi<Appointment | null>(`/appointments/next/${patientId}`);

export const createAppointment = (data: { patientId: string; scheduledDate: string; patientNotes?: string }) =>
  fetchApi<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) });

export const updateAppointment = (id: string, data: Partial<Appointment>) =>
  fetchApi<Appointment>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
