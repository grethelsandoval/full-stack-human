export interface TrainingPhase {
  title: string;
  duration: string;
  description: string;
}

export interface Outcome {
  title: string;
  description: string;
}

export interface TrainingModule {
  id: string;
  code: string;
  domain: string;
  domainTone: "blue" | "violet" | "mint";
  title: string;
  shortTitle: string;
  summary: string;
  weeks: string;
  sessions: number;
  outcomes: Outcome[];
  phases: TrainingPhase[];
}

export const trainer = {
  name: "Lic. Madai Aramayo",
  role: "Entrenadora de Habilidades Blandas",
  faculty: "FSH Hub Core Faculty",
  bio: "Psicóloga profesional especializada en desarrollo conductual y facilitación de habilidades socioemocionales, enfocada en la adaptación de metodologías científicas para profesionales del ecosistema tech.",
  badges: ["Certificada FSH", "Big Five Assessor", "+140 Devs Evaluados"],
};

const finalPhase: TrainingPhase = {
  title: "Evaluación y Credencial ACTA",
  duration: "Blockchain",
  description:
    "Revisión final de competencia demostrada y emisión on-chain del certificado verificable en Stellar.",
};

export const catalog: TrainingModule[] = [
  {
    id: "FSH-MOD-01",
    code: "01",
    domain: "Comunicación",
    domainTone: "blue",
    title: "Pitches de Alto Impacto",
    shortTitle: "Módulo Pitches de Alto Impacto",
    summary:
      "Estructura narrativa, modulación y persuasión. Aprende a comunicar ideas complejas de forma sintética ante inversores o equipos.",
    weeks: "2 semanas",
    sessions: 5,
    outcomes: [
      {
        title: "Narrativa que Convence",
        description:
          "Estructura un pitch de 3 minutos que conecta el problema, la solución y la tracción sin perder a la audiencia.",
      },
      {
        title: "Presencia Vocal",
        description:
          "Modula ritmo, pausas y energía para proyectar confianza ante VCs, jurados de grants y comunidades.",
      },
      {
        title: "Objeciones en Vivo",
        description:
          "Responde preguntas difíciles con argumentos sintéticos y sin perder la calma frente a inversores.",
      },
      {
        title: "Estilo por Personalidad",
        description:
          "Adapta tu comunicación a tu perfil Big Five para persuadir desde tus fortalezas, sin actuar un personaje.",
      },
    ],
    phases: [
      {
        title: "Diagnóstico de Estilo Comunicativo",
        duration: "45m",
        description:
          "Evaluación Big Five + BESSI orientada a identificar tus fortalezas expresivas y puntos de fricción al presentar.",
      },
      {
        title: "Arquitectura del Pitch",
        duration: "45m",
        description:
          "Plantillas narrativas para traducir arquitectura técnica en una historia clara para inversores y equipos.",
      },
      {
        title: "Modulación y Presencia",
        duration: "45m",
        description:
          "Entrenamiento vocal y corporal con feedback grabado para proyectar confianza y entusiasmo.",
      },
      {
        title: "Simulación con Objeciones",
        duration: "45m",
        description:
          "Ronda de preguntas difíciles en formato demo day para practicar respuestas sintéticas bajo presión.",
      },
      finalPhase,
    ],
  },
  {
    id: "FSH-MOD-02",
    code: "02",
    domain: "Autorregulación",
    domainTone: "violet",
    title: "Gestión del Estrés y Regulación Emocional",
    shortTitle: "Módulo Regulación Emocional",
    summary:
      "Foco bajo presión, biofeedback y compostura ejecutiva. Diseñado para momentos de alta incertidumbre en entornos descentralizados.",
    weeks: "2 semanas",
    sessions: 5,
    outcomes: [
      {
        title: "Lectura de Señales",
        description:
          "Detecta temprano las señales físicas y cognitivas del estrés antes de que afecten tus decisiones técnicas.",
      },
      {
        title: "Regulación en Vivo",
        description:
          "Aplica técnicas de respiración y reencuadre cuando el deploy falla o el mercado se mueve en tu contra.",
      },
      {
        title: "Límites Sostenibles",
        description:
          "Diseña rutinas de recuperación compatibles con hackathons, mainnets y equipos distribuidos.",
      },
      {
        title: "Plan Anti-Burnout",
        description:
          "Construye un sistema personal de prevención alineado a tu perfil Big Five y a tu ritmo real de trabajo.",
      },
    ],
    phases: [
      {
        title: "Diagnóstico de Estrés y Recuperación",
        duration: "45m",
        description:
          "Evaluación Big Five + BESSI centrada en tolerancia al estrés, recuperación y patrones de sobrecarga.",
      },
      {
        title: "Herramientas de Regulación",
        duration: "45m",
        description:
          "Técnicas de biofeedback, respiración y reencuadre cognitivo para momentos de alta incertidumbre.",
      },
      {
        title: "Compostura Ejecutiva",
        duration: "45m",
        description:
          "Toma de decisiones bajo presión con simulaciones de incidentes y deadlines críticos.",
      },
      {
        title: "Rutinas Sostenibles",
        duration: "45m",
        description:
          "Diseño de límites, descansos y rituales de recuperación compatibles con tu flujo de trabajo.",
      },
      finalPhase,
    ],
  },
  {
    id: "FSH-MOD-03",
    code: "03",
    domain: "Autorregulación",
    domainTone: "mint",
    title: "Regulación y Ejecución de Metas en Entornos Tech",
    shortTitle: "Módulo Regulación de Metas",
    summary:
      "Alinea tu psicología conductual con la entrega ágil de software y sprints de alto impacto. Descomposición de metas y persistencia adaptativa.",
    weeks: "2 semanas",
    sessions: 5,
    outcomes: [
      {
        title: "De la Idea al Roadmap",
        description:
          "Traduce objetivos complejos en sprints de trabajo diarios manejables sin abrumarte ni saturar tu memoria de trabajo.",
      },
      {
        title: "Gestión de Bloqueos",
        description:
          "Adapta tu planificación ante cambios súbitos de requerimiento o scope creep sin perder la cadencia técnica.",
      },
      {
        title: "Persistencia Adaptativa",
        description:
          "Aprende a diferenciar el foco obstinado del desgaste estéril: reconoce cuándo persistir y cuándo pivotar tácticamente.",
      },
      {
        title: "Estrategia por Personalidad",
        description:
          "Diseña un sistema operativo personal de metas sincronizado a tu perfil Big Five, mitigando dispersión y perfeccionismo paralizante.",
      },
    ],
    phases: [
      {
        title: "Diagnóstico de Estilo de Regulación",
        duration: "45m",
        description:
          "Evaluación Big Five + BESSI orientada a resolver patrones de fricción individual y calibración de objetivos.",
      },
      {
        title: "Operacionalización de Metas",
        duration: "45m",
        description:
          "Descomposición de metas en hitos técnicos claros mediante plantillas de ingeniería de comportamiento.",
      },
      {
        title: "Monitoreo de Progreso Activo",
        duration: "45m",
        description:
          "Detección temprana de desviaciones emocionales y técnicas frente a la presión de entrega continua.",
      },
      {
        title: "Persistencia y Pivotes Tácticos",
        duration: "45m",
        description:
          "Matriz de decisión para validar refactorización de objetivos frente a fricciones del mercado o la arquitectura.",
      },
      finalPhase,
    ],
  },
];

export const timeSlots = [
  { label: "09:00 AM", hour: 9, minute: 0, available: true },
  { label: "11:30 AM", hour: 11, minute: 30, available: true },
  { label: "03:00 PM", hour: 15, minute: 0, available: true },
  { label: "04:00 PM", hour: 16, minute: 0, available: true },
  { label: "05:30 PM", hour: 17, minute: 30, available: true },
  { label: "07:00 PM", hour: 19, minute: 0, available: false },
];

export function findModule(id: string | null | undefined) {
  return catalog.find((module) => module.id === id) ?? null;
}
