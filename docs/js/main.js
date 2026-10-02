import { addRoute, startRouter } from "./router.js";
import { homeScreen } from "./screens/home.js";
import { gamesScreen } from "./screens/games.js";
import { notFoundScreen } from "./screens/notFound.js";

// Cada pantalla nueva se registra aquí con una línea
addRoute("/", homeScreen);
addRoute("/juegos", gamesScreen);

startRouter(document.getElementById("app"), notFoundScreen);
