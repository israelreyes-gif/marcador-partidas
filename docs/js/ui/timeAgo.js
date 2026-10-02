// "hace 5 min", "hace 3 h", "ayer"... a partir de la fecha que guarda la base de datos
// (formato "2026-10-02 21:30:00", hora UTC).
export function timeAgo(dateText) {
  if (!dateText) return "";
  const date = new Date(dateText.replace(" ", "T") + "Z");
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
