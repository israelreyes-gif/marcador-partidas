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

  const playersOptions = [
    h("option", { value: "" }, "Cualquier número"),
    ...Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, index) => {
      const count = MIN_PLAYERS + index;
      return h("option", { value: String(count) }, `${count} jugadores`);
    }),
  ];
  const playersSelect = h(
    "select",
    {
      class: "select",
      "aria-label": "Número de jugadores",
      onchange: (event) => {
        players = event.target.value;
        loadGames();
      },
    },
    playersOptions
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
    h("div", { class: "stack-sm" }, h("div", { class: "section-label" }, "Por número de jugadores"), playersSelect),
    list
  );
}
