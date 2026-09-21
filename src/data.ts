import {
  Brain,
  Compass,
  HeartHandshake,
  Lightbulb,
  MessagesSquare,
  Mic2,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";

export const repository =
  "https://github.com/grethelsandoval/full-stack-human";

export const domains = [
  {
    name: "Autogestión",
    icon: Target,
    color: "blue",
    title: "Tu mejor sistema operativo eres tú.",
    description:
      "Convierte tus objetivos en acciones sostenibles. Entrena tu organización, enfoque y capacidad de ejecución para avanzar sin depender de la motivación.",
    skills: [
      "Gestión del tiempo",
      "Foco y constancia",
      "Decisiones conscientes",
    ],
    code: "self_management",
  },
  {
    name: "Resiliencia Emocional",
    icon: ShieldCheck,
    color: "mint",
    title: "La presión cambia. Tu equilibrio se entrena.",
    description:
      "Aprende a regular tus emociones y responder con claridad cuando el deploy falla, el deadline se acerca o la incertidumbre aumenta.",
    skills: [
      "Regulación emocional",
      "Tolerancia al estrés",
      "Recuperación sostenible",
    ],
    code: "emotional_resilience",
  },
  {
    name: "Compromiso Social",
    icon: MessagesSquare,
    color: "violet",
    title: "Haz que tus ideas conecten.",
    description:
      "Comunica el valor de lo que construyes. Desarrolla la confianza para presentar, liderar conversaciones y crear conexiones en tu ecosistema.",
    skills: [
      "Comunicación persuasiva",
      "Liderazgo",
      "Conexión con tu comunidad",
    ],
    code: "social_engagement",
  },
  {
    name: "Cooperación",
    icon: HeartHandshake,
    color: "mint",
    title: "Grandes builders. Mejores equipos.",
    description:
      "Construye confianza, da feedback que ayuda y transforma los desacuerdos en soluciones. El trabajo en equipo también necesita una buena arquitectura.",
    skills: [
      "Escucha activa",
      "Resolución de conflictos",
      "Colaboración asertiva",
    ],
    code: "cooperation",
  },
  {
    name: "Innovación",
    icon: Lightbulb,
    color: "violet",
    title: "Abre espacio para tu próxima gran idea.",
    description:
      "Entrena tu curiosidad, explora nuevas perspectivas y conecta ideas. Aprende a navegar la ambigüedad para diseñar soluciones que importan.",
    skills: [
      "Pensamiento creativo",
      "Curiosidad intelectual",
      "Apertura a experiencias",
    ],
    code: "innovation",
  },
] as const;

export const modules = [
  {
    id: "01",
    domain: "Compromiso Social",
    color: "violet",
    icon: Mic2,
    title: "Pitches & Argumentación Persuasiva para Grants y VCs",
    short:
      "Convierte una gran idea en un pitch que conecta, convence y abre puertas.",
    outcome: "Comunica tu valor. Consigue el siguiente sí.",
    skills: ["Storytelling", "Pitch de inversión", "Presencia vocal"],
  },
  {
    id: "02",
    domain: "Resiliencia Emocional",
    color: "blue",
    icon: Brain,
    title:
      "Gestión del Estrés y Prevención de Burnout en Mainnets & Hackathons",
    short:
      "Construye a largo plazo con herramientas para rendir sin agotarte en el camino.",
    outcome: "Alto rendimiento, sin sacrificar tu bienestar.",
    skills: ["Gestión del estrés", "Límites sanos", "Recuperación"],
  },
  {
    id: "03",
    domain: "Cooperación",
    color: "mint",
    icon: HeartHandshake,
    title: "Coordinación Asertiva y Resolución de Conflictos en Equipos Dev",
    short:
      "Menos fricción en tu equipo. Más conversaciones claras y colaboración real.",
    outcome: "Mejor comunicación. Mejores builds.",
    skills: ["Feedback", "Acuerdos de equipo", "Escucha activa"],
  },
] as const;

export const trainerValues = [
  {
    icon: Brain,
    title: "Ciencia, puesta en práctica",
    description:
      "Psicología y aprendizaje experiencial aplicados a desafíos reales.",
  },
  {
    icon: Compass,
    title: "Entendemos tu contexto",
    description:
      "Grants, equipos distribuidos, hackathons y la velocidad de Web3.",
  },
  {
    icon: Zap,
    title: "Herramientas para hoy",
    description:
      "Práctica guiada y feedback que puedes llevar a tu siguiente build.",
  },
];
