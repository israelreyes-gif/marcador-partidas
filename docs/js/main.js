import { addRoute, startRouter } from "./router.js";
import { homeScreen } from "./screens/home.js";
import { gamesScreen } from "./screens/games.js";
import { gameDetailScreen } from "./screens/gameDetail.js";
import { notFoundScreen } from "./screens/notFound.js";

// Cada pantalla nueva se registra aquí con una línea
addRoute("/", homeScreen);
addRoute("/juegos", gamesScreen);
addRoute("/juego/:id", gameDetailScreen);

startRouter(document.getElementById("app"), notFoundScreen);
