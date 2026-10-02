import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { gameCard } from "../ui/gameCard.js";

const DECK_FILTERS = [
  { value: "", label: "Todos" },
  { value: "espanola", label: "Española" },
  { value: "francesa", label: "Francesa" },
  { value: "otra", label: "Otras" },
];

const SEARCH_DELAY_MS = 300;

// Lista de juegos con buscador y filtro por baraja
export async function gamesScreen() {
  let deck = "";
  let query = "";
  let lastRequest = 0;
  let timer = null;

  const list = h("div", { class: "game-list" });
  const chips = h("div", { class: "chips" });

  async function loadGames() {
    const thisRequest = ++lastRequest;
    const params = new URLSearchParams();
    if (deck) params.set("deck", deck);
    if (query) params.set("q", query);

    try {
      const { games } = await request("GET", `/api/games?${params}`);
      if (thisRequest !== lastRequest) return; // llegó tarde: ya hay una búsqueda más nueva
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

  drawChips();
  loadGames();

  return h(
    "section",
    { class: "stack" },
    h("a", { href: "#/", class: "back-link" }, "‹ Inicio"),
    h("h1", {}, "Juegos de cartas"),
    search,
    chips,
    list
  );
}
