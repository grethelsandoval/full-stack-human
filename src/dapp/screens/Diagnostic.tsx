import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { trainer } from "../catalog";
import {
  ANSWERS,
  type Answers,
  buildResult,
  type DiagnosticResult,
  DOMAIN_LABELS,
  QUESTIONS,
  recommendedModule,
} from "../diagnostic";
import { NetworkPill } from "../ui";

export function Questionnaire({
  wallet,
  onComplete,
  onSkip,
}: {
  wallet: string;
  onComplete: (result: DiagnosticResult) => void;
  onSkip: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const question = QUESTIONS[index];
  const total = QUESTIONS.length;
  const progress = Math.round((index / total) * 100);

  function answer(value: number) {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (index + 1 < total) setIndex(index + 1);
    else onComplete(buildResult(wallet, next));
  }

  return (
    <main className="da-main da-quiz" aria-labelledby="quiz-title">
      <div className="da-quiz-top">
        <span className="da-tag violet">
          <BrainCircuit size={12} /> Diagnóstico BESSI
        </span>
        <NetworkPill compact />
      </div>
      <div
        className="da-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progreso del diagnóstico"
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="da-quiz-step">
        Pregunta {index + 1} de {total} ·{" "}
        <em>{DOMAIN_LABELS[question.domain]}</em>
      </p>
      <h1 id="quiz-title" key={question.id} className="da-quiz-prompt">
        {question.prompt}
      </h1>
      <p className="da-muted">{question.hint}</p>
      <div className="da-quiz-options" role="group" aria-label="Respuestas">
        {ANSWERS.map((option, i) => (
          <button
            key={option.value}
            type="button"
            className={`da-quiz-option ${
              answers[question.id] === option.value ? "selected" : ""
            }`}
            onClick={() => answer(option.value)}
          >
            <kbd>{String.fromCharCode(65 + i)}</kbd>
            {option.label}
          </button>
        ))}
      </div>
      <div className="da-quiz-nav">
        <button
          type="button"
          className="da-button da-button-ghost"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <ArrowLeft size={16} /> Anterior
        </button>
        <button type="button" className="da-quiz-skip" onClick={onSkip}>
          Saltar por ahora
        </button>
      </div>
    </main>
  );
}

export function DiagnosticResults({
  result,
  onOpenModule,
  onDashboard,
}: {
  result: DiagnosticResult;
  onOpenModule: (moduleId: string) => void;
  onDashboard: () => void;
}) {
  const module = recommendedModule();
  return (
    <main className="da-main" aria-labelledby="results-title">
      <section className="da-card da-intro">
        <span className="da-tag mint">
          <Sparkles size={12} /> Resultados
        </span>
        <h1 id="results-title">Tu perfil de habilidades</h1>
        <p>
          Estimación inicial por dominio BESSI a partir de tus respuestas. Un
          puntaje bajo no es un defecto: es donde el entrenamiento rinde más.
        </p>
      </section>

      <section className="da-card" aria-label="Puntaje por dominio">
        <ul className="da-scores">
          {result.scores.map((item) => (
            <li
              key={item.domain}
              className={result.focus.includes(item.domain) ? "focus" : ""}
            >
              <div className="da-score-head">
                <span>{item.label}</span>
                <strong>{item.score}</strong>
              </div>
              <div className="da-score-bar" aria-hidden="true">
                <span style={{ width: `${item.score}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <dl className="da-kv">
          <div>
            <dt>
              <Target size={14} /> Prioridad de entrenamiento
            </dt>
            <dd>{result.focus.map((d) => DOMAIN_LABELS[d]).join(" · ")}</dd>
          </div>
          <div>
            <dt>
              <Sparkles size={14} /> Fortalezas
            </dt>
            <dd>{result.strengths.map((d) => DOMAIN_LABELS[d]).join(" · ")}</dd>
          </div>
        </dl>
      </section>

      <section className="da-card da-recommend" aria-labelledby="reco-title">
        <span className={`da-tag ${module.domainTone}`}>
          Recomendado por {trainer.name}
        </span>
        <h2 id="reco-title">{module.title}</h2>
        <p className="da-muted">{module.summary}</p>
        <p className="da-muted">
          Es el módulo disponible hoy en FSH Hub; su primera sesión es un
          diagnóstico Big Five + BESSI en vivo que afina estos resultados.
        </p>
        <div className="da-wallet-actions">
          <button
            type="button"
            className="da-button da-button-primary"
            onClick={() => onOpenModule(module.id)}
          >
            Ver módulo recomendado <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="da-button da-button-ghost"
            onClick={onDashboard}
          >
            Ir al dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
