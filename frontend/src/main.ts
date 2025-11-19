import { Router } from "./router";
import HomePage from "./pages/home.ts";
//mport GamePage from "./pages/game.ts"
import NotFoundPage from "./pages/notFound.ts";


const routes = [
  { path: "/", view: HomePage },
  //{ path: "/Game", view: GamePage },
  { path: "*", view: NotFoundPage },
];

new Router(routes, "#app");