import { h } from "../ui/dom.js";
import { authForm } from "../ui/authForm.js";
import { fetchMe, logout } from "../api/auth.js";
import { getSavedUser, clearSession } from "../storage/session.js";
import { showToast } from "../ui/toast.js";

// Cuenta: si no has entrado, el formulario; si has entrado, tu perfil.
export async function accountScreen() {
  const root = h("section", { class: "stack" });

  function drawForm() {
    root.replaceChildren(
      h("div", {}, h("h1", {}, "Cuenta"), h("p", { class: "muted" }, "Entra para tener tus estadísticas y tus propios juegos")),
      authForm({
        onDone: (user) => {
          showToast(`Hola, ${user.displayName}`);
          drawProfile(user);
        },
      })
    );
  }

  function drawProfile(user) {
    root.replaceChildren(
      h(
        "div",
        { class: "account-head" },
        h("div", { class: "account-avatar", "aria-hidden": "true" }, user.displayName.slice(0, 1).toUpperCase()),
        h("div", {}, h("h1", {}, user.displayName), h("p", { class: "muted" }, `@${user.username}`))
      ),
      h("button", { type: "button", class: "btn btn-secondary", onclick: onLogout }, "Cerrar sesión")
    );
  }

  async function onLogout() {
    if (!confirm("¿Cerrar sesión en este móvil?")) return;
    try {
      await logout();
    } catch {
      // aunque no haya conexión, en este móvil se cierra igualmente
    }
    clearSession();
    showToast("Has cerrado sesión");
    drawForm();
  }

  const saved = getSavedUser();
  if (!saved) {
    drawForm();
    return root;
  }

  // Hay sesión guardada: se muestra al momento y se comprueba que siga siendo válida
  drawProfile(saved);
  fetchMe()
    .then(({ user }) => root.isConnected && drawProfile(user))
    .catch((err) => {
      if (err.status === 401) {
        clearSession();
        showToast("Tu sesión ha caducado. Entra de nuevo");
        if (root.isConnected) drawForm();
      }
      // sin conexión: se deja el perfil guardado
    });
  return root;
}
