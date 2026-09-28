import {
  BadgeCheck,
  BatteryWarning,
  BookOpenCheck,
  Boxes,
  CalendarCheck,
  ClipboardCheck,
  Code2,
  GitFork,
  Lightbulb,
  Lock,
  MessageSquareText,
  Mic,
  Shield,
  Target,
  Timer,
  Users,
  Wallet,
} from "lucide-react";

export const repository =
  "https://github.com/grethelsandoval/full-stack-human";

export type DomainColor = "cyan" | "coral" | "mint" | "amber" | "lime";

/** Las cinco capas FSH = los cinco dominios BESSI. Un color por capa (manual §06). */
export const domains = [
  {
    layer: "Runtime",
    name: "Autogestión",
    icon: Timer,
    color: "cyan" satisfies DomainColor,
    title: "Tu tiempo, tus metas, tus decisiones.",
    description:
      "Organización, gestión del tiempo, consistencia y regulación de la ejecución de tareas. Es la capa que sostiene todo lo demás.",
    skills: [
      "Gestión del tiempo",
      "Habilidad organizativa",
      "Capacidad de consistencia",
      "Gestión de tareas",
      "Gestión del detalle",
      "Cumplimiento de normas",
      "Gestión de responsabilidades",
      "Regulación de metas",
      "Toma de decisiones",
    ],
    code: "runtime",
  },
  {
    layer: "API",
    name: "Compromiso Social",
    icon: Mic,
    color: "coral" satisfies DomainColor,
    title: "Lo técnico te lleva a la demo. Lo humano, a la ronda.",
    description:
      "Expresión, conversación, persuasión y liderazgo. Cómo comunicas el valor de lo que construyes a personas que deciden.",
    skills: [
      "Habilidad de liderazgo",
      "Habilidad persuasiva",
      "Habilidad expresiva",
      "Habilidad conversacional",
      "Regulación de la energía",
    ],
    code: "api",
  },
  {
    layer: "Merge",
    name: "Cooperación",
    icon: Users,
    color: "mint" satisfies DomainColor,
    title: "Async no es sinónimo de caos.",
    description:
      "Perspectiva de otras personas, confianza, trabajo en equipo y coordinación. La capa que evita los silos en equipos remotos.",
    skills: [
      "Toma de perspectiva",
      "Capacidad de confianza",
      "Calidez social",
      "Habilidad de trabajo en equipo",
      "Competencia ética",
    ],
    code: "merge",
  },
  {
    layer: "Firewall",
    name: "Resiliencia Emocional",
    icon: Shield,
    color: "amber" satisfies DomainColor,
    title: "Burnout no es un feature.",
    description:
      "Regulación del estrés, los impulsos y la frustración; confianza y optimismo. Lo que te protege cuando el deploy falla o el deadline se acerca.",
    skills: [
      "Regulación del estrés",
      "Capacidad de optimismo",
      "Manejo de la ira",
      "Regulación de la confianza",
      "Regulación de impulsos",
    ],
    code: "firewall",
  },
  {
    layer: "Fork",
    name: "Innovación",
    icon: GitFork,
    color: "lime" satisfies DomainColor,
    title: "Abre una rama nueva.",
    description:
      "Generación de alternativas, procesamiento de información, creatividad y adaptación. Explorar sin perder el rumbo.",
    skills: [
      "Pensamiento abstracto",
      "Habilidad creativa",
      "Habilidad artística",
      "Competencia cultural",
      "Procesamiento de información",
    ],
    code: "fork",
  },
] as const;

export const transversalSkills = [
  "Adaptabilidad",
  "Capacidad de independencia",
  "Habilidad de autorreflexión",
];

/** Módulos disponibles en la plataforma (mismo catálogo que /app). */
export const modules = [
  {
    id: "regulacion-de-metas",
    layer: "Runtime",
    domain: "Autogestión",
    color: "cyan" satisfies DomainColor,
    icon: Target,
    title: "Regulación de metas",
    definition: "Fijar objetivos realistas, evaluar avances y reajustar planes.",
    short:
      "Aterriza objetivos grandes en metas realistas, revisa tu avance y reajusta el plan sin perder el rumbo.",
    psychologist: "Madai Aramayo",
  },
  {
    id: "trabajo-en-equipo",
    layer: "Merge",
    domain: "Cooperación",
    color: "mint" satisfies DomainColor,
    icon: Users,
    title: "Habilidad de trabajo en equipo",
    definition: "Articular el esfuerzo propio hacia el objetivo común.",
    short:
      "Ajusta tu forma de trabajar para sumar al objetivo del equipo, también cuando el trabajo es remoto y async.",
    psychologist: "Yohana Condori",
  },
  {
    id: "regulacion-de-la-confianza",
    layer: "Firewall",
    domain: "Resiliencia Emocional",
    color: "amber" satisfies DomainColor,
    icon: Shield,
    title: "Regulación de la confianza",
    definition: "Sostener un sentido estable de autoeficacia.",
    short:
      "Confía en lo que sabes hacer, también cuando algo sale mal o te toca exponer.",
    psychologist: "Shirley Ali",
  },
] as const;

/** Cifras aprobadas · FSH Documento base de evidencia auditada (26 sep 2026). */
export const evidence = [
  {
    id: "oxygen",
    label: "Liderazgo técnico",
    value: "8",
    unit: "de 8",
    text: "Cuando Google estudió qué distinguía a sus mejores managers, la pericia técnica fue la menos determinante de las ocho conductas identificadas.",
    source: "Bock, 2015; Garvin, 2013 (HBR) · Project Oxygen",
    color: "coral" satisfies DomainColor,
    icon: Code2,
  },
  {
    id: "pmi",
    label: "Costo de la comunicación",
    value: "USD 75",
    unit: "M",
    text: "Por cada USD 1.000 millones invertidos en proyectos, USD 135 millones están en riesgo, y el 56 % (USD 75 millones) se debe a una comunicación ineficaz.",
    source: "PMI, 2013 · Pulse of the Profession",
    color: "cyan" satisfies DomainColor,
    icon: MessageSquareText,
  },
  {
    id: "atlassian",
    label: "Eficacia de equipos",
    value: "2",
    unit: "%",
    text: "Solo el 2 % de las organizaciones resultó plenamente eficaz a la vez en alineación de objetivos, planificación y seguimiento, e intercambio de conocimiento.",
    source: "Forrester Consulting para Atlassian · datos de 2023",
    color: "mint" satisfies DomainColor,
    icon: Boxes,
  },
  {
    id: "microsoft",
    label: "Sobrecarga digital",
    value: "68",
    unit: "%",
    text: "de los trabajadores dice no tener suficiente tiempo de concentración ininterrumpida; el 57 % del tiempo se va en reuniones, correo y chat.",
    source: "Microsoft, 2023 · Work Trend Index",
    color: "amber" satisfies DomainColor,
    icon: BatteryWarning,
  },
] as const;

export const bessiFacts = [
  { value: "32", label: "habilidades" },
  { value: "5", label: "dominios" },
  { value: "192", label: "ítems" },
  { value: "7", label: "muestras · N = 6.309" },
];

export const bigFiveExamples = [
  {
    trait: "Apertura",
    text: "Alta: exploración y enfoques nuevos. Baja: pasos concretos y ejemplos probados.",
  },
  {
    trait: "Responsabilidad",
    text: "Alta: metas medibles y seguimiento. Baja: micro-compromisos y recordatorios.",
  },
  {
    trait: "Extraversión",
    text: "Alta: role-play y práctica en voz alta. Baja: preparación previa y ensayo guiado.",
  },
  {
    trait: "Amabilidad",
    text: "Alta: practicar decir que no y negociar. Baja: toma de perspectiva y feedback.",
  },
  {
    trait: "Estabilidad emocional",
    text: "Más reactividad: regulación primero, luego práctica bajo presión.",
  },
];

export const steps = [
  {
    icon: ClipboardCheck,
    title: "Human Stack Check",
    text: "Test rápido de 1 minuto inspirado en el BESSI. Muestra la capa con menor puntaje.",
  },
  {
    icon: Lightbulb,
    title: "Eliges un módulo",
    text: "Una habilidad, la que más te llame. Sin ruta obligatoria; la plataforma puede recomendar.",
  },
  {
    icon: CalendarCheck,
    title: "Agendas y pagas la sesión 1",
    text: "En la plataforma, con el calendario disponible. El pago queda en escrow.",
  },
  {
    icon: BookOpenCheck,
    title: "Sesión 1: BESSI oficial + Big Five",
    text: "Una psicóloga o psicólogo evalúa y calibra tu plan personalizado.",
  },
  {
    icon: Users,
    title: "Sesiones 2 a 5, en vivo",
    text: "1 a 1, 45 minutos por Zoom o Meet, con práctica aplicada a tu trabajo.",
  },
  {
    icon: BadgeCheck,
    title: "Reclamas tu credencial",
    text: "Al confirmar la última sesión: credencial verificable en blockchain. Idealmente, BESSI de nuevo.",
  },
];

export const escrowSteps = [
  { icon: Wallet, text: "Pagas la sesión" },
  { icon: Lock, text: "El contrato inteligente la retiene" },
  { icon: CalendarCheck, text: "La sesión ocurre y se confirma" },
  { icon: BadgeCheck, text: "Se libera el pago" },
];

export const whyUs = [
  {
    title: "Entrenan profesionales",
    text: "Fundada por una psicóloga con experiencia en entrenamiento de habilidades blandas. Entrenan psicólogas y psicólogos del equipo interno.",
  },
  {
    title: "Hablamos tu idioma",
    text: "Traducimos 32 habilidades a capas que un builder entiende: Runtime, API, Merge, Firewall y Fork. Sin jerga de recursos humanos.",
  },
  {
    title: "Medición con evidencia",
    text: "Medición oficial con BESSI y Big Five en la sesión 1 y, al cierre, para ver el avance. Solo cifras con fuente primaria auditada.",
  },
  {
    title: "Confianza nativa",
    text: "Escrow sesión a sesión y credenciales verificables en blockchain: la infraestructura que el ecosistema ya usa.",
  },
];
