# VOIT — Nutrición & Composición Corporal

App de seguimiento nutricional con antropometría ISAK y sistema de intercambios.

## Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS v4 + shadcn/ui + Recharts
- **Backend:** Node/Express + TypeScript
- **DB:** PostgreSQL + Prisma ORM
- **IA:** Claude API (claude-sonnet-4-5) para generar ideas de platos

## Setup rápido

### 1. Base de datos

Necesitás PostgreSQL corriendo. Podés usar Docker:

```bash
docker run --name voit-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=voit -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Editá .env con tu DATABASE_URL y ANTHROPIC_API_KEY
npm install
npx prisma generate
npx prisma db push
npm run db:seed    # Carga datos de ejemplo
npm run dev        # Arranca en http://localhost:3001
```

### 3. Frontend

```bash
# Desde la raíz del proyecto (voit-app/)
npm install
npm run dev        # Arranca en http://localhost:5173
```

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Nutricionista (admin) | nutri@voit.com | voit2025 |
| Paciente | julieta@example.com | paciente2025 |

## Estructura del proyecto

```
voit-app/
├── src/                    # Frontend React
│   ├── components/
│   │   ├── layout/         # AppLayout, Sidebar, MobileNav, ThemeToggle
│   │   ├── shared/         # MetricCard, SemaforoBadge, PdfUploader, EmptyState
│   │   └── ui/             # shadcn/ui components
│   ├── pages/
│   │   ├── admin/          # Dashboard, PatientsList, PatientDetail
│   │   └── patient/        # Progress, MealPlan, Recipes, Downloads, Appointment
│   ├── lib/                # API client, mock data, utils
│   ├── store/              # Zustand auth store
│   └── types/              # TypeScript interfaces
├── server/                 # Backend Express
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/         # auth, patients, measurements, mealplans, recipes, appointments
│       ├── services/       # pdfParser, recipeGenerator
│       ├── middleware/      # JWT auth
│       └── seed.ts
└── index.html
```

## Paleta de colores — "Fresh & Minimal"

| Token | Color | Uso |
|-------|-------|-----|
| voit-mint | #8FB09A | Acento principal, gráficos |
| voit-forest | #3D5A4C | Primario, botones, sidebar activo |
| voit-mustard | #F4C95D | Acento secundario, alertas, adiposa |
| voit-dark | #222222 | Texto principal |
| voit-light | #F7F9F8 | Fondos suaves |
