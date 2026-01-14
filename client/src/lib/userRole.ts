const DEFAULT_ROLE: "admin" | "dispatcher" | "field" = "admin";

export function getActiveRole(): "admin" | "dispatcher" | "field" {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const stored = window.localStorage.getItem("activeRole");
  if (stored === "dispatcher" || stored === "field" || stored === "admin") {
    return stored;
  }
  return DEFAULT_ROLE;
}

export function setActiveRole(role: "admin" | "dispatcher" | "field") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("activeRole", role);
}
