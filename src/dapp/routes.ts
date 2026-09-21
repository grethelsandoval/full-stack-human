export type Route =
  | { name: "dashboard" }
  | { name: "module"; id: string }
  | { name: "schedule"; id: string }
  | { name: "booking"; id: string }
  | { name: "certificados" }
  | { name: "perfil" };

export function parseRoute(hash: string): Route {
  const [name, id] = hash.replace(/^#\/?/, "").split("/");
  if (name === "modulo" && id) return { name: "module", id };
  if (name === "agendar" && id) return { name: "schedule", id };
  if (name === "reserva" && id) return { name: "booking", id };
  if (name === "certificados") return { name: "certificados" };
  if (name === "perfil") return { name: "perfil" };
  return { name: "dashboard" };
}

export function routeToHash(route: Route) {
  switch (route.name) {
    case "module":
      return `#/modulo/${route.id}`;
    case "schedule":
      return `#/agendar/${route.id}`;
    case "booking":
      return `#/reserva/${route.id}`;
    case "certificados":
      return "#/certificados";
    case "perfil":
      return "#/perfil";
    default:
      return "#/";
  }
}

export function isDAppPath(pathname: string) {
  return /^\/app\/?$/.test(pathname);
}
