import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  BookOpen,
  Braces,
  Check,
  CheckCheck,
  ChevronRight,
  Code2,
  ExternalLink,
  Fingerprint,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Menu,
  Mic2,
  Network,
  Orbit,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import HumanCore from "./HumanCore";
import Modal from "./Modal";
import { domains, modules, repository, trainerValues } from "./data";

type ModalState =
  | { type: "booking"; index: number }
  | { type: "credential" }
  | { type: "terms" }
  | null;

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a href="#inicio" className="brand" aria-label="FSH Hub — inicio">
      <span className="brand-icon">
        <Braces size={32} strokeWidth={1.6} />
        <span />
      </span>
      <span>
        fsh<span className="brand-divider">/</span>hub
        {footer && <small>FULL STACK HUMAN</small>}
      </span>
    </a>
  );
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="eyebrow">
      <span>{number}</span>
      <span className="eyebrow-line" />
      {children}
    </p>
  );
}

function BookingForm({ index }: { index: number }) {
  const module = modules[index];
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [request, setRequest] = useState("");
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dateInput = form.elements.namedItem("date") as HTMLInputElement;
    const start = new Date(`${date}T${time}`);
    dateInput.setCustomValidity(
      start <= new Date() ? "Elige una fecha y hora futuras." : "",
    );
    if (!form.reportValidity()) return;
    const body = `Hola, me gustaría coordinar una sesión del módulo ${module.id}: ${module.title}.\n\nHorario propuesto: ${date}, ${time} (${timezone}).\n\nQuedo a la espera de confirmar disponibilidad con el equipo.\n\nPor favor, no compartas datos personales en este hilo público.`;
    setRequest(
      `${repository}/issues/new?title=${encodeURIComponent(`Solicitud de sesión — Módulo ${module.id}`)}&body=${encodeURIComponent(body)}`,
    );
  }

  return (
    <>
      <div className={`booking-module ${module.color}`}>
        <module.icon size={25} />
        <div>
          <small>
            MÓDULO {module.id} · {module.domain}
          </small>
          <h3>{module.title}</h3>
        </div>
      </div>
      <p className="modal-description">
        Propón un horario para trabajar estas habilidades con una entrenadora.
        El equipo confirmará la disponibilidad contigo.
      </p>
      <div className="booking-skills">
        {module.skills.map((skill) => (
          <span key={skill}>
            <Check size={14} />
            {skill}
          </span>
        ))}
      </div>
      <form onSubmit={prepareRequest}>
        <div className="form-grid">
          <label>
            Fecha propuesta
            <input
              name="date"
              aria-label="Fecha propuesta"
              type="date"
              min={today}
              value={date}
              required
              onChange={(e) => {
                setDate(e.target.value);
                e.target.setCustomValidity("");
                setRequest("");
              }}
            />
          </label>
          <label>
            Hora local
            <input
              aria-label="Hora local"
              type="time"
              value={time}
              required
              onChange={(e) => {
                setTime(e.target.value);
                const dateInput = e.target.form?.elements.namedItem("date");
                if (dateInput instanceof HTMLInputElement)
                  dateInput.setCustomValidity("");
                setRequest("");
              }}
            />
          </label>
        </div>
        <p className="form-note">
          Zona horaria: {timezone}. El horario todavía no está reservado.
        </p>
        {request ? (
          <div className="request-ready" role="status">
            <p>
              <CheckCheck size={18} /> Tu propuesta está lista.
            </p>
            <a
              className="button button-primary"
              href={request}
              target="_blank"
              rel="noreferrer"
            >
              Enviar solicitud en GitHub <ArrowUpRight size={17} />
            </a>
            <small>
              Revisa y publica la solicitud en GitHub para enviarla. Necesitarás
              una cuenta. No incluyas datos personales.
            </small>
          </div>
        ) : (
          <button type="submit" className="button button-primary w-full">
            Preparar solicitud <ArrowRight size={17} />
          </button>
        )}
      </form>
      <p className="privacy-note">
        <LockKeyhole size={13} /> No almacenamos tus datos en esta página.
      </p>
    </>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const domain = domains[activeDomain];
  const navLinks = [
    ["Metodología", "#metodologia"],
    ["Módulos", "#modulos"],
    ["Certificación", "#certificacion"],
    ["Entrenadoras", "#entrenadoras"],
  ];

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % domains.length;
    else if (event.key === "ArrowLeft")
      next = (index + domains.length - 1) % domains.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = domains.length - 1;
    else return;
    event.preventDefault();
    setActiveDomain(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="container nav">
          <Brand />
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <a href="#modulos" className="nav-cta">
            Comienza tu evolución <ArrowUpRight size={16} />
          </a>
          <button
            className="icon-button mobile-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Navegación móvil"
          >
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="contenido">
        <section className="hero grid-background" id="inicio">
          <div className="hero-ambient" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="ecosystem-badge">
                <span className="status-dot" />
                Powered by Stellar & Soroban Ecosystem
                <ArrowUpRight size={12} />
              </div>
              <h1>
                Tu arquitectura técnica
                <br className="desktop-break" /> ya es fuerte.
                <br />
                <span className="gradient-text">
                  Ahora fortalece tu
                  <br className="desktop-break" /> arquitectura humana.
                </span>
              </h1>
              <p className="hero-description">
                La plataforma de entrenamiento personalizado de habilidades
                blandas para builders en Web3, basada en evidencia científica{" "}
                <strong>(BESSI + Big Five)</strong> y certificada On-Chain en
                Stellar.
              </p>
              <div className="hero-actions">
                <a href="#modulos" className="button button-primary">
                  Explorar Módulos
                  <ArrowRight size={17} />
                </a>
                <a href="#certificacion" className="button button-secondary">
                  <ShieldCheck size={17} />
                  Ver Certificación en Stellar
                </a>
              </div>
              <div className="hero-proof">
                <span>
                  <Check size={13} /> Basado en ciencia
                </span>
                <span>
                  <Check size={13} /> Diseñado para builders
                </span>
                <span>
                  <Check size={13} /> Human-first
                </span>
              </div>
            </div>
            <HumanCore />
          </div>
          <div className="container hero-bottom">
            <span>EL SIGUIENTE NIVEL NO ESTÁ SOLO EN TU CÓDIGO.</span>
            <a
              href="#impacto"
              aria-label="Descubrir el impacto de las habilidades blandas"
            >
              <ArrowDown size={17} />
            </a>
            <span>ESTÁ EN TI.</span>
          </div>
        </section>

        <div className="ecosystem-strip">
          <div className="container ecosystem-inner">
            <span className="ecosystem-caption">
              HABILIDADES HUMANAS.
              <br />
              <strong>INFRAESTRUCTURA WEB3.</strong>
            </span>
            <span className="ecosystem-wordmark">
              <Orbit />
              Stellar
            </span>
            <span className="ecosystem-wordmark soroban">
              <Blocks />
              soroban
            </span>
            <span className="ecosystem-wordmark acta">
              <Layers3 />
              ACTA<span className="protocol-label">PROTOCOL</span>
            </span>
            <span className="ecosystem-research">
              <Fingerprint />
              BESSI <span>+</span> Big Five
            </span>
          </div>
        </div>

        <section id="impacto" className="section impact-section">
          <div className="container">
            <div className="section-heading heading-split">
              <div>
                <SectionLabel number="01">EL FACTOR HUMANO</SectionLabel>
                <h2>
                  El costo real de ignorar las
                  <br className="desktop-break" /> habilidades blandas en Web3
                  <span className="text-violet-400">.</span>
                </h2>
              </div>
              <p>
                Un código impecable no lo resuelve todo.
                <br />
                Las habilidades humanas marcan la diferencia
                <br className="desktop-break" /> entre construir y generar
                impacto.
              </p>
            </div>
            <div className="metrics-grid">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="small-icon violet">
                    <TriangleAlert size={19} />
                  </span>
                  <span>01 / EJECUCIÓN</span>
                </div>
                <p className="metric-value">
                  68% <span>–</span> 84<span className="metric-unit">%</span>
                </p>
                <p>
                  Proyectos de software con retrasos masivos o fallos por{" "}
                  <strong>problemas no-técnicos.</strong>
                </p>
                <div className="metric-source">
                  <span className="source-line" />
                  CHAOS Report
                </div>
              </article>
              <article className="metric-card">
                <div className="metric-top">
                  <span className="small-icon blue">
                    <TrendingUp size={19} />
                  </span>
                  <span>02 / COMUNICACIÓN</span>
                </div>
                <p className="metric-value">
                  <span className="currency">USD</span> $75
                  <span className="metric-unit">M</span>
                </p>
                <p>
                  Pérdidas directas por <strong>comunicación ineficaz</strong>{" "}
                  por cada $1,000M invertidos.
                </p>
                <div className="metric-source">
                  <span className="source-line" />
                  Project Management Institute
                </div>
              </article>
              <article className="metric-card metric-positive">
                <div className="metric-top">
                  <span className="small-icon mint">
                    <Mic2 size={19} />
                  </span>
                  <span>03 / OPORTUNIDAD</span>
                </div>
                <p className="metric-value">
                  +10% <span>a</span> 27<span className="metric-unit">%</span>
                </p>
                <p>
                  Incremento en la probabilidad de financiamiento en pitches al
                  proyectar <strong>confianza y entusiasmo vocal.</strong>
                </p>
                <div className="metric-source">
                  <span className="source-line" />
                  HBR / Figge et al.
                </div>
              </article>
            </div>
            <p className="impact-note">
              <span className="status-dot" />
              Tu ventaja competitiva también es humana.
            </p>
          </div>
        </section>

        <section id="metodologia" className="section methodology-section">
          <div className="container">
            <div className="section-heading centered">
              <SectionLabel number="02">
                CIENCIA DETRÁS DE TU EVOLUCIÓN
              </SectionLabel>
              <h2>
                De Dev Full Stack a{" "}
                <span className="gradient-text">Full Stack Human.</span>
              </h2>
              <p>
                Así como construyes un backend sólido y un frontend intuitivo,
                <br className="desktop-break" /> te ayudamos a construir tu
                arquitectura humana.
              </p>
            </div>
            <div className="methodology-workspace">
              <div className="workspace-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>human_architecture.config</span>
                <span className="workspace-status">
                  <span className="status-dot" /> BESSI FRAMEWORK
                </span>
              </div>
              <div
                className="domain-tabs"
                role="tablist"
                aria-label="Los cinco dominios BESSI"
              >
                {domains.map((item, index) => (
                  <button
                    ref={(element) => {
                      tabs.current[index] = element;
                    }}
                    key={item.code}
                    id={`tab-${index}`}
                    role="tab"
                    aria-selected={activeDomain === index}
                    aria-controls={`panel-${index}`}
                    tabIndex={activeDomain === index ? 0 : -1}
                    className={activeDomain === index ? "active" : ""}
                    onClick={() => setActiveDomain(index)}
                    onKeyDown={(event) => handleTabKey(event, index)}
                  >
                    <item.icon size={19} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
              <div
                id={`panel-${activeDomain}`}
                aria-labelledby={`tab-${activeDomain}`}
                role="tabpanel"
                tabIndex={0}
                className="domain-panel"
              >
                <div
                  className={`domain-diagram ${domain.color}`}
                  aria-hidden="true"
                >
                  <div className="diagram-ring ring-one" />
                  <div className="diagram-ring ring-two" />
                  <div className="diagram-ring ring-three" />
                  <div className="diagram-center">
                    <domain.icon size={47} strokeWidth={1.3} />
                  </div>
                  <span className="diagram-point point-one" />
                  <span className="diagram-point point-two" />
                  <span className="diagram-point point-three" />
                  <span className="diagram-caption">
                    {domain.code}.activate()
                  </span>
                </div>
                <div className="domain-content">
                  <span className="domain-kicker">
                    DOMINIO {String(activeDomain + 1).padStart(2, "0")} / 05
                  </span>
                  <h3>{domain.title}</h3>
                  <p>{domain.description}</p>
                  <div className="skill-tags">
                    {domain.skills.map((skill) => (
                      <span key={skill}>
                        <Check size={12} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="personalization">
                <span className="personalization-icon">
                  <Fingerprint size={28} />
                </span>
                <div>
                  <h4>
                    Tu personalidad es el punto de partida.{" "}
                    <span>No algo que cambiar.</span>
                  </h4>
                  <p>
                    Entrenamiento personalizado según tu personalidad Big Five
                    (OCEAN). Te enseñamos herramientas operativas adaptadas a
                    tus fortalezas, sin cambiar quién eres.
                  </p>
                </div>
                <span className="ocean-label">O · C · E · A · N</span>
              </div>
            </div>
          </div>
        </section>

        <section id="modulos" className="section modules-section">
          <div className="container">
            <div className="section-heading heading-split">
              <div>
                <SectionLabel number="03">
                  MENOS TEORÍA. MÁS TRANSFORMACIÓN.
                </SectionLabel>
                <h2>
                  Un upgrade humano.
                  <br />
                  Impacto en cada build.
                </h2>
              </div>
              <div className="modules-intro">
                <p>
                  Tres módulos para los desafíos que ya estás viviendo.
                  <br />
                  Entrenamiento práctico. Acompañamiento real.
                </p>
                <span className="availability">
                  <span className="status-dot" /> Módulos iniciales · MVP
                </span>
              </div>
            </div>
            <div className="modules-grid">
              {modules.map((module, index) => (
                <article
                  key={module.id}
                  className={`module-card ${module.color}`}
                >
                  <div className="module-visual">
                    <span className="module-number">MÓDULO_{module.id}</span>
                    <div className="module-art-ring">
                      <module.icon size={53} strokeWidth={1.1} />
                    </div>
                    <div className="module-art-orbit" />
                    <span className="module-visual-label">
                      {index === 0
                        ? "MAKE YOUR IDEAS HEARD"
                        : index === 1
                          ? "BUILD WITHOUT BURNING OUT"
                          : "BETTER TOGETHER"}
                    </span>
                    <span className="module-cross">+</span>
                  </div>
                  <div className="module-body">
                    <span className="domain-pill">
                      <span />
                      {module.domain}
                    </span>
                    <h3>{module.title}</h3>
                    <p>{module.short}</p>
                    <div className="module-format">
                      <UsersRound size={13} /> Sesión con entrenadora
                      <span>·</span>
                      <BookOpen size={13} /> Práctico
                    </div>
                    <button
                      onClick={() => setModal({ type: "booking", index })}
                      className="module-button"
                    >
                      Agendar Sesión con Entrenadora
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <p className="modules-footnote">
              <Sparkles size={14} />
              No necesitas ser otra persona. Necesitas nuevas herramientas.
            </p>
          </div>
        </section>

        <section id="certificacion" className="section certification-section">
          <div className="container">
            <div className="certification-layout grid-background">
              <div className="certification-copy">
                <SectionLabel number="04">
                  TU CRECIMIENTO, VERIFICABLE
                </SectionLabel>
                <h2>
                  Acreditación On-Chain
                  <br />
                  en <span className="gradient-text">Stellar.</span>
                </h2>
                <p>
                  Tu evolución merece más que un PDF. Credenciales verificables
                  no-custodias construidas con contratos inteligentes en Soroban
                  mediante el protocolo ACTA. Prueba inmutable de tus
                  habilidades conductuales.
                </p>
                <div className="credential-features">
                  <span>
                    <Wallet size={17} />
                    Tu credencial, bajo tu control
                  </span>
                  <span>
                    <ShieldCheck size={17} />
                    Verificable, transparente e inmutable
                  </span>
                  <span>
                    <Network size={17} />
                    Construida para el ecosistema Web3
                  </span>
                </div>
                <button
                  className="text-link"
                  onClick={() => setModal({ type: "credential" })}
                >
                  Explorar la credencial
                  <ArrowRight size={17} />
                </button>
              </div>
              <div className="credential-showcase">
                <div className="credential-back" />
                <div className="credential-card">
                  <div className="credential-card-top">
                    <span>
                      <Braces size={21} /> fsh/hub
                    </span>
                    <span className="credential-example">VISTA PREVIA</span>
                  </div>
                  <div className="credential-medallion">
                    <div />
                    <ShieldCheck size={47} strokeWidth={1.2} />
                    <span className="medallion-star star-one">✧</span>
                    <span className="medallion-star star-two">✧</span>
                  </div>
                  <p className="credential-eyebrow">VERIFIABLE HUMAN SKILLS</p>
                  <h3>Full Stack Human</h3>
                  <p className="credential-skill">Compromiso Social</p>
                  <div className="credential-divider" />
                  <div className="credential-details">
                    <span>
                      ESTÁNDAR<strong>Verifiable Credential</strong>
                    </span>
                    <span>
                      INFRAESTRUCTURA<strong>Stellar · Soroban</strong>
                    </span>
                  </div>
                  <div className="credential-footer">
                    <span>
                      <Layers3 size={13} /> Powered by ACTA
                    </span>
                    <Fingerprint size={26} />
                  </div>
                </div>
                <span className="credential-caption">
                  <LockKeyhole size={12} /> Diseño de credencial · integración
                  en desarrollo
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="entrenadoras" className="section trainers-section">
          <div className="container trainers-layout">
            <div className="trainers-copy">
              <SectionLabel number="05">HUMANAS, COMO TÚ</SectionLabel>
              <h2>
                Detrás de tu evolución,
                <br />
                <span className="gradient-text">personas reales.</span>
              </h2>
              <h3>Nuestras Entrenadoras de Habilidades Blandas</h3>
              <p>
                Psicólogas expertas en aprendizaje experiencial y facilitación
                conductual para entornos tech. Un espacio para practicar,
                equivocarte y crecer con acompañamiento.
              </p>
              <a href="#modulos" className="text-link">
                Encuentra tu próximo módulo
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="trainer-values">
              {trainerValues.map((value, index) => (
                <div key={value.title} className="trainer-value">
                  <span className="trainer-value-icon">
                    <value.icon size={24} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h4>{value.title}</h4>
                    <p>{value.description}</p>
                  </div>
                  <span className="trainer-value-number">0{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <div className="cta-glow" />
            <span className="cta-code">
              <Code2 size={19} /> BUILD BETTER. BE HUMAN.
            </span>
            <h2>
              El futuro lo construyes tú.
              <br />
              <span className="gradient-text">Con todas tus habilidades.</span>
            </h2>
            <p>Tu siguiente gran versión empieza por lo humano.</p>
            <a className="button button-primary" href="#modulos">
              Comenzar mi evolución
              <ArrowRight size={18} />
            </a>
            <span className="cta-bottom">PARA BUILDERS. POR HUMANOS.</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <Brand footer />
              <p>Strong code. Stronger humans.</p>
            </div>
            <nav aria-label="Enlaces del pie de página">
              <a href={repository} target="_blank" rel="noreferrer">
                <Code2 size={15} />
                GitHub
                <ArrowUpRight size={13} />
              </a>
              <a href="https://stellar.org" target="_blank" rel="noreferrer">
                Stellar Network
                <ArrowUpRight size={13} />
              </a>
              <button onClick={() => setModal({ type: "terms" })}>
                Términos
              </button>
              <a
                href={`${repository}/issues/new?title=Contacto%20FSH%20Hub`}
                target="_blank"
                rel="noreferrer"
              >
                Contacto
                <ArrowUpRight size={13} />
              </a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Full Stack Human · FSH Hub
            </span>
            <span>
              Hecho para la próxima generación de builders
              <span className="status-dot" />
            </span>
          </div>
        </div>
      </footer>

      {modal && (
        <Modal
          title={
            modal.type === "booking"
              ? "Tu siguiente upgrade empieza aquí."
              : modal.type === "credential"
                ? "Una credencial que te pertenece."
                : "Términos y privacidad"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "booking" && <BookingForm index={modal.index} />}
          {modal.type === "credential" && (
            <div className="credential-modal">
              <p>
                La propuesta de FSH Hub es acreditar las habilidades entrenadas
                con credenciales verificables mediante ACTA, contratos Soroban y
                la red Stellar.
              </p>
              <ol>
                <li>
                  <GraduationCap />
                  <div>
                    <strong>Entrena una habilidad</strong>
                    <span>
                      Participa en una sesión y practica con feedback.
                    </span>
                  </div>
                </li>
                <li>
                  <CheckCheck />
                  <div>
                    <strong>Demuestra tu aprendizaje</strong>
                    <span>La evaluación conductual acompaña tu progreso.</span>
                  </div>
                </li>
                <li>
                  <Wallet />
                  <div>
                    <strong>Conserva tu credencial</strong>
                    <span>
                      El diseño contempla una acreditación bajo tu control.
                    </span>
                  </div>
                </li>
              </ol>
              <div className="info-box">
                <ShieldCheck size={21} />
                <p>
                  <strong>Vista previa de producto</strong>La integración
                  ACTA/Soroban está en desarrollo. Esta página no conecta
                  wallets, emite credenciales ni registra transacciones.
                </p>
              </div>
              <a
                className="button button-secondary w-full"
                href="https://developers.stellar.org/docs/build/smart-contracts/overview"
                target="_blank"
                rel="noreferrer"
              >
                Conocer Soroban en Stellar
                <ExternalLink size={16} />
              </a>
            </div>
          )}
          {modal.type === "terms" && (
            <div className="terms-content">
              <h3>Sobre esta página</h3>
              <p>
                FSH Hub presenta una propuesta de entrenamiento de habilidades
                blandas para builders Web3. Los módulos y la credencial ilustran
                el producto inicial; esta página no procesa pagos ni ofrece
                certificaciones activas.
              </p>
              <h3>Solicitudes de sesión</h3>
              <p>
                El formulario prepara una solicitud que puedes publicar en
                GitHub. Proponer un horario no confirma una reserva. Los issues
                son públicos: no incluyas datos personales, información de salud
                ni datos de tu wallet.
              </p>
              <h3>Privacidad</h3>
              <p>
                No guardamos los datos del formulario ni usamos cookies de
                seguimiento propias. Las tipografías se cargan desde Google
                Fonts. Los enlaces externos están sujetos a las políticas de sus
                proveedores.
              </p>
              <h3>Alcance del contenido</h3>
              <p>
                El entrenamiento es educativo y no sustituye atención
                psicológica o clínica. Las cifras de impacto son referencias
                proporcionadas para esta presentación; no constituyen una
                promesa de resultados individuales.
              </p>
              <a
                className="text-link"
                href={`${repository}/issues/new?title=Consulta%20sobre%20términos`}
                target="_blank"
                rel="noreferrer"
              >
                Consultar al equipo
                <ChevronRight size={16} />
              </a>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
