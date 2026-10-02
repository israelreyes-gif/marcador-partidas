import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { gameCard } from "../ui/gameCard.js";

const DECK_FILTERS = [
  { value: "", label: "Todos" },
  { value: "espanola", label: "Española" },
  { value: "francesa", label: "Francesa" },
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const SLIDER_ANY = 1; // posición del deslizador que significa "cualquier número"
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

  // Deslizador: 1 = cualquier número, de 2 a 8 = ese número de jugadores
  const playersValue = h("span", { class: "slider-value" }, ANY_LABEL);
  const playersSlider = h("input", {
    type: "range",
    class: "slider",
    min: String(SLIDER_ANY),
    max: String(MAX_PLAYERS),
    step: "1",
    value: String(SLIDER_ANY),
    "aria-label": "Número de jugadores",
    oninput: (event) => {
      const value = Number(event.target.value);
      players = value === SLIDER_ANY ? "" : String(value);
      playersValue.textContent = value === SLIDER_ANY ? ANY_LABEL : `${value} jugadores`;
      loadGames();
    },
  });
  const playersControl = h(
    "div",
    { class: "slider-box" },
    playersValue,
    playersSlider,
    h(
      "div",
      { class: "slider-scale", "aria-hidden": "true" },
      h("span", {}, "Todos"),
      h("span", {}, String(MIN_PLAYERS)),
      h("span", {}, String(MAX_PLAYERS))
    )
  );

  drawChips();
  loadGames();

  return h(
    "section",
    { class: "stack" },
    h("a", { href: "#/", class: "back-link" }, "‹ Inicio"),
    h("h1", {}, "Juegos de cartas"),
    search,
    h("div", { class: "stack-sm" }, h("div", { class: "section-label" }, "Por tipo de baraja"), chips),
    h("div", { class: "stack-sm" }, h("div", { class: "section-label" }, "Por número de jugadores"), playersControl),
    list
  );
}
