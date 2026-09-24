import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { TOUR_STEPS } from "../onboarding";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(target: string): Rect | null {
  const element = document.querySelector<HTMLElement>(
    `[data-tour="${target}"]`,
  );
  if (!element) return null;
  const box = element.getBoundingClientRect();
  return { top: box.top, left: box.left, width: box.width, height: box.height };
}

export default function OnboardingTour({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = TOUR_STEPS[index];
  const last = index === TOUR_STEPS.length - 1;

  useLayoutEffect(() => {
    const element = document.querySelector<HTMLElement>(
      `[data-tour="${step.target}"]`,
    );
    if (element && typeof element.scrollIntoView === "function")
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => setRect(measure(step.target));
    update();
    const timer = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [step.target]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFinish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFinish]);

  const pad = 8;
  const placeBelow =
    rect !== null && rect.top + rect.height + 200 < window.innerHeight;
  const tipStyle = rect
    ? placeBelow
      ? { top: rect.top + rect.height + pad * 2 }
      : { top: Math.max(pad, rect.top - pad * 2) }
    : { top: "40%" };

  return (
    <div
      className="da-tour"
      role="dialog"
      aria-modal="true"
      aria-label="Guía de inicio"
    >
      {rect ? (
        <div
          className="da-tour-spot"
          aria-hidden="true"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
          onClick={onFinish}
        />
      ) : (
        <div className="da-tour-backdrop" onClick={onFinish} />
      )}
      <section
        className={`da-tour-tip ${rect && !placeBelow ? "above" : ""}`}
        style={tipStyle}
      >
        <header>
          <span className="da-mono">
            {index + 1} / {TOUR_STEPS.length}
          </span>
          <button
            type="button"
            className="da-icon-button"
            aria-label="Cerrar guía"
            onClick={onFinish}
          >
            <X size={16} />
          </button>
        </header>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <footer>
          <button type="button" className="da-quiz-skip" onClick={onFinish}>
            Omitir
          </button>
          <div>
            {index > 0 && (
              <button
                type="button"
                className="da-button da-button-ghost"
                onClick={() => setIndex(index - 1)}
              >
                Anterior
              </button>
            )}
            <button
              type="button"
              className="da-button da-button-primary"
              onClick={() => (last ? onFinish() : setIndex(index + 1))}
            >
              {last ? "¡Listo!" : "Siguiente"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
