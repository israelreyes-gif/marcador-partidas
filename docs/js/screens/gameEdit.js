import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { createGame, updateGame } from "../api/games.js";
import { gameForm } from "../ui/gameForm.js";
import { navigate } from "../router.js";
import { getToken } from "../storage/session.js";
import { showToast } from "../ui/toast.js";

function notice(backHref, backLabel, ...children) {
  return h("section", { class: "stack" }, h("a", { href: backHref, class: "back-link" }, backLabel), ...children);
}

const needLogin = (backHref, backLabel) =>
  notice(
    backHref,
    backLabel,
    h("h1", {}, "Juegos propios"),
    h("p", { class: "muted" }, "Para crear o editar tus propios juegos tienes que iniciar sesión."),
    h("a", { href: "#/cuenta", class: "btn" }, "Ir a Cuenta")
  );

// Crear un juego propio
export async function gameNewScreen() {
  if (!getToken()) return needLogin("#/juegos", "‹ Juegos de cartas");

  return h(
    "section",
    { class: "stack" },
    h("a", { href: "#/juegos", class: "back-link" }, "‹ Juegos de cartas"),
    h("h1", {}, "Crear un juego"),
    gameForm({
      submitLabel: "Crear juego",
      onSubmit: async (data) => {
        const game = await createGame(data);
        showToast("Juego creado");
        navigate(`/juego/${game.id}`);
      },
    })
  );
}

// Editar un juego propio
export async function gameEditScreen({ id }) {
  const back = [`#/juego/${id}`, "‹ Volver al juego"];
  if (!getToken()) return needLogin(...back);

  let game;
  try {
    ({ game } = await request("GET", `/api/games/${encodeURIComponent(id)}`));
  } catch (err) {
    return notice(...back, h("p", { class: "error" }, err.message));
  }
  if (!game.isMine) return notice(...back, h("p", { class: "error" }, "Solo quien creó el juego puede editarlo."));

  return h(
    "section",
    { class: "stack" },
    h("a", { href: back[0], class: "back-link" }, back[1]),
    h("h1", {}, "Editar juego"),
    gameForm({
      initial: game,
      submitLabel: "Guardar cambios",
      onSubmit: async (data) => {
        await updateGame(game.id, data);
        showToast("Juego guardado");
        navigate(`/juego/${game.id}`);
      },
    })
  );
}
