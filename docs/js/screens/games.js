import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { gameCard } from "../ui/gameCard.js";
import { rangeSlider } from "../ui/rangeSlider.js";
import { navigate } from "../router.js";
import { getToken } from "../storage/session.js";

const DECK_FILTERS = [
  { value: "", label: "Todos" },
  { value: "espanola", label: "Española" },
  { value: "francesa", label: "Francesa" },
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const ANY_LABEL = "Cualquier número";
const SEARCH_DELAY_MS = 300;

// Lista de juegos con buscador y filtros por baraja y por número de jugadores
export async function gamesScreen() {
  let deck = "";
  let query = "";
  let players = ""; // "" = cualquier número
  let lastRequest = 0;
  let timer = null;

  const list = h("div", { class: "game-list" });
  const chips = h("div", { class: "chips" });

  // La baraja y el texto se filtran en el servidor; el número de jugadores,
  // aquí, porque es solo quedarse con los juegos que admiten ese número.
  async function loadGames() {
    const thisRequest = ++lastRequest;
    const params = new URLSearchParams();
    if (deck) params.set("deck", deck);
    if (query) params.set("q", query);

    try {
      const data = await request("GET", `/api/games?${params}`);
      if (thisRequest !== lastRequest) return; // llegó tarde: ya hay una búsqueda más nueva

      const wanted = Number(players);
      const games = players
        ? data.games.filter((game) => game.min_players <= wanted && wanted <= game.max_players)
        : data.games;

      list.replaceChildren(
        ...(games.length
          ? games.map(gameCard)
          : [h("p", { class: "muted" }, "No hay juegos que coincidan.")])
      );
    } catch (err) {
      if (thisRequest !== lastRequest) return;
      list.replaceChildren(h("p", { class: "error" }, err.message));
    }
  }

  function drawChips() {
    chips.replaceChildren(
      ...DECK_FILTERS.map((filter) =>
        h(
          "button",
          {
            type: "button",
            class: "chip",
            "aria-pressed": String(filter.value === deck),
            onclick: () => {
              deck = filter.value;
              drawChips();
              loadGames();
            },
          },
          filter.label
        )
      )
    );
  }

  const search = h("input", {
    type: "search",
    class: "input",
    placeholder: "Buscar juego",
    "aria-label": "Buscar juego",
    oninput: (event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        query = event.target.value.trim();
        loadGames();
      }, SEARCH_DELAY_MS);
    },
  });

  // Deslizador: la posición 0 (extremo izquierdo) es "cualquier número";
  // las siguientes son de MIN_PLAYERS a MAX_PLAYERS.
  const playersValue = h("span", { class: "slider-value" }, ANY_LABEL);
  const labels = [""];
  for (let count = MIN_PLAYERS; count <= MAX_PLAYERS; count++) labels.push(String(count));

  const playersSlider = rangeSlider({
    labels,
    ariaLabel: "Número de jugadores",
    onChange: (position) => {
      players = position === 0 ? "" : String(MIN_PLAYERS + position - 1);
      playersValue.textContent = position === 0 ? ANY_LABEL : `${players} jugadores`;
      loadGames();
    },
  });

  const playersControl = h("div", { class: "slider-box" }, playersValue, playersSlider.element);

  // Crear juegos propios: hace falta tener sesión. Va arriba para que siempre se vea
  const createBlock = getToken()
    ? h("button", { type: "button", class: "btn-dashed", onclick: () => navigate("/juego-nuevo") }, "+ Crear un juego")
    : h("p", { class: "muted hint" }, "¿Quieres crear tus propios juegos? ", h("a", { href: "#/cuenta" }, "Inicia sesión"), ".");

  drawChips();
  loadGames();

  return h(
    "section",
    { class: "stack" },
    h("h1", {}, "Juegos de cartas"),
    createBlock,
    search,
    h("div", { class: "stack-sm" }, h("div", { class: "section-label" }, "Por tipo de baraja"), chips),
    h("div", { class: "stack-sm" }, h("div", { class: "section-label" }, "Por número de jugadores"), playersControl),
    list
  );
}
