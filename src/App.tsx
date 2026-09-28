import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  ExternalLink,
  Fingerprint,
  Link2,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import HumanCore from "./HumanCore";
import { FshSymbol } from "./brand/Logo";
import Modal from "./Modal";
import {
  bessiFacts,
  bigFiveExamples,
  domains,
  escrowSteps,
  evidence,
  modules,
  repository,
  steps,
  transversalSkills,
  whyUs,
} from "./data";

type ModalState = { type: "credential" } | { type: "terms" } | null;

const sentenceCase = (text: string) =>
  text.charAt(0) + text.slice(1).toLowerCase();

const contactUrl = `${repository}/issues/new?title=Contacto%20Full%20Stack%20Human`;

function Brand() {
  return (
    <a href="#inicio" className="brand" aria-label="Full Stack Human — inicio">
      <FshSymbol size={36} />
      <span className="fsh-wordmark">Full Stack Human</span>
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

function Source({ children }: { children: React.ReactNode }) {
  return (
    <p className="source">
      <span className="source-line" />
      Fuente · {children}
    </p>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const navLinks = [
    ["Problema", "#problema"],
    ["Metodología", "#metodologia"],
    ["Módulos", "#modulos"],
    ["Cómo funciona", "#como-funciona"],
    ["Equipo", "#equipo"],
  ];

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
          <a href="/app" className="button button-primary nav-cta">
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
            <a href="/app" className="button button-primary">
              Comienza tu evolución <ArrowUpRight size={16} />
            </a>
          </nav>
        )}
      </header>

      <main id="contenido">
        <section className="hero fsh-blueprint" id="inicio">
          <div className="hero-fade" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="terminal-label">
                <span className="prompt">$</span> fsh pitch --2026
              </p>
              <h1>
                Tu arquitectura técnica ya es fuerte.{" "}
                <span className="accent-mint">
                  Ahora fortalece tu arquitectura humana.
                </span>
              </h1>
              <p className="lead">
                Full Stack Human es un hub de entrenamiento personalizado de
                habilidades blandas para builders en blockchain y Web3:
                sesiones 1 a 1 en vivo con psicólogas y psicólogos, adaptadas a
                tu personalidad.
              </p>
              <div className="hero-actions">
                <a href="/app" className="button button-primary">
                  Haz el Human Stack Check
                  <ArrowRight size={18} />
                </a>
                <a href="#metodologia" className="button button-secondary">
                  Ver metodología
                </a>
              </div>
              <ul className="hero-proof">
                <li>
                  <Check size={16} /> Medido con BESSI
                </li>
                <li>
                  <Check size={16} /> Adaptado con Big Five
                </li>
                <li>
                  <Check size={16} /> Escrow y credencial en Stellar
                </li>
              </ul>
            </div>
            <HumanCore />
          </div>
        </section>

        <section id="problema" className="section">
          <div className="container">
            <div className="section-heading split">
              <div>
                <SectionLabel number="01">EL PROBLEMA</SectionLabel>
                <h2>
                  El bug no está <span className="accent-coral">en el código.</span>
                </h2>
              </div>
              <p className="lead">
                Proyectos técnicamente brillantes se frenan por comunicación
                ineficaz, silos, burnout y pitches que no convencen. Esa capa
                casi nunca se mide ni se entrena.
              </p>
            </div>
            <div className="metrics-grid">
              {evidence.map((item) => (
                <article key={item.id} className={`card metric ${item.color}`}>
                  <p className="mono-label">
                    <item.icon size={16} aria-hidden="true" />
                    {item.label}
                  </p>
                  <p className="metric-value">
                    {item.value}
                    <span className="metric-unit">{item.unit}</span>
                  </p>
                  <p>{item.text}</p>
                  <Source>{item.source}</Source>
                </article>
              ))}
            </div>
            <div className="why-now card">
              <p className="mono-label">
                <span className="status-dot amber" />
                POR QUÉ AHORA
              </p>
              <p>
                <strong>El 63 %</strong> de los empleadores considera la brecha
                de habilidades la principal barrera para transformar su negocio,
                y <strong>el 85 %</strong> planea priorizar el upskilling de su
                plantilla. Tras el pensamiento analítico, las más valoradas son
                la resiliencia, flexibilidad y agilidad, y el liderazgo e
                influencia social.
              </p>
              <Source>World Economic Forum, 2025 · The Future of Jobs Report</Source>
            </div>
          </div>
        </section>

        <section id="metodologia" className="section section-deep">
          <div className="container">
            <div className="section-heading centered">
              <SectionLabel number="02">LA SOLUCIÓN</SectionLabel>
              <h2>
                32 habilidades. 5 capas.{" "}
                <span className="accent-mint">1 diagnóstico.</span>
              </h2>
              <p className="lead">
                Entrena habilidades humanas como entrenas tu stack: con método.
                Durante años, «habilidades blandas» fue un término difuso. El
                BESSI lo convierte en un inventario con estructura clara.
              </p>
            </div>

            <div className="trait-skill">
              <div className="card">
                <p className="mono-label">RASGO · BIG FIVE</p>
                <h3>Lo que sueles hacer.</h3>
                <p>Tu tendencia habitual de pensar, sentir y actuar.</p>
              </div>
              <div className="card mint">
                <p className="mono-label">HABILIDAD · BESSI</p>
                <h3>Lo que eres capaz de hacer cuando la situación lo pide.</h3>
                <p>Se puede medir. Se puede entrenar.</p>
              </div>
            </div>

            <div className="layers-head">
              <h3 className="layers-title">
                32 habilidades. 5 capas. Un plan hecho para ti.
              </h3>
              <div className="module-name-example">
                <span className="mono-label">NOMBRE DE UN MÓDULO</span>
                <span className="mono">
                  Regulación de metas · Runtime (Autogestión)
                </span>
              </div>
            </div>

            <div className="layers-grid">
              {domains.map((item) => (
                <article
                  key={item.code}
                  className={`layer-column ${item.color}`}
                  aria-labelledby={`layer-${item.code}`}
                >
                  <header className="layer-column-head">
                    <h4 id={`layer-${item.code}`}>{item.layer}</h4>
                    <span className="mono">
                      ({sentenceCase(item.name)}) · {item.skills.length}
                    </span>
                  </header>
                  <ul className="layer-skills">
                    {item.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </article>
              ))}
              <article
                className="layer-column mist"
                aria-labelledby="layer-transversales"
              >
                <header className="layer-column-head">
                  <h4 id="layer-transversales">Transversales</h4>
                  <span className="mono">
                    (facetas compuestas) · {transversalSkills.length}
                  </span>
                </header>
                <ul className="layer-skills">
                  {transversalSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            </div>
            <p className="layers-note">
              9 + 5 + 5 + 5 + 5 + 3 = <strong>32</strong>. Cada habilidad es un
              módulo de unas 5 sesiones; todas son igual de importantes. La capa
              siempre se escribe con su dominio BESSI entre paréntesis. BESSI:
              «Un marco científico validado de 32 habilidades sociales,
              emocionales y conductuales en cinco dominios, con adaptación al
              español y formas cortas de 96, 45 y 20 ítems.»
              <Source>Soto et al., 2022; Postigo et al., 2024; Sewell et al., 2025</Source>
            </p>

            <div className="bessi-facts">
              {bessiFacts.map((fact) => (
                <div key={fact.label}>
                  <span className="fact-value">{fact.value}</span>
                  <span className="mono-label">{fact.label}</span>
                </div>
              ))}
              <p>
                El BESSI se publicó en el <em>Journal of Personality and Social
                Psychology</em>, revista con revisión por pares de la APA.
                Adaptación al español validada en adultos. Entrenable: con retos
                conductuales semanales durante 16 semanas, mejoraron 4 de los 5
                dominios.
                <Source>
                  Soto et al., 2022, 2024, 2025; Postigo et al., 2024; Chen et
                  al., 2024
                </Source>
              </p>
            </div>

            <div className="personalization card">
              <div className="personalization-head">
                <span className="icon-box coral">
                  <Fingerprint size={24} aria-hidden="true" />
                </span>
                <div>
                  <p className="mono-label">PERSONALIZACIÓN</p>
                  <h3>El BESSI dice qué entrenar. El Big Five, cómo.</h3>
                  <p>
                    En la sesión 1 se aplican ambos para calibrar ritmo, tipo de
                    práctica y feedback. Ejemplos ilustrativos:
                  </p>
                </div>
              </div>
              <dl className="trait-grid">
                {bigFiveExamples.map((example) => (
                  <div key={example.trait}>
                    <dt>{example.trait}</dt>
                    <dd>{example.text}</dd>
                  </div>
                ))}
              </dl>
              <Source>
                Colquitt et al., 2000; Barrick y Mount, 1991; Joyal-Desmarais
                et al., 2022
              </Source>
            </div>
          </div>
        </section>

        <section id="modulos" className="section">
          <div className="container">
            <div className="section-heading split">
              <div>
                <SectionLabel number="03">EL CATÁLOGO</SectionLabel>
                <h2>
                  Entrena una habilidad.{" "}
                  <span className="accent-mint">1 a 1, en vivo.</span>
                </h2>
              </div>
              <p className="lead">
                Módulos de unas 5 sesiones, uno por habilidad. No es un curso
                pregrabado ni una clase teórica: práctica aplicada a tu trabajo
                real, con una psicóloga o psicólogo del equipo.
              </p>
            </div>
            <div className="modules-grid">
              {modules.map((module) => (
                <article key={module.id} className={`card module ${module.color}`}>
                  <div className="module-head">
                    <span className="icon-box">
                      <module.icon size={24} aria-hidden="true" />
                    </span>
                    <p className="mono-label">
                      <span className="layer-tag">{module.layer}</span>
                      {module.domain}
                    </p>
                  </div>
                  <h3>
                    <span className="bracket open">&lt;</span>
                    {module.title}
                    <span className="bracket close">&gt;</span>
                  </h3>
                  <p className="module-definition">{module.definition}</p>
                  <p>{module.short}</p>
                  <p className="module-meta mono-label">
                    <Users size={16} aria-hidden="true" />
                    {module.psychologist} · Psicóloga
                    <span aria-hidden="true">·</span>
                    ~5 sesiones · 45 min
                  </p>
                  <a
                    className="button button-secondary w-full"
                    href={`/app#/modulo/${module.id}`}
                  >
                    Agenda tu sesión 1
                    <ArrowRight size={18} />
                  </a>
                </article>
              ))}
            </div>
            <p className="modules-note mono-label">
              <span className="layer-tag coral">API</span>
              <span className="layer-tag lime">Fork</span>
              Próximas capas: el equipo de psicología está diseñando sus
              habilidades.
            </p>
          </div>
        </section>

        <section id="como-funciona" className="section section-deep">
          <div className="container">
            <div className="section-heading centered">
              <SectionLabel number="04">CÓMO FUNCIONA</SectionLabel>
              <h2>
                Del test a la credencial,{" "}
                <span className="accent-mint">en seis pasos.</span>
              </h2>
            </div>
            <ol className="steps-grid">
              {steps.map((step, index) => (
                <li key={step.title} className="card step">
                  <span className="step-number mono-label">
                    0{index + 1}
                  </span>
                  <step.icon size={24} aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>

            <div className="trust-layout">
              <div className="trust-copy">
                <p className="mono-label">CONFIANZA · ESCROW EN BLOCKCHAIN</p>
                <h3>Tu pago se libera solo cuando la sesión ocurre.</h3>
                <ol className="escrow-steps">
                  {escrowSteps.map((step, index) => (
                    <li key={step.text}>
                      <span className="mono-label">0{index + 1}</span>
                      <step.icon size={20} aria-hidden="true" />
                      {step.text}
                    </li>
                  ))}
                </ol>
                <p>Pagas solo el entrenamiento que ocurre. Sin letra chica.</p>
                <button
                  className="text-link"
                  onClick={() => setModal({ type: "credential" })}
                >
                  Explorar la credencial
                  <ArrowRight size={18} />
                </button>
              </div>
              <figure className="credential amber">
                <figcaption className="mono-label">
                  CREDENCIAL VERIFICABLE · EJEMPLO
                </figcaption>
                <div className="credential-ring" aria-hidden="true">
                  <FshSymbol size={44} />
                </div>
                <p>Se certifica que [Nombre de la persona] completó</p>
                <p className="credential-skill">
                  <span className="bracket open">&lt;</span>
                  Regulación del estrés
                  <span className="bracket close">&gt;</span>
                </p>
                <p className="mono-label">
                  <span className="layer-tag">Firewall</span>
                  RESILIENCIA EMOCIONAL
                </p>
                <p className="credential-verified mono-label">
                  <BadgeCheck size={16} aria-hidden="true" /> VERIFICADO EN
                  BLOCKCHAIN
                  <Link2 size={14} aria-hidden="true" />
                </p>
                <p className="credential-method">
                  Metodología: BESSI (Soto et al., 2022; Postigo et al., 2024)
                </p>
              </figure>
            </div>
            <p className="centered-note">
              Se reclama al confirmar la última sesión y no se pierde nunca: la
              prueba pública de lo entrenado. Sin niveles.
            </p>
          </div>
        </section>

        <section id="equipo" className="section">
          <div className="container">
            <div className="section-heading split">
              <div>
                <SectionLabel number="05">POR QUÉ NOSOTROS</SectionLabel>
                <h2>
                  Psicología con{" "}
                  <span className="accent-coral">idioma de builder.</span>
                </h2>
              </div>
              <p className="lead">
                Psicólogas y psicólogos que entienden grants, equipos remotos,
                hackathons y la velocidad de Web3.
              </p>
            </div>
            <div className="why-grid">
              {whyUs.map((item, index) => (
                <article key={item.title} className="card why">
                  <span className="mono-label">0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta fsh-blueprint">
          <div className="container">
            <p className="terminal-label">
              <span className="prompt">$</span> medir --bessi › personalizar
              --big-five › entrenar --1a1 › certificar --blockchain
            </p>
            <h2>Refactoriza tu arquitectura humana.</h2>
            <div className="hero-actions centered">
              <a className="button button-primary" href="/app">
                Haz el Human Stack Check
                <ArrowRight size={18} />
              </a>
              <a
                className="button button-human"
                href={`${repository}/issues/new?title=Entrenar%20a%20mi%20equipo`}
                target="_blank"
                rel="noreferrer"
              >
                Entrena a tu equipo
                <ArrowUpRight size={18} />
              </a>
            </div>
            <p className="mono-label">GRATIS · 1 MINUTO · SIN TARJETA</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <img
                className="footer-logo"
                src="/brand/fsh-horizontal-color-dark.svg"
                alt="Full Stack Human"
                width={236}
                height={32}
              />
            </div>
            <nav aria-label="Enlaces del pie de página">
              <a href={repository} target="_blank" rel="noreferrer">
                GitHub
                <ArrowUpRight size={14} />
              </a>
              <a href="https://stellar.org" target="_blank" rel="noreferrer">
                Stellar Network
                <ArrowUpRight size={14} />
              </a>
              <button onClick={() => setModal({ type: "terms" })}>
                Términos
              </button>
              <a href={contactUrl} target="_blank" rel="noreferrer">
                Contacto
                <ArrowUpRight size={14} />
              </a>
            </nav>
          </div>
          <div className="footer-bottom mono-label">
            <span>© {new Date().getFullYear()} Full Stack Human</span>
            <span>
              Toda cifra tiene fuente primaria auditada · fullstackhuman.io
              (provisional)
            </span>
          </div>
        </div>
      </footer>

      {modal && (
        <Modal
          title={
            modal.type === "credential"
              ? "Una credencial que te pertenece."
              : "Términos y privacidad"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "credential" && (
            <div className="credential-modal">
              <p>
                Al confirmar la última sesión reclamas una credencial verificable
                en Stellar: habilidad, capa, emisor y el registro on-chain de la
                sesión completada.
              </p>
              <ol>
                <li>
                  <Users />
                  <div>
                    <strong>Entrenas 1 a 1</strong>
                    <span>
                      Sesiones en vivo con práctica aplicada a tu trabajo.
                    </span>
                  </div>
                </li>
                <li>
                  <ShieldCheck />
                  <div>
                    <strong>El pago espera en escrow</strong>
                    <span>
                      Un contrato inteligente lo retiene y lo libera al
                      confirmar la sesión.
                    </span>
                  </div>
                </li>
                <li>
                  <BadgeCheck />
                  <div>
                    <strong>Reclamas tu credencial</strong>
                    <span>
                      Verificable en blockchain, con enlace al registro. Sin
                      niveles.
                    </span>
                  </div>
                </li>
              </ol>
              <div className="info-box">
                <ShieldCheck size={22} aria-hidden="true" />
                <p>
                  <strong>Estado del MVP</strong>La plataforma funciona en
                  Stellar Testnet: escrow con Trustless Work y credencial
                  anclada a la transacción de liberación. La emisión como
                  credencial verificable (ACTA) está en desarrollo.
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
                Full Stack Human presenta un hub de entrenamiento de habilidades
                blandas para builders Web3. La plataforma en /app opera en
                Stellar Testnet como MVP: los pagos usan USDC de prueba y las
                credenciales son demostrativas.
              </p>
              <h3>Privacidad</h3>
              <p>
                Esta página no guarda datos ni usa cookies de seguimiento. En la
                plataforma, la identidad y la wallet las gestiona Pollar; el
                resto de tu progreso se guarda solo en tu navegador.
              </p>
              <h3>Alcance del contenido</h3>
              <p>
                El entrenamiento es educativo y no sustituye atención
                psicológica o clínica. Toda cifra publicada proviene de una
                fuente primaria auditada (autor y año visibles) y describe
                asociaciones observadas, no garantías de resultados
                individuales.
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
