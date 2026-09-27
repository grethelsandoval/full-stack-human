import type { Layer } from "./catalog";
import { LAYER_ORDER } from "./catalog";

/**
 * Human Stack Check — V1 / 10 ítems.
 * Check exploratorio propio inspirado en el marco BESSI; no es el BESSI.
 * Tres capas separadas: pregunta (texto), variable de medición y resultado.
 */

export const CHECK_VERSION = "hsc-v1";

export interface CheckQuestion {
  /** 1–10, orden fijo de la V1. */
  id: number;
  /** Variable de medición, p. ej. runtime_q1. */
  variable: string;
  dimension: Layer;
  /** Área explorada (mapeo interno, no se muestra). */
  area: string;
  text: string;
}

export const QUESTIONS: CheckQuestion[] = [
  {
    id: 1,
    variable: "runtime_q1",
    dimension: "runtime",
    area: "Gestión del tiempo / organización",
    text: "Cuando tengo varias cosas importantes que hacer, decido qué atender primero y organizo mi tiempo para avanzar.",
  },
  {
    id: 2,
    variable: "runtime_q2",
    dimension: "runtime",
    area: "Consistencia / mantenimiento del esfuerzo",
    text: "Aunque una tarea se vuelva repetitiva o me canse, consigo mantener el esfuerzo hasta terminarla.",
  },
  {
    id: 3,
    variable: "api_q1",
    dimension: "api",
    area: "Persuasión / expresión",
    text: "Cuando necesito que otras personas apoyen una idea, adapto la forma en que la explico para que resulte clara y convincente.",
  },
  {
    id: 4,
    variable: "api_q2",
    dimension: "api",
    area: "Expresión / conversación",
    text: "En una conversación difícil, puedo expresar lo que pienso sin perder claridad ni respeto por la otra persona.",
  },
  {
    id: 5,
    variable: "merge_q1",
    dimension: "merge",
    area: "Toma de perspectiva",
    text: "Antes de reaccionar ante una decisión de otra persona, intento entender qué puede estar viendo o pensando desde su posición.",
  },
  {
    id: 6,
    variable: "merge_q2",
    dimension: "merge",
    area: "Trabajo en equipo / cooperación",
    text: "Cuando trabajo con otras personas, ajusto mi manera de trabajar para contribuir al objetivo común.",
  },
  {
    id: 7,
    variable: "firewall_q1",
    dimension: "firewall",
    area: "Regulación emocional / frustración",
    text: "Cuando algo no sale como esperaba, puedo recuperar el equilibrio y seguir actuando sin quedar atrapado en la frustración.",
  },
  {
    id: 8,
    variable: "firewall_q2",
    dimension: "firewall",
    area: "Regulación de impulsos / presión",
    text: "Cuando estoy bajo presión, consigo frenar una reacción impulsiva antes de actuar.",
  },
  {
    id: 9,
    variable: "fork_q1",
    dimension: "fork",
    area: "Creatividad / generación de alternativas",
    text: "Cuando una solución habitual no funciona, puedo generar alternativas diferentes en lugar de insistir siempre con la misma.",
  },
  {
    id: 10,
    variable: "fork_q2",
    dimension: "fork",
    area: "Adaptabilidad / procesamiento de información",
    text: "Cuando aparece información nueva que cambia el problema, puedo revisar mi enfoque y modificar el plan.",
  },
];

export const SCALE: { value: number; label: string }[] = [
  { value: 1, label: "Casi nunca" },
  { value: 2, label: "Pocas veces" },
  { value: 3, label: "A veces" },
  { value: 4, label: "Muchas veces" },
  { value: 5, label: "Casi siempre" },
];

/** Una respuesta individual, tal como pide la especificación. */
export interface CheckResponse {
  question_id: number;
  dimension: Layer;
  response_value: number;
  timestamp: string;
}

/** Puntuación por dimensión: suma de sus dos ítems (rango 2–10). */
export type CheckScores = Record<Layer, number>;

export interface CheckResult {
  wallet: string;
  version: string;
  responses: CheckResponse[];
  scores: CheckScores;
  completedAt: string;
}

export function scoreResponses(responses: CheckResponse[]): CheckScores {
  const scores = { runtime: 0, api: 0, merge: 0, firewall: 0, fork: 0 };
  for (const response of responses) {
    scores[response.dimension] += response.response_value;
  }
  return scores;
}

export function buildResult(
  wallet: string,
  responses: CheckResponse[],
  now = new Date(),
): CheckResult {
  return {
    wallet,
    version: CHECK_VERSION,
    responses,
    scores: scoreResponses(responses),
    completedAt: now.toISOString(),
  };
}

/** Capas con la puntuación exploratoria menor (puede haber empate). */
export function lowestLayers(scores: CheckScores): Layer[] {
  const min = Math.min(...LAYER_ORDER.map((layer) => scores[layer]));
  return LAYER_ORDER.filter((layer) => scores[layer] === min);
}

const KEY = "fsh-hub:human-stack-check";

function storageKey(wallet: string) {
  return `${KEY}:${wallet}`;
}

export function loadCheck(wallet: string): CheckResult | null {
  try {
    const raw = window.localStorage.getItem(storageKey(wallet));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCheck(result: CheckResult) {
  try {
    window.localStorage.setItem(
      storageKey(result.wallet),
      JSON.stringify(result),
    );
  } catch {
    /* storage unavailable: the result lives only for this visit */
  }
}

export function clearCheck(wallet: string) {
  try {
    window.localStorage.removeItem(storageKey(wallet));
  } catch {
    /* storage unavailable */
  }
}

function isResult(value: unknown): value is CheckResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === CHECK_VERSION &&
    "scores" in value &&
    typeof value.scores === "object" &&
    "responses" in value &&
    Array.isArray(value.responses)
  );
}
