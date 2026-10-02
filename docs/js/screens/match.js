import { h } from "../ui/dom.js";
import { navigate } from "../router.js";
import { getMatch, addRound, updateRound, undoRound, finishMatch, reopenMatch, deleteMatch } from "../api/matches.js";
import { getSavedPassword, saveMatch, forgetMatch } from "../storage/myMatches.js";
import { needsWinnerChoice } from "../logic/standings.js";
import { matchHeader } from "../ui/matchHeader.js";
import { scoreboard } from "../ui/scoreboard.js";
import { roundsTable } from "../ui/roundsTable.js";
import { roundEditorForm } from "../ui/roundEditor.js";
import { openSheet, isSheetOpen } from "../ui/sheet.js";
import { askPassword } from "../ui/passwordPrompt.js";
import { pickWinner } from "../ui/winnerPicker.js";
import { showToast } from "../ui/toast.js";

const POLL_MS = 5000;

// Marcador de una partida: puntos, rondas y acciones.
// Se actualiza solo cada pocos segundos para ver los cambios de otros móviles.
export async function matchScreen({ id }) {
  const code = id.toUpperCase();
  let password = getSavedPassword(code);
  let match = null;
  let busy = false;

  const root = h("section", { class: "stack" });

  // ---------- carga ----------

  // Pide la contraseña mientras la partida privada la rechace
  async function loadAskingPassword() {
    let retry = false;
    for (;;) {
      try {
        return await getMatch(code, password);
      } catch (err) {
        if (err.status !== 401) throw err;
        const typed = await askPassword(
          retry ? "Contraseña incorrecta. Prueba otra vez." : "Esta partida es privada. Escribe su contraseña para verla."
        );
        if (typed === null) return null;
        password = typed;
        retry = true;
      }
    }
  }

  // Devuelve "ok", "cancelled" o "error" (el error ya queda dibujado)
  async function firstLoad() {
    try {
      const loaded = await loadAskingPassword();
      if (!loaded) return "cancelled";
      match = loaded;
      saveMatch(code, password); // la partida queda en este móvil
      draw();
      return "ok";
    } catch (err) {
      root.replaceChildren(
        h("a", { href: "#/", class: "back-link" }, "‹ Inicio"),
        h("p", { class: "error" }, err.message)
      );
      return "error";
    }
  }

  function drawLocked() {
    root.replaceChildren(
      h("a", { href: "#/", class: "back-link" }, "‹ Inicio"),
      h("h1", {}, `Partida ${code}`),
      h("p", { class: "muted" }, "Esta partida es privada."),
      h("button", { type: "button", class: "btn", onclick: async () => (await firstLoad()) === "cancelled" && drawLocked() }, "Escribir contraseña")
    );
  }

  async function refresh() {
    try {
      match = await getMatch(code, password);
      draw();
    } catch (err) {
      if (err.status === 404) {
        forgetMatch(code);
        showToast("Esta partida ya no existe");
        navigate("/");
      }
    }
  }

  // ---------- acciones ----------

  async function handleError(err) {
    if (err.status === 401) {
      showToast("Contraseña incorrecta");
      const typed = await askPassword("Escribe la contraseña de la partida para poder editarla.");
      if (typed) {
        password = typed;
        saveMatch(code, typed);
        await refresh();
      }
      return;
    }
    showToast(err.message);
    if (err.status === 404 || err.status === 409) await refresh();
  }

  // Ejecuta una acción que devuelve la partida actualizada
  async function run(action) {
    if (busy) return;
    busy = true;
    try {
      match = await action();
      draw();
    } catch (err) {
      await handleError(err);
    } finally {
      busy = false;
    }
  }

  function openRoundSheet({ title, initial, submitLabel, save }) {
    const close = openSheet(
      roundEditorForm({
        players: match.players,
        initial,
        submitLabel,
        onSubmit: async (scores) => {
          match = await save(scores);
          close();
          draw();
        },
      }),
      { title }
    );
  }

  const onAddRound = () =>
    openRoundSheet({
      title: `Ronda ${match.rounds.length + 1}`,
      submitLabel: "Apuntar ronda",
      save: (scores) => addRound(code, scores, password),
    });

  const onEditRound = (round) =>
    openRoundSheet({
      title: `Corregir ronda ${round.number}`,
      initial: round.scores,
      submitLabel: "Guardar cambios",
      save: (scores) => updateRound(code, round.number, scores, password),
    });

  function onUndo() {
    if (confirm("¿Deshacer la última ronda?")) run(() => undoRound(code, password));
  }

  async function onFinish() {
    let winnerId;
    if (needsWinnerChoice(match)) {
      const choice = await pickWinner(match.players);
      if (!choice) return;
      winnerId = choice.id;
    }
    run(() => finishMatch(code, winnerId, password));
  }

  async function onDelete() {
    if (!confirm("¿Borrar esta partida? Se borra para todos y no se puede recuperar.")) return;
    busy = true;
    try {
      await deleteMatch(code, password);
      forgetMatch(code);
      showToast("Partida borrada");
      navigate("/");
    } catch (err) {
      await handleError(err);
    } finally {
      busy = false;
    }
  }

  async function onUnlock() {
    const typed = await askPassword("Escribe la contraseña de la partida para poder editarla.");
    if (!typed) return;
    password = typed;
    await refresh();
    if (match.canEdit) saveMatch(code, typed);
    else showToast("Contraseña incorrecta");
  }

  // ---------- pantalla ----------

  function banner() {
    if (match.status === "finished") {
      const winner = match.players.find((p) => p.id === match.winnerPlayerId);
      return h("div", { class: "banner banner--win" }, winner ? `Ha ganado ${winner.name}` : "Partida terminada sin ganador");
    }
    if (!match.canEdit) {
      return h(
        "div",
        { class: "banner" },
        h("div", {}, "Solo puedes ver esta partida."),
        h("button", { type: "button", class: "btn-text", onclick: onUnlock }, "Tengo la contraseña")
      );
    }
    return null;
  }

  function actions() {
    if (!match.canEdit) return null;

    if (match.status === "finished") {
      return h("button", { type: "button", class: "btn btn-secondary", onclick: () => run(() => reopenMatch(code, password)) }, "Reabrir partida");
    }
    return h(
      "div",
      { class: "stack-sm" },
      h("button", { type: "button", class: "btn", onclick: onAddRound }, "Apuntar ronda"),
      h(
        "div",
        { class: "actions-row" },
        h("button", { type: "button", class: "btn btn-secondary", disabled: match.rounds.length === 0, onclick: onUndo }, "Deshacer última"),
        h("button", { type: "button", class: "btn btn-secondary", onclick: onFinish }, "Terminar")
      )
    );
  }

  function draw() {
    const editable = match.canEdit && match.status === "active";
    root.replaceChildren(
      matchHeader(match),
      scoreboard(match),
      banner(),
      actions(),
      h("h2", { class: "section-title" }, "Rondas"),
      roundsTable(match, editable ? onEditRound : null),
      match.canEdit ? h("button", { type: "button", class: "btn-text btn-text--danger", onclick: onDelete }, "Borrar partida") : null
    );
  }

  // ---------- actualización automática ----------

  async function poll() {
    if (!root.isConnected) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      return;
    }
    if (!match || busy || document.hidden || isSheetOpen()) return;
    try {
      const fresh = await getMatch(code, password);
      if (JSON.stringify(fresh) !== JSON.stringify(match)) {
        match = fresh;
        draw();
      }
    } catch {
      // sin conexión un momento: se reintenta en la siguiente vuelta
    }
  }
  const timer = setInterval(poll, POLL_MS);
  const onVisible = () => !document.hidden && poll();
  document.addEventListener("visibilitychange", onVisible);

  if ((await firstLoad()) === "cancelled") drawLocked();
  return root;
}
