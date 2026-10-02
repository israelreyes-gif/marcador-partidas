// Crea elementos HTML de forma segura: el texto nunca se interpreta como HTML.
//   h("button", { class: "btn", onclick: fn }, "Texto", otroElemento)
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (name.startsWith("on") && typeof value === "function") {
      el.addEventListener(name.slice(2), value);
    } else if (name === "class") {
      el.className = value;
    } else {
      el.setAttribute(name, value === true ? "" : value);
    }
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}
