import { catalog, type TrainingModule } from "./catalog";

export type Domain =
  | "autogestion"
  | "compromiso"
  | "cooperacion"
  | "resiliencia"
  | "innovacion";

export const DOMAIN_LABELS: Record<Domain, string> = {
  autogestion: "Autogestión",
  compromiso: "Compromiso Social",
  cooperacion: "Cooperación",
  resiliencia: "Resiliencia Emocional",
  innovacion: "Innovación",
};

export interface Question {
  id: string;
  domain: Domain;
  prompt: string;
  hint: string;
}

/** Likert options shown as typeform-style choices; value 1 (nunca) … 5 (siempre). */
export const ANSWERS: { value: number; label: string }[] = [
  { value: 1, label: "Casi nunca" },
  { value: 2, label: "Pocas veces" },
  { value: 3, label: "A veces" },
  { value: 4, label: "Con frecuencia" },
  { value: 5, label: "Casi siempre" },
];

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    domain: "compromiso",
    prompt:
      "Cuando presento mi proyecto a inversores o a un comité de grants, transmito la idea con claridad y seguridad.",
    hint: "Pitch, demo day, community call.",
  },
  {
    id: "q2",
    domain: "compromiso",
    prompt:
      "Me resulta fácil tomar la palabra y defender una propuesta técnica frente a un grupo que no conozco.",
    hint: "Hackathons, meetups, entrevistas.",
  },
  {
    id: "q3",
    domain: "resiliencia",
    prompt:
      "Durante un incidente en producción o un sprint intenso, mantengo la calma y pienso con claridad.",
    hint: "Mainnet, deadlines, bugs críticos.",
  },
  {
    id: "q4",
    domain: "resiliencia",
    prompt:
      "Después de semanas de mucho trabajo, logro desconectar y recuperar energía sin llegar al burnout.",
    hint: "Descanso, límites, recuperación.",
  },
  {
    id: "q5",
    domain: "cooperacion",
    prompt:
      "Cuando hay un desacuerdo técnico en el equipo, lo resuelvo escuchando y negociando sin que escale.",
    hint: "Code reviews, decisiones de arquitectura.",
  },
  {
    id: "q6",
    domain: "cooperacion",
    prompt:
      "Doy feedback difícil a un compañero de forma directa y respetuosa.",
    hint: "Retros, 1:1, pull requests.",
  },
  {
    id: "q7",
    domain: "autogestion",
    prompt:
      "Planifico mis entregas y cumplo los milestones que prometo sin sobrecargarme.",
    hint: "Roadmap, grants con hitos, estimaciones.",
  },
  {
    id: "q8",
    domain: "autogestion",
    prompt:
      "Mantengo el foco en lo importante aunque aparezcan distracciones o nuevas ideas.",
    hint: "Priorización, deep work.",
  },
  {
    id: "q9",
    domain: "innovacion",
    prompt:
      "Cuando el feedback de los usuarios contradice mi plan, reencuadro el producto con curiosidad en vez de defenderlo.",
    hint: "Pivotes, descubrimiento de producto.",
  },
  {
    id: "q10",
    domain: "innovacion",
    prompt:
      "Genero alternativas creativas cuando el camino técnico obvio no funciona.",
    hint: "Diseño de soluciones, exploración.",
  },
];

export const DOMAINS: Domain[] = [
  "autogestion",
  "compromiso",
  "cooperacion",
  "resiliencia",
  "innovacion",
];

export type Answers = Record<string, number>;

export interface DomainScore {
  domain: Domain;
  label: string;
  /** 0–100 */
  score: number;
}

export interface DiagnosticResult {
  wallet: string;
  answers: Answers;
  scores: DomainScore[];
  /** Domains with the lowest scores: where training pays off the most. */
  focus: Domain[];
  strengths: Domain[];
  recommendedModuleId: string;
  completedAt: string;
}

/** The only module currently taught by the trainer (Lic. Madai Aramayo). */
export const RECOMMENDED_MODULE_ID = "FSH-MOD-01";

export function recommendedModule(): TrainingModule {
  return (
    catalog.find((module) => module.id === RECOMMENDED_MODULE_ID) ?? catalog[0]
  );
}

export function scoreAnswers(answers: Answers): DomainScore[] {
  return DOMAINS.map((domain) => {
    const values = QUESTIONS.filter((q) => q.domain === domain).map(
      (q) => answers[q.id] ?? 3,
    );
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return {
      domain,
      label: DOMAIN_LABELS[domain],
      score: Math.round(((mean - 1) / 4) * 100),
    };
  });
}

export function buildResult(
  wallet: string,
  answers: Answers,
  now = new Date(),
): DiagnosticResult {
  const scores = scoreAnswers(answers);
  const ordered = [...scores].sort((a, b) => a.score - b.score);
  return {
    wallet,
    answers,
    scores,
    focus: ordered.slice(0, 2).map((s) => s.domain),
    strengths: ordered
      .slice(-2)
      .reverse()
      .map((s) => s.domain),
    recommendedModuleId: RECOMMENDED_MODULE_ID,
    completedAt: now.toISOString(),
  };
}

const KEY = "fsh-hub:diagnostic";

function storageKey(wallet: string) {
  return `${KEY}:${wallet}`;
}

export function loadDiagnostic(wallet: string): DiagnosticResult | null {
  try {
    const raw = window.localStorage.getItem(storageKey(wallet));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDiagnostic(result: DiagnosticResult) {
  window.localStorage.setItem(
    storageKey(result.wallet),
    JSON.stringify(result),
  );
}

export function clearDiagnostic(wallet: string) {
  window.localStorage.removeItem(storageKey(wallet));
}

function isResult(value: unknown): value is DiagnosticResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "wallet" in value &&
    typeof value.wallet === "string" &&
    "scores" in value &&
    Array.isArray(value.scores) &&
    "focus" in value &&
    Array.isArray(value.focus)
  );
}
