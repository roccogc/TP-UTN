
(function () {
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  const CART_KEY = "cart_simple_v1";

  function cargarCarrito() {
    let texto = localStorage.getItem(CART_KEY);
    if (!texto) return [];
    try { return JSON.parse(texto); } catch (e) { return []; }
  }

  function guardarCarrito(carrito) {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
    actualizarContador();
  }

  function actualizarContador() {
    let carrito = cargarCarrito();
    let cantidadTotal = 0;
    for (let i = 0; i < carrito.length; i++) {
      cantidadTotal += carrito[i].cantidad;
    }
    $all(".mini-cart-count").forEach(function (el) {
      el.textContent = String(cantidadTotal);
    });
  }

  function precioANumero(txt) {
    if (!txt) return 0;
    return Number(txt.replace(/[^\d]/g, "")) || 0;
  }

  function formatear(n) {
    try {
      return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return "$ " + (n | 0).toLocaleString("es-AR");
    }
  }

  function agregarAlCarrito(item) {
    let carrito = cargarCarrito();
    let encontrado = -1;
    for (let i = 0; i < carrito.length; i++) {
      if (carrito[i].id === item.id) { encontrado = i; break; }
    }
    if (encontrado >= 0) {
      carrito[encontrado].cantidad += item.cantidad || 1;
    } else {
      item.cantidad = item.cantidad || 1;
      carrito.push(item);
    }
    guardarCarrito(carrito);
    alert("Producto añadido al carrito");
  }

  function quitarDelCarrito(id) {
    let carrito = cargarCarrito();
    let nuevo = [];
    for (let i = 0; i < carrito.length; i++) {
      if (carrito[i].id !== id) nuevo.push(carrito[i]);
    }
    guardarCarrito(nuevo);
  }

  function cambiarCantidad(id, cantidad) {
    if (cantidad < 1) cantidad = 1;
    let carrito = cargarCarrito();
    for (let i = 0; i < carrito.length; i++) {
      if (carrito[i].id === id) {
        carrito[i].cantidad = cantidad;
        break;
      }
    }
    guardarCarrito(carrito);
  }

  function totalCarrito() {
    let carrito = cargarCarrito();
    let total = 0;
    for (let i = 0; i < carrito.length; i++) {
      total += carrito[i].precio * carrito[i].cantidad;
    }
    return total;
  }

  function enlazarBotonesCatalogo() {
    $all(".add-to-cart, .card .actions a").forEach(function (btn) {
      let texto = (btn.textContent || "").trim().toLowerCase();
      if (texto.indexOf("añadir") === -1 && !btn.classList.contains("add-to-cart")) return;

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        let card = btn.closest(".card") || document;
        let titulo = (card.querySelector(".title") || {}).textContent || "Producto";
        let precioTxt = (card.querySelector(".price") || {}).textContent || "0";
        let img = (card.querySelector("img") || {}).getAttribute ? card.querySelector("img").getAttribute("src") : "";

        let id = titulo.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
        let precio = precioANumero(precioTxt);
        agregarAlCarrito({ id: id, titulo: titulo.trim(), precio: precio, img: img });
      });
    });
  }

  function enlazarBotonProducto() {
    let btn = document.querySelector(".hero-card a.btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      let cont = btn.closest(".hero-card") || document;
      let titulo = (cont.querySelector("h1") || {}).textContent || "Producto";
      let precioTxt = (cont.querySelector(".price") || {}).textContent || "0";
      let img = (cont.querySelector("img") || {}).getAttribute ? cont.querySelector("img").getAttribute("src") : "";

      let id = titulo.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
      let precio = precioANumero(precioTxt);
      agregarAlCarrito({ id: id, titulo: titulo.trim(), precio: precio, img: img });
      location.href = "cart.html";
    });
  }

  function renderCarrito() {
    if (location.pathname.indexOf("cart.html") === -1) return;
    let tbody = document.querySelector("table.table tbody");
    let totalCell = document.querySelector("table.table tfoot td:last-child");
    if (!tbody || !totalCell) return;

    let carrito = cargarCarrito();
    tbody.innerHTML = "";

    if (carrito.length === 0) {
      let finalizar_compra_btn = document.getElementById("finalizar_compra_btn");
      finalizar_compra_btn.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Tu carrito está vacío.");
        location.href = "products.html";
      });
      let tr = document.createElement("tr");
      let td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "Tu carrito está vacío.";
      td.style.textAlign = "center";
      tr.appendChild(td);
      tbody.appendChild(tr);
      totalCell.textContent = formatear(0);
      return;
    }

    for (let i = 0; i < carrito.length; i++) {
      (function (item) {
        let tr = document.createElement("tr");

        let tdNombre = document.createElement("td");
        tdNombre.textContent = item.titulo;

        let tdPrecio = document.createElement("td");
        tdPrecio.textContent = formatear(item.precio);

        let tdQty = document.createElement("td");
        let input = document.createElement("input");
        input.type = "number"; input.min = "1"; input.value = item.cantidad;
        input.style.width = "70px";
        input.addEventListener("change", function () {
          cambiarCantidad(item.id, parseInt(input.value || "1", 10));
          renderCarrito();
        });
        let btnQuitar = document.createElement("button");
        btnQuitar.innerHTML = "🗑️";
        btnQuitar.title = "Quitar del carrito";
        btnQuitar.style.marginLeft = "8px";
        btnQuitar.style.cursor = "pointer";
        btnQuitar.style.background = "transparent";
        btnQuitar.style.border = "none";
        btnQuitar.style.fontSize = "18px";
        btnQuitar.addEventListener("click", function () {
          quitarDelCarrito(item.id);
          renderCarrito();
        });
        tdQty.appendChild(input);
        tdQty.appendChild(btnQuitar);

        let tdSub = document.createElement("td");
        tdSub.textContent = formatear(item.precio * item.cantidad);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdQty);
        tr.appendChild(tdSub);
        tbody.appendChild(tr);
      })(carrito[i]);
    }
    totalCell.textContent = formatear(totalCarrito());
  }

  function prepararCheckout() {
    const form_checkout = document.getElementById("checkout_form");

    const nombre_input = document.getElementById("nombre_input")
    const apellido_input = document.getElementById("apellido_input")
    const email_input = document.getElementById("email_input")
    const telefono_input = document.getElementById("telefono_input")
    const direccion_input = document.getElementById("direccion_input")
    const ciudad_input = document.getElementById("ciudad_input")
    const cp_input = document.getElementById("cp_input")
    const titular_input = document.getElementById("titular_input")
    const dni_input = document.getElementById("dni_input")
    const tarjeta_input = document.getElementById("tarjeta_input")
    const vencimiento_input = document.getElementById("vencimiento_input")
    const cvv_input = document.getElementById("cvv_input")

    const error_checkout = document.getElementById("error_checkout");
    
    form_checkout.addEventListener("submit", function (e) {
      let errors = [];
        errors = checkoutformErrors(nombre_input.value.trim(), apellido_input.value.trim(), email_input.value.trim(), telefono_input.value.trim(), direccion_input.value.trim(), ciudad_input.value.trim(), cp_input.value.trim(), titular_input.value.trim(), dni_input.value.trim(), tarjeta_input.value.trim(), vencimiento_input.value.trim(), cvv_input.value.trim());
        if (errors.length > 0) {
              e.preventDefault();
              error_checkout.innerHTML =("<strong>Revisá estos campos:</strong><br>") + errors.join(" <br>");
            }

        function checkoutformErrors(nombre, apellido, email, telefono, direccion, ciudad, cp, titular, dni, tarjeta, vencimiento, cvv) {
          let errors = [];

            if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,}$/.test(nombre)) {
              errors.push("Nombre invalido.");
              nombre_input.parentElement.classList.add("error");
            }
            if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,}$/.test(apellido)){
              errors.push("Apellido invalido.");
              apellido_input.parentElement.classList.add("error");
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
              errors.push("Email invalido.");
              email_input.parentElement.classList.add("error");
            }
            if (!/^\+?\d{7,15}$/.test(telefono)){
              errors.push("Teléfono invalido.");
              telefono_input.parentElement.classList.add("error");
            }
            if (direccion.length < 5){
              errors.push("Dirección invalida.");
              direccion_input.parentElement.classList.add("error");
            }
            if (ciudad.length < 2){
              errors.push("Ciudad invalida.");
              ciudad_input.parentElement.classList.add("error");
            }
            if (!/^\d{4,8}$/.test(cp)){
              errors.push("Código postal invalido.");
              cp_input.parentElement.classList.add("error");
            }
            if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{5,}$/.test(titular)){
              errors.push("Nombre del titular invalido.");
              titular_input.parentElement.classList.add("error");
            }
            if (!/^\d{6,9}$/.test(dni)){
              errors.push("DNI invalido.");
              dni_input.parentElement.classList.add("error");
            }
            if (!/^\d{13,19}$/.test(tarjeta)){
              errors.push("Número de tarjeta invalido.");
              tarjeta_input.parentElement.classList.add("error");
            }
            if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(vencimiento)){
              errors.push("Fecha de vencimiento invalida.");
              vencimiento_input.parentElement.classList.add("error");
            }
            if (!/^\d{3,4}$/.test(cvv)){
              errors.push("Código de Seguridad invalido.");
              cvv_input.parentElement.classList.add("error");
            }
            return errors;
        }
          let inputs_checkout = [nombre_input, apellido_input, email_input, telefono_input, direccion_input, ciudad_input, cp_input, titular_input, dni_input, tarjeta_input, vencimiento_input, cvv_input];
          inputs_checkout.forEach(input => {
            input.addEventListener("input", () => {
              if(input.parentElement.classList.contains("error")){
                input.parentElement.classList.remove("error");
                error_checkout.innerText = "";
              }
            });
          });
      if (errors.length === 0) {
        let total = formatear(totalCarrito());
        localStorage.removeItem(CART_KEY);
        actualizarContador();
        alert("¡Gracias por tu compra! Total: " + total);
        location.href = "index.html";
      }
    });
  }
  function insertarMiniContador() {
    let link = document.querySelector("a[href*='cart.html']");
    if (!link) return;
    let span = document.createElement("span");
    span.className = "mini-cart-count";
    span.style.marginLeft = "6px";
    span.style.border = "1px solid #aaa";
    span.style.padding = "2px 6px";
    span.style.borderRadius = "999px";
    link.appendChild(span);
    actualizarContador();
  }
  document.addEventListener("DOMContentLoaded", function () {
    insertarMiniContador();
    enlazarBotonesCatalogo();
    enlazarBotonProducto();
    renderCarrito();
    prepararCheckout();
  });

  (function () {
  const THEME_KEY = "theme_pref_v1";
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }
  function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    localStorage.setItem(THEME_KEY, theme);
    const tBtn = document.getElementById("themeToggle");
    if (tBtn) tBtn.textContent = theme === "light" ? "Modo Oscuro" : "Modo Claro";
  }
  function toggleTheme() {
    applyTheme(getTheme() === "light" ? "dark" : "light");
  }

  function ensureThemeButton() {
    const btn = document.getElementById("themeToggle");
    if (btn && !btn._bound) {
      btn.addEventListener("click", toggleTheme);
      btn._bound = true;
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getTheme());
    ensureThemeButton();
    setupCheckout();
  });
}());
})();
