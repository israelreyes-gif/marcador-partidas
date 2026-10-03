import { addRoute, startRouter } from "./router.js";
import { homeScreen } from "./screens/home.js";
import { gamesScreen } from "./screens/games.js";
import { gameDetailScreen } from "./screens/gameDetail.js";
import { gameNewScreen, gameEditScreen } from "./screens/gameEdit.js";
import { newMatchScreen } from "./screens/newMatch.js";
import { matchScreen } from "./screens/match.js";
import { myMatchesScreen } from "./screens/myMatches.js";
import { accountScreen } from "./screens/account.js";
import { startBottomNav } from "./ui/bottomNav.js";
import { registerServiceWorker } from "./registerSw.js";
import { disableZoom } from "./noZoom.js";
import { notFoundScreen } from "./screens/notFound.js";

// Cada pantalla nueva se registra aquí con una línea
addRoute("/", homeScreen);
addRoute("/juegos", gamesScreen);
addRoute("/juego/:id", gameDetailScreen);
addRoute("/juego-nuevo", gameNewScreen);
addRoute("/juego-editar/:id", gameEditScreen);
addRoute("/nueva-partida/:gameId", newMatchScreen);
addRoute("/partida/:id", matchScreen);
addRoute("/partidas", myMatchesScreen);
addRoute("/cuenta", accountScreen);

startBottomNav(document.getElementById("nav"));
startRouter(document.getElementById("app"), notFoundScreen);
registerServiceWorker();
disableZoom();
