import { useState } from "react";
import { Check as CheckIcon, Info } from "lucide-react";
import {
  LAYER_ORDER,
  LAYERS,
  layerLabel,
  modulesInLayer,
  type TrainingModule,
} from "../catalog";
import {
  buildResult,
  type CheckResponse,
  type CheckResult,
  lowestLayers,
  QUESTIONS,
  SCALE,
} from "../humanStackCheck";
import { Alert, IconMeta, Label, RowLink, TopBar } from "../ui";

export function CheckIntro({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip?: () => void;
}) {
  return (
    <main className="fa-main fa-glow-mint">
      <div className="fa-flow">
        <div className="fa-flow-body fa-pt-32">
          <p className="fa-term">
            <span className="fa-term-p">$</span> fsh check --human-stack
            <br />
            <span className="fa-term-c">{"// 10 preguntas · ~1 minuto"}</span>
          </p>
          <h1 className="fa-h1 fa-mt-28">
            ¿Cómo sueles responder en situaciones de trabajo?
          </h1>
          <p className="fa-muted fa-mt-14">
            Este check rápido explora algunas habilidades relacionadas con la
            autogestión, la comunicación, la cooperación, la regulación
            emocional y la adaptación.
          </p>
          <p className="fa-mt-14">
            Responde pensando en cómo sueles actuar realmente, no en cómo te
            gustaría actuar.
          </p>
          <div className="fa-mt-24">
            <Alert tone="info" icon={<Info size={20} />}>
              Es un check propio inspirado en el marco BESSI, no el BESSI
              oficial. Si agendas tu primera sesión, aplicaremos la evaluación
              BESSI oficial completa y el Big Five para calibrar tu plan.
            </Alert>
          </div>
        </div>
        <div className="fa-cta">
          <button
            type="button"
            className="fa-btn fa-btn--primary"
            onClick={onStart}
          >
            Haz el Human Stack Check
          </button>
          <p className="fa-xs fa-muted fa-center">
            Completarlo toma aproximadamente 1 minuto.
          </p>
          {onSkip && (
            <button
              type="button"
              className="fa-link fa-center-self"
              onClick={onSkip}
            >
              Hacerlo más tarde
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export function CheckQuestions({
  wallet,
  onExit,
  onComplete,
}: {
  wallet: string;
  onExit: () => void;
  onComplete: (result: CheckResult) => void;
}) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, CheckResponse>>({});
  const question = QUESTIONS[index];
  const total = QUESTIONS.length;
  const selected = responses[question.id]?.response_value;
  const number = String(index + 1).padStart(2, "0");

  function choose(value: number) {
    setResponses((current) => ({
      ...current,
      [question.id]: {
        question_id: question.id,
        dimension: question.dimension,
        response_value: value,
        timestamp: new Date().toISOString(),
      },
    }));
  }

  function next() {
    if (selected === undefined) return;
    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }
    const ordered = QUESTIONS.map((q) => responses[q.id]);
    onComplete(buildResult(wallet, ordered));
  }

  return (
    <main className="fa-main">
      <TopBar
        onBack={() => (index === 0 ? onExit() : setIndex(index - 1))}
        step={`${number} / ${total}`}
      />
      <div className="fa-flow">
        <div className="fa-flow-body">
          <div
            className="fa-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={index + 1}
            aria-label="Progreso del check"
          >
            <i style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
          <Label>Pregunta {index + 1}</Label>
          <h1 className="fa-question" key={question.id} id="fa-question">
            {question.text}
          </h1>
          <div
            className="fa-options"
            role="radiogroup"
            aria-labelledby="fa-question"
          >
            {SCALE.map((option) => {
              const isSelected = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`fa-option ${isSelected ? "is-selected" : ""}`}
                  onClick={() => choose(option.value)}
                >
                  <span className="fa-option-n">{option.value}</span>
                  {option.label}
                  {isSelected && (
                    <CheckIcon
                      size={20}
                      className="fa-option-check"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="fa-cta">
          <button
            type="button"
            className="fa-btn fa-btn--primary"
            disabled={selected === undefined}
            onClick={next}
          >
            {index + 1 < total ? "Siguiente" : "Ver mi resultado"}
          </button>
        </div>
      </div>
    </main>
  );
}

export function CheckResultView({
  result,
  onOpenModule,
  onCatalog,
}: {
  result: CheckResult;
  onOpenModule: (module: TrainingModule) => void;
  onCatalog: () => void;
}) {
  const focus = lowestLayers(result.scores);
  const focusModules = focus.flatMap((layer) => modulesInLayer(layer));

  return (
    <main className="fa-main fa-with-tabs">
      <div className="fa-page">
        <Label>Human Stack Check · resultado</Label>
        <h1 className="fa-h1 fa-mt-12">Tu Human Stack, en 5 capas.</h1>
        <p className="fa-sm fa-muted fa-mt-10">
          Es un perfil exploratorio, no una nota ni un diagnóstico. Cada capa va
          de 2 a 10.
        </p>

        <ul
          className="fa-card fa-dims fa-mt-20"
          aria-label="Resultado por capa"
        >
          {LAYER_ORDER.map((layer) => {
            const info = LAYERS[layer];
            const score = result.scores[layer];
            const isFocus = focus.includes(layer);
            return (
              <li
                key={layer}
                className={`fa-dim ${isFocus ? "is-focus" : ""}`}
                style={isFocus ? { borderColor: `${info.color}73` } : undefined}
              >
                <div className="fa-row fa-between">
                  <p>
                    <b>{info.name}</b>{" "}
                    <span className="fa-sm fa-muted">({info.domain})</span>
                  </p>
                  <p className="fa-score">
                    {score}
                    <small>/10</small>
                  </p>
                </div>
                <div className="fa-bar" aria-hidden="true">
                  <i
                    style={{ width: `${score * 10}%`, background: info.color }}
                  />
                </div>
                <p className="fa-xs fa-muted">{info.description}</p>
                {isFocus && (
                  <p
                    className="fa-xs fa-focus-note"
                    style={{ color: info.color }}
                  >
                    <IconMeta size={16} /> Una capa para empezar a explorar
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {focusModules.length > 0 ? (
          <div className="fa-stack fa-mt-16">
            {focusModules.map((module) => (
              <RowLink key={module.id} onClick={() => onOpenModule(module)}>
                <Label color={LAYERS[module.layer].color}>
                  Módulo disponible en {LAYERS[module.layer].name}
                </Label>
                <b className="fa-h4 fa-mt-8">{module.skill}</b>
                <span className="fa-xs fa-muted">
                  ~5 sesiones · 1 a 1 · en vivo
                </span>
              </RowLink>
            ))}
          </div>
        ) : (
          <p className="fa-sm fa-muted fa-mt-16">
            Aún no hay un módulo disponible en{" "}
            {focus.map((layer) => layerLabel(layer)).join(" ni en ")}. Nuestro
            equipo de psicología suma nuevas habilidades cada mes.
          </p>
        )}

        <button
          type="button"
          className="fa-btn fa-btn--primary fa-mt-16"
          onClick={onCatalog}
        >
          Ver módulos disponibles
        </button>

        <p className="fa-xs fa-muted fa-mt-20 fa-disclaimer">
          <b>Importante:</b> este check es una herramienta exploratoria
          desarrollada por Full Stack Human e inspirada en marcos de
          investigación sobre habilidades sociales, emocionales y conductuales.
          No es el BESSI ni una versión oficial del BESSI, y sus resultados no
          constituyen un diagnóstico psicológico ni una evaluación clínica.
        </p>
      </div>
    </main>
  );
}
