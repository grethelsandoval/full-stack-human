/** Las cinco capas FSH, cada una con su dominio BESSI y su color de marca. */
export type Layer = "runtime" | "api" | "merge" | "firewall" | "fork";

export interface LayerInfo {
  id: Layer;
  name: string;
  domain: string;
  /** Color del dominio (tokens --fsh-domain-*). */
  color: string;
  description: string;
}

export const LAYERS: Record<Layer, LayerInfo> = {
  runtime: {
    id: "runtime",
    name: "Runtime",
    domain: "Autogestión",
    color: "#22C8EE",
    description:
      "Relacionado con la autogestión: organización, gestión del tiempo, consistencia y regulación de la ejecución de tareas.",
  },
  api: {
    id: "api",
    name: "API",
    domain: "Compromiso social",
    color: "#FF6B3D",
    description:
      "Relacionado con el compromiso social: expresión, conversación, persuasión y capacidad de comunicar con otras personas.",
  },
  merge: {
    id: "merge",
    name: "Merge",
    domain: "Cooperación",
    color: "#3CF0B4",
    description:
      "Relacionado con la cooperación: perspectiva de otras personas, confianza, trabajo en equipo y coordinación.",
  },
  firewall: {
    id: "firewall",
    name: "Firewall",
    domain: "Resiliencia emocional",
    color: "#FFC857",
    description:
      "Relacionado con la regulación frente a presión: regulación del estrés, impulsos, frustración y confianza.",
  },
  fork: {
    id: "fork",
    name: "Fork",
    domain: "Innovación",
    color: "#B8F23A",
    description:
      "Relacionado con exploración y adaptación: generación de alternativas, procesamiento de información, creatividad y adaptación.",
  },
};

export const LAYER_ORDER: Layer[] = [
  "runtime",
  "api",
  "merge",
  "firewall",
  "fork",
];

/** "Firewall (Resiliencia emocional)": la capa siempre con su dominio. */
export function layerLabel(layer: Layer) {
  const info = LAYERS[layer];
  return `${info.name} (${info.domain})`;
}

export interface Psychologist {
  name: string;
  initials: string;
  role: string;
  /** Sala de Meet de la psicóloga. Pendiente: generación automática al agendar. */
  meetUrl?: string;
}

export type ModuleIcon = "meta" | "equipo" | "firewall";

export interface TrainingModule {
  id: string;
  skill: string;
  layer: Layer;
  /** Definición operativa FSH (documento de evidencia auditada). */
  definition: string;
  summary: string;
  icon: ModuleIcon;
  psychologist: Psychologist;
}

export const catalog: TrainingModule[] = [
  {
    id: "regulacion-de-metas",
    skill: "Regulación de metas",
    layer: "runtime",
    definition:
      "Fijar objetivos realistas, evaluar avances y reajustar planes.",
    summary:
      "Aterriza objetivos grandes en metas realistas, revisa tu avance y reajusta el plan sin perder el rumbo.",
    icon: "meta",
    psychologist: {
      name: "Madai Aramayo",
      initials: "MA",
      role: "Psicóloga · equipo FSH",
    },
  },
  {
    id: "trabajo-en-equipo",
    skill: "Habilidad de trabajo en equipo",
    layer: "merge",
    definition: "Articular el esfuerzo propio hacia el objetivo común.",
    summary:
      "Ajusta tu forma de trabajar para sumar al objetivo del equipo, también cuando el trabajo es remoto y async.",
    icon: "equipo",
    psychologist: {
      name: "Yohana Condori",
      initials: "YC",
      role: "Psicóloga · equipo FSH",
    },
  },
  {
    id: "regulacion-de-la-confianza",
    skill: "Regulación de la confianza",
    layer: "firewall",
    definition: "Sostener un sentido estable de autoeficacia.",
    summary:
      "Confía en lo que sabes hacer, también cuando algo sale mal o te toca exponer.",
    icon: "firewall",
    psychologist: {
      name: "Shirley Ali",
      initials: "SA",
      role: "Psicóloga · equipo FSH",
    },
  },
];

/** Capas con habilidades que el equipo de psicología aún está diseñando. */
export const UPCOMING_LAYERS: { label: string; color: string }[] = [
  { label: layerLabel("api"), color: LAYERS.api.color },
  { label: layerLabel("fork"), color: LAYERS.fork.color },
  { label: "Transversales", color: "#94A3BD" },
];

export const timeSlots = [
  { label: "09:00", hour: 9, minute: 0 },
  { label: "11:00", hour: 11, minute: 0 },
  { label: "16:00", hour: 16, minute: 0 },
  { label: "18:00", hour: 18, minute: 0 },
  { label: "19:00", hour: 19, minute: 0 },
  { label: "20:00", hour: 20, minute: 0 },
];

export function findModule(id: string | null | undefined) {
  return catalog.find((module) => module.id === id) ?? null;
}

export function modulesInLayer(layer: Layer) {
  return catalog.filter((module) => module.layer === layer);
}
