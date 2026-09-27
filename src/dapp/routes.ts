export type Route =
  | { name: "inicio" }
  | { name: "check" }
  | { name: "check-preguntas" }
  | { name: "check-resultado" }
  | { name: "modulos" }
  | { name: "modulo"; id: string }
  | { name: "agendar"; id: string }
  | { name: "pagar"; id: string }
  | { name: "recarga"; id: string }
  | { name: "sesion"; id: string }
  | { name: "reprogramar"; id: string }
  | { name: "confirmar"; id: string }
  | { name: "liberada"; id: string }
  | { name: "sesiones" }
  | { name: "reclamar"; id: string }
  | { name: "credenciales" }
  | { name: "credencial"; id: string }
  | { name: "perfil" };

export function parseRoute(hash: string): Route {
  const [name, id, action] = hash.replace(/^#\/?/, "").split("/");
  switch (name) {
    case "check":
      if (id === "preguntas") return { name: "check-preguntas" };
      if (id === "resultado") return { name: "check-resultado" };
      return { name: "check" };
    case "modulos":
      return { name: "modulos" };
    case "sesiones":
      return { name: "sesiones" };
    case "credenciales":
      return { name: "credenciales" };
    case "perfil":
      return { name: "perfil" };
  }
  if (!id) return { name: "inicio" };
  switch (name) {
    case "modulo":
      return { name: "modulo", id };
    case "agendar":
      return { name: "agendar", id };
    case "pagar":
      return { name: "pagar", id };
    case "recarga":
      return { name: "recarga", id };
    case "reclamar":
      return { name: "reclamar", id };
    case "credencial":
      return { name: "credencial", id };
    case "sesion":
      if (action === "reprogramar") return { name: "reprogramar", id };
      if (action === "confirmar") return { name: "confirmar", id };
      if (action === "liberada") return { name: "liberada", id };
      return { name: "sesion", id };
  }
  return { name: "inicio" };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "inicio":
      return "#/";
    case "check":
      return "#/check";
    case "check-preguntas":
      return "#/check/preguntas";
    case "check-resultado":
      return "#/check/resultado";
    case "modulos":
    case "sesiones":
    case "credenciales":
    case "perfil":
      return `#/${route.name}`;
    case "reprogramar":
    case "confirmar":
    case "liberada":
      return `#/sesion/${route.id}/${route.name}`;
    default:
      return `#/${route.name}/${route.id}`;
  }
}

export function isDAppPath(pathname: string) {
  return /^\/app\/?$/.test(pathname);
}
