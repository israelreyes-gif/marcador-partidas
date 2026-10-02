import { addRoute, startRouter } from "./router.js";
import { homeScreen } from "./screens/home.js";
import { notFoundScreen } from "./screens/notFound.js";

// Cada pantalla nueva se registra aquí con una línea
addRoute("/", homeScreen);

startRouter(document.getElementById("app"), notFoundScreen);
