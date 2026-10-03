import { HttpError } from "./errors.js";

const WIN_MODES = ["min", "max", "rounds"];
const COLORS = [
  "#E8B04A", "#E4675B", "#6FB7E9", "#B79CE8",
  "#7BD389", "#F2A6C8", "#9AD1D4", "#F6D365",
];

function parsePlayers(list, game) {
  if (!Array.isArray(list)) throw new HttpError(400, "Faltan los jugadores");

  if (list.length < game.min_players || list.length > game.max_players) {
    const range =
      game.min_players === game.max_players
        ? `exactamente ${game.min_players}`
        : `de ${game.min_players} a ${game.max_players}`;
    throw new HttpError(400, `Este juego admite ${range} jugadores`);
  }

  const seen = new Set();
  const players = list.map((item, index) => {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (name.length < 1 || name.length > 30) {
      throw new HttpError(400, "Cada jugador necesita un nombre de 1 a 30 caracteres");
    }
    const key = name.toLowerCase();
    if (seen.has(key)) throw new HttpError(400, "Hay nombres de jugador repetidos");
    seen.add(key);
    return { name, color: COLORS[index % COLORS.length], userId: parseUserId(item?.userId) };
  });

  const linked = list.map((item) => item?.userId).filter((id) => id !== undefined && id !== null);
  if (new Set(linked).size !== linked.length) {
    throw new HttpError(400, "Un mismo usuario no puede estar dos veces en la partida");
  }
  return players;
}

// El jugador puede ser un usuario registrado (userId) o solo un nombre
function parseUserId(value) {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value) || value <= 0) throw new HttpError(400, "Usuario no válido");
  return value;
}

// Los jugadores vinculados a un usuario usan el nombre de ese usuario.
// Se vuelve a comprobar que no haya dos jugadores con el mismo nombre.
export function applyLinkedUsers(players, users) {
  const byId = new Map(users.map((user) => [user.id, user]));
  const seen = new Set();

  for (const player of players) {
    if (player.userId !== null) {
      const user = byId.get(player.userId);
      if (!user) throw new HttpError(400, "Usuario no encontrado");
      player.name = user.display_name;
    }
    const key = player.name.toLowerCase();
    if (seen.has(key)) throw new HttpError(400, "Hay nombres de jugador repetidos");
    seen.add(key);
  }
}

function parsePassword(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length < 4 || value.length > 64) {
    throw new HttpError(400, "La contraseña debe tener de 4 a 64 caracteres");
  }
  return value;
}

// Valida los datos para crear una partida. Modo de victoria y límite
// son opcionales: si no se indican, se usan los del juego.
export function parseNewMatch(body, game) {
  const players = parsePlayers(body.players, game);

  const winMode = body.winMode ?? game.win_mode;
  if (!WIN_MODES.includes(winMode)) {
    throw new HttpError(400, "Modo de victoria no válido");
  }

  const scoreLimit =
    body.scoreLimit === undefined ? game.score_limit : body.scoreLimit;
  const validLimit =
    scoreLimit === null ||
    (Number.isInteger(scoreLimit) && scoreLimit > 0 && scoreLimit <= 100000);
  if (!validLimit) throw new HttpError(400, "Límite de puntos no válido");

  const password = parsePassword(body.password);
  const isPrivate = body.isPrivate === true;
  if (isPrivate && !password) {
    throw new HttpError(400, "Una partida privada necesita contraseña");
  }

  return { players, winMode, scoreLimit, password, isPrivate };
}
