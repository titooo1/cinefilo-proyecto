document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       0. UTILIDADES Y DATOS DE RESPALDO CORREGIDOS
       ===================================================== */
    const RESPALDO = {
        codigo: "CF-2026-9841",
        nombre: "Ernesto",
        apellido: "Botacio",
        email: "usuario@correo.com",
        metodo: "Visa **** 4242",
        cupon: "",
        boleto: 650,
        cargo: 40,
        descuento: 0,
        subtotal: 690,  // $6.50 + $0.40
        itbms: 48,      // 7% de $6.90 = $0.48
        total: 738,     // Total exacto: $7.38
        asientos: ["Fila G · Asiento 1", "Fila G · Asiento 2"]
    };

    const formatoMoneda = (centavos) => `$${(centavos / 100).toFixed(2)}`;

    const setTexto = (id, texto) => {
        const el = document.getElementById(id);
        if (el) el.textContent = texto;
    };

    function leerPedido() {
        try {
            const crudo = sessionStorage.getItem("cinefilo_pedido");
            return crudo ? JSON.parse(crudo) : null;
        } catch (e) {
            return null;
        }
    }

    function pintarResumen() {
        const guardado = leerPedido() || {};
        const p = Object.assign({}, RESPALDO, guardado);

        const titular = `${guardado.nombre || ""} ${guardado.apellido || ""}`.trim()
            || `${RESPALDO.nombre} ${RESPALDO.apellido}`;
        const codigo = guardado.codigo || RESPALDO.codigo;

        setTexto("cf-email", guardado.email || RESPALDO.email);
        setTexto("cf-titular", titular);
        setTexto("cf-metodo", p.metodo);
        setTexto("cf-codigo", codigo);

        setTexto("cf-boleto", formatoMoneda(p.boleto));
        setTexto("cf-cargo", formatoMoneda(p.cargo));
        setTexto("cf-descuento-label", p.cupon ? `Cupón ${p.cupon}` : "Cupón o promoción");
        setTexto("cf-descuento", p.descuento > 0 ? `-${formatoMoneda(p.descuento)}` : "—");
        setTexto("cf-subtotal", formatoMoneda(p.subtotal));
        setTexto("cf-itbms", formatoMoneda(p.itbms));
        setTexto("cf-total", formatoMoneda(p.total));
        setTexto("cf-total-sticky", formatoMoneda(p.total));

        const listaEl = document.getElementById("cf-lista-asientos");
        if (listaEl && Array.isArray(p.asientos)) {
            listaEl.innerHTML = "";
            p.asientos.forEach((asiento) => {
                const li = document.createElement("li");
                li.textContent = asiento;
                listaEl.appendChild(li);
            });
        }

        const qr = document.getElementById("cf-qr");
        if (qr) {
            qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(codigo)}`;
        }
    }

    const video = document.getElementById("video-corriendo");
    if (video) {
        const reproducir = video.play();
        if (reproducir && typeof reproducir.catch === "function") reproducir.catch(() => {});

        const fuente = video.querySelector("source");
        const avisarError = () => {
            console.warn("No se pudo cargar el video de carga en: " + (fuente ? fuente.getAttribute("src") : ""));
            const caja = video.closest(".contenedor-mascota-carga");
            if (caja) caja.style.display = "none";
        };

        video.addEventListener("error", avisarError);
        if (fuente) fuente.addEventListener("error", avisarError);
    }

    const zonaCarga = document.getElementById("zona-carga");
    const zonaResumen = document.getElementById("zona-resumen");
    const pasos = Array.from(document.querySelectorAll("#carga-pasos li"));

    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURACION_PASO = reducirMovimiento ? 200 : 1200;

    function mostrarResumen() {
        if (zonaCarga) zonaCarga.classList.add("terminada");
        if (zonaResumen) zonaResumen.classList.add("listo");
        window.scrollTo(0, 0);

        const titulo = document.getElementById("titulo-confirmacion");
        if (titulo) titulo.focus({ preventScroll: true });
    }

    function ejecutarPaso(i) {
        if (i >= pasos.length) {
            setTimeout(mostrarResumen, reducirMovimiento ? 0 : 400);
            return;
        }

        pasos[i].classList.add("activo");

        setTimeout(() => {
            pasos[i].classList.remove("activo");
            pasos[i].classList.add("hecho");
            ejecutarPaso(i + 1);
        }, DURACION_PASO);
    }

    pintarResumen();

    if (pasos.length) {
        ejecutarPaso(0);
    } else {
        mostrarResumen();
    }

    const btnImprimir = document.getElementById("btn-imprimir");
    if (btnImprimir) {
        btnImprimir.addEventListener("click", () => window.print());
    }
});