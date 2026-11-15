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
    domain: "Participación social",
    color: "#FF6B3D",
    description:
      "Relacionado con la participación social: liderazgo, persuasión, expresión, conversación y energía.",
  },
  merge: {
    id: "merge",
    name: "Merge",
    domain: "Cooperación",
    color: "#3CF0B4",
    description:
      "Relacionado con la cooperación: perspectiva de otras personas, confianza, calidez social y trabajo en equipo.",
  },
  firewall: {
    id: "firewall",
    name: "Firewall",
    domain: "Resiliencia emocional",
    color: "#FFC857",
    description:
      "Relacionado con la regulación frente a presión: regulación del estrés, optimismo, manejo del enfado, autoconfianza e impulsos.",
  },
  fork: {
    id: "fork",
    name: "Fork",
    domain: "Innovación",
    color: "#B8F23A",
    description:
      "Relacionado con la innovación: ideas abstractas, creatividad, procesamiento de información y apertura a otras culturas.",
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
  /** Sala fija de Meet de la psicóloga (por ahora, la misma para todas sus sesiones). */
  meetUrl?: string;
}

export type ModuleIcon = "meta" | "equipo" | "firewall";

export interface TrainingModule {
  id: string;
  skill: string;
  layer: Layer;
  /** Definición oficial BESSI-Sp (Postigo et al., 2024, Apéndice B). */
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
    definition: "Establecer metas personales claras y ambiciosas.",
    summary:
      "Define hacia dónde vas, revisa tu avance y ajusta el plan sin perder el rumbo.",
    icon: "meta",
    psychologist: {
      name: "Madai Aramayo",
      initials: "MA",
      role: "Psicóloga · equipo FSH",
      meetUrl: "https://meet.google.com/ntb-rsyr-hnz",
    },
  },
  {
    id: "trabajo-en-equipo",
    skill: "Habilidad para el trabajo en equipo",
    layer: "merge",
    definition: "Trabajar con otros para lograr objetivos compartidos.",
    summary:
      "Ajusta tu forma de trabajar para sumar al objetivo del equipo, también cuando el trabajo es remoto y async.",
    icon: "equipo",
    psychologist: {
      name: "Yohana Condori",
      initials: "YC",
      role: "Psicóloga · equipo FSH",
      meetUrl: "https://meet.google.com/fjo-hygk-bof",
    },
  },
  {
    /* id estable: lo usan reservas y credenciales ya guardadas */
    id: "regulacion-de-la-confianza",
    skill: "Regulación de la autoconfianza",
    layer: "firewall",
    definition: "Mantener una actitud positiva hacia uno mismo.",
    summary:
      "Sostén una mirada positiva sobre ti y lo que sabes hacer, también cuando algo sale mal o te toca exponer.",
    icon: "firewall",
    psychologist: {
      name: "Shirley Ali",
      initials: "SA",
      role: "Psicóloga · equipo FSH",
      meetUrl: "https://meet.google.com/xjx-byis-zvp",
    },
  },
];

/** Capas con habilidades que el equipo de psicología aún está diseñando. */
export const UPCOMING_LAYERS: { label: string; color: string }[] = [
  { label: layerLabel("api"), color: LAYERS.api.color },
  { label: layerLabel("fork"), color: LAYERS.fork.color },
  { label: "Transversales (Habilidades compuestas)", color: "#94A3BD" },
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
