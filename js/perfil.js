document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       0. CONFIGURACIÓN (todo lo que puedes editar está aquí)
       ===================================================== */

    // Claves de localStorage (datos de demostración: en producción vienen del backend)
    const CLAVES = {
        usuario: "cinefilo_usuario",
        puntos: "cinefilo_puntos",
        avatar: "cinefilo_avatar",
        premios: "cinefilo_premios",
        historial: "cinefilo_historial"
    };

    const USUARIO_DEMO = { nombre: "Ernesto Botacio", email: "usuario@correo.com", desde: "Oct 2026" };
    const PUNTOS_DEMO = 340;  // saldo inicial de demostración (igual que en confirmar.js)
    const MAX_PUNTOS = 900;   // meta final de la barra de progreso

    // Los 6 personajes. Pon tus imágenes en assets/img/avatares/ con estos nombres
    // (o cambia "archivo"). Mientras no existan se muestra la inicial sobre el color.
    const AVATARES = [
        { id: "av1", nombre: "Cinefilito", archivo: "assets/img/avatares/avatar-1.png", color: "#dbeafe" },
        { id: "av2", nombre: "Palomita",   archivo: "assets/img/avatares/avatar-2.png", color: "#ffedd5" },
        { id: "av3", nombre: "Claqueta",   archivo: "assets/img/avatares/avatar-3.png", color: "#fce7f3" },
        { id: "av4", nombre: "Director",   archivo: "assets/img/avatares/avatar-4.png", color: "#dcfce7" },
        { id: "av5", nombre: "Estrella",   archivo: "assets/img/avatares/avatar-5.png", color: "#ede9fe" },
        { id: "av6", nombre: "Fantasma",   archivo: "assets/img/avatares/avatar-6.png", color: "#fef9c3" }
    ];

    // Premios: se desbloquean al ALCANZAR los puntos (no descuentan saldo).
    // "imagen": ruta opcional; si la pones, reemplaza el arte del cupón.
    const PREMIOS = [
        { id: "p10",     puntos: 100, etiqueta: "Descuento", valor: "10%",    titulo: "Cupón 10% de descuento", prefijo: "CP10",   tono: "azul",    imagen: "" },
        { id: "p25",     puntos: 250, etiqueta: "Descuento", valor: "25%",    titulo: "Cupón 25% de descuento", prefijo: "CP25",   tono: "marino",  imagen: "" },
        { id: "p50",     puntos: 400, etiqueta: "Descuento", valor: "50%",    titulo: "Cupón 50% de descuento", prefijo: "CP50",   tono: "naranja", imagen: "" },
        { id: "p2x1",    puntos: 600, etiqueta: "Promo",     valor: "2x1",    titulo: "Boleto 2x1",             prefijo: "CP2X1",  tono: "rojo",    imagen: "" },
        { id: "pgratis", puntos: 900, etiqueta: "Entrada",   valor: "Gratis", titulo: "Entrada gratis",         prefijo: "CPFREE", tono: "ambar",   imagen: "" }
    ];

    /* =====================================================
       1. UTILIDADES
       ===================================================== */
    const $ = (id) => document.getElementById(id);
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // localStorage con try/catch (puede estar bloqueado en modo privado)
    function leer(clave, defecto) {
        try {
            const crudo = localStorage.getItem(clave);
            return crudo === null ? defecto : JSON.parse(crudo);
        } catch (e) {
            return defecto;
        }
    }

    function guardar(clave, valor) {
        try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* se ignora */ }
    }

    // Crea un elemento con clase y texto (textContent: nunca interpreta HTML)
    function el(etiqueta, clases, texto) {
        const nodo = document.createElement(etiqueta);
        if (clases) nodo.className = clases;
        if (texto !== undefined) nodo.textContent = texto;
        return nodo;
    }

    /* =====================================================
       2. ESTADO
       ===================================================== */
    const usuario = Object.assign({}, USUARIO_DEMO, leer(CLAVES.usuario, {}));

    // Si nunca se guardó saldo, se siembra el de demostración para que coincida con confirmar.js
    let puntos = Number(leer(CLAVES.puntos, null));
    if (!Number.isFinite(puntos) || localStorage.getItem(CLAVES.puntos) === null) {
        puntos = PUNTOS_DEMO;
        guardar(CLAVES.puntos, puntos);
    }

    let avatarId = leer(CLAVES.avatar, null);
    let reclamados = leer(CLAVES.premios, {}); // { idPremio: "codigo" }

    /* =====================================================
       3. AVISO (TOAST) Y CONFETI
       ===================================================== */
    let temporizadorToast;
    function toast(mensaje) {
        const nodo = $("toast");
        if (!nodo) return;
        nodo.textContent = mensaje;
        nodo.classList.add("visible");
        clearTimeout(temporizadorToast);
        temporizadorToast = setTimeout(() => nodo.classList.remove("visible"), 2600);
    }

    // Ráfaga de confeti desde un rectángulo (el botón que se presionó)
    function confeti(rect) {
        const capa = $("confeti-capa");
        if (reducirMovimiento || !capa) return;

        const colores = ["#ea580c", "#2563eb", "#e11d48", "#f59e0b", "#03122e"];
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        for (let i = 0; i < 26; i++) {
            const pieza = el("span", "confeti-pieza");
            const angulo = Math.random() * Math.PI * 2;
            const distancia = 60 + Math.random() * 110;
            pieza.style.left = `${cx}px`;
            pieza.style.top = `${cy}px`;
            pieza.style.backgroundColor = colores[i % colores.length];
            pieza.style.setProperty("--dx", `${Math.cos(angulo) * distancia}px`);
            pieza.style.setProperty("--dy", `${Math.sin(angulo) * distancia + 40}px`); // +40: cae un poco
            pieza.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
            capa.appendChild(pieza);
            setTimeout(() => pieza.remove(), 1000);
        }
    }

    /* =====================================================
       4. CABECERA: NOMBRE, CORREO Y AVATAR
       ===================================================== */
    function pintarAvatar(contenedor, avatar, nombreAlterno) {
        contenedor.textContent = "";
        contenedor.style.backgroundColor = avatar ? avatar.color : "#dbeafe";

        const inicial = () => el("span", "avatar-inicial", (avatar ? avatar.nombre : nombreAlterno).charAt(0).toUpperCase());

        if (!avatar) {
            contenedor.appendChild(inicial());
            return;
        }

        // Si la imagen aún no existe, se muestra la inicial sobre el color del personaje
        const img = new Image();
        img.alt = avatar.nombre;
        img.addEventListener("error", () => { img.remove(); contenedor.appendChild(inicial()); });
        img.src = avatar.archivo;
        contenedor.appendChild(img);
    }

    function pintarUsuario() {
        $("perfil-nombre").textContent = usuario.nombre;
        $("perfil-email").textContent = usuario.email;
        $("perfil-desde").textContent = usuario.desde;
        pintarAvatar($("avatar-grande"), AVATARES.find((a) => a.id === avatarId) || null, usuario.nombre);
    }

    /* =====================================================
       5. SELECTOR DE PERSONAJES (diálogo nativo)
       ===================================================== */
    const dialogo = $("dialogo-avatar");
    const contenedorOpciones = $("avatar-opciones");

    function construirOpciones() {
        contenedorOpciones.textContent = "";
        AVATARES.forEach((avatar) => {
            const boton = el("button", "avatar-opcion");
            boton.type = "button";
            boton.dataset.id = avatar.id;

            const imagen = el("span", "avatar-opcion-img");
            pintarAvatar(imagen, avatar, avatar.nombre);
            boton.appendChild(imagen);
            boton.appendChild(el("span", "avatar-opcion-nombre", avatar.nombre));

            boton.addEventListener("click", () => elegirAvatar(avatar));
            contenedorOpciones.appendChild(boton);
        });
    }

    function marcarSeleccionado() {
        contenedorOpciones.querySelectorAll(".avatar-opcion").forEach((boton) => {
            const activo = boton.dataset.id === avatarId;
            boton.classList.toggle("seleccionado", activo);
            boton.setAttribute("aria-pressed", String(activo));
        });
    }

    function elegirAvatar(avatar) {
        avatarId = avatar.id;
        guardar(CLAVES.avatar, avatarId);
        pintarUsuario();
        dialogo.close();
        toast(`Ahora eres ${avatar.nombre}`);
    }

    function abrirDialogo() {
        marcarSeleccionado();
        if (typeof dialogo.showModal === "function") dialogo.showModal();
        else dialogo.setAttribute("open", ""); // respaldo para navegadores antiguos
    }

    $("btn-editar-avatar").addEventListener("click", abrirDialogo);
    $("cerrar-dialogo").addEventListener("click", () => dialogo.close());

    // Clic en el fondo oscuro (el propio <dialog>) cierra; el contenido tiene su propio padding
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });

    /* =====================================================
       6. CINEPOINTS: SALDO, MENSAJE Y PROGRESO
       ===================================================== */
    function animarNumero(nodo, hasta) {
        if (reducirMovimiento || hasta === 0) { nodo.textContent = String(hasta); return; }
        const inicio = performance.now();
        const duracion = 900;
        function paso(ahora) {
            const t = Math.min((ahora - inicio) / duracion, 1);
            const suavizado = 1 - Math.pow(1 - t, 3); // ease-out
            nodo.textContent = String(Math.round(hasta * suavizado));
            if (t < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
    }

    function pintarMensajeSiguiente() {
        const meta = $("saldo-meta");
        meta.textContent = "";
        const siguiente = PREMIOS.find((p) => puntos < p.puntos);

        if (!siguiente) {
            meta.textContent = "¡Desbloqueaste todos los premios!";
            return;
        }
        const nombre = siguiente.titulo.charAt(0).toLowerCase() + siguiente.titulo.slice(1);
        meta.appendChild(document.createTextNode("Te faltan "));
        meta.appendChild(el("strong", "", `${siguiente.puntos - puntos} pts`));
        meta.appendChild(document.createTextNode(` para tu ${nombre}.`));
    }

    function pintarProgreso() {
        const hitos = $("progreso-hitos");
        hitos.textContent = "";

        PREMIOS.forEach((premio) => {
            const hito = el("li", "hito" + (puntos >= premio.puntos ? " alcanzado" : ""));
            hito.style.left = `${(premio.puntos / MAX_PUNTOS) * 100}%`;
            hito.appendChild(el("span", "hito-punto"));
            hito.appendChild(el("span", "hito-etiqueta", String(premio.puntos)));
            hitos.appendChild(hito);
        });

        const barra = $("progreso");
        barra.setAttribute("aria-valuenow", String(Math.min(puntos, MAX_PUNTOS)));

        // Se asigna tras un frame para que la transición CSS anime el llenado
        requestAnimationFrame(() => {
            $("progreso-relleno").style.width = `${Math.min(puntos / MAX_PUNTOS, 1) * 100}%`;
        });
    }

    function pintarPuntos() {
        animarNumero($("saldo-puntos"), puntos);
        pintarMensajeSiguiente();
        pintarProgreso();
    }

    /* =====================================================
       7. PREMIOS: BLOQUEADO / DISPONIBLE / RECLAMADO
       ===================================================== */
    const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos

    function generarCodigo(prefijo) {
        let sufijo = "";
        for (let i = 0; i < 4; i++) sufijo += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length));
        return `${prefijo}-${sufijo}`;
    }

    async function copiar(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            toast("Código copiado");
        } catch (e) {
            // Respaldo (por ejemplo, al abrir el archivo sin servidor)
            const area = document.createElement("textarea");
            area.value = texto;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            try { document.execCommand("copy"); toast("Código copiado"); }
            catch (err) { toast(`Tu código: ${texto}`); }
            area.remove();
        }
    }

    function reclamar(premio, boton) {
        if (puntos < premio.puntos || reclamados[premio.id]) return;

        const rect = boton.getBoundingClientRect(); // antes de redibujar
        reclamados[premio.id] = generarCodigo(premio.prefijo);
        guardar(CLAVES.premios, reclamados);

        pintarPremios();
        confeti(rect);
        toast(`¡Premio reclamado! Tu código: ${reclamados[premio.id]}`);
    }

    function crearVisual(premio) {
        const visual = el("div", `premio-visual tono-${premio.tono}`);

        if (premio.imagen) {
            const img = new Image();
            img.alt = "";
            img.addEventListener("error", () => img.remove()); // si falla, queda el arte
            img.src = premio.imagen;
            visual.appendChild(img);
        }

        visual.appendChild(el("span", "pv-etiqueta", premio.etiqueta));
        visual.appendChild(el("span", "pv-valor" + (premio.valor.length > 3 ? " pv-texto" : ""), premio.valor));
        visual.appendChild(el("span", "pv-marca", "CINEFILO"));

        // Candado (solo visible cuando el premio está bloqueado)
        const candado = el("span", "pv-candado");
        candado.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
        visual.appendChild(candado);

        return visual;
    }

    function pintarPremios() {
        const lista = $("premios-grid");
        lista.textContent = "";

        PREMIOS.forEach((premio) => {
            const codigo = reclamados[premio.id];
            const alcanzado = puntos >= premio.puntos;
            const estado = codigo ? "reclamado" : alcanzado ? "disponible" : "bloqueado";

            const item = el("li", `premio ${estado}`);
            item.appendChild(crearVisual(premio));
            item.appendChild(el("h3", "premio-titulo", premio.titulo));
            item.appendChild(el("p", "premio-req", `Desde ${premio.puntos} puntos`));

            const accion = el("div", "premio-accion");

            if (estado === "bloqueado") {
                accion.appendChild(el("span", "faltan", `Te faltan ${premio.puntos - puntos} pts`));
            } else if (estado === "disponible") {
                const boton = el("button", "btn-reclamar", "Reclamar");
                boton.type = "button";
                boton.addEventListener("click", () => reclamar(premio, boton));
                accion.appendChild(boton);
            } else {
                const caja = el("div", "cupon-reclamado");
                caja.appendChild(el("code", "cupon-codigo", codigo));
                const copiarBtn = el("button", "btn-copiar", "Copiar");
                copiarBtn.type = "button";
                copiarBtn.addEventListener("click", () => copiar(codigo));
                caja.appendChild(copiarBtn);
                accion.appendChild(caja);
            }

            item.appendChild(accion);
            lista.appendChild(item);
        });
    }

    /* =====================================================
       8. ACTIVIDAD RECIENTE (la registra confirmar.js al acreditar puntos)
       ===================================================== */
    function pintarActividad() {
        const lista = $("lista-actividad");
        const vacia = $("actividad-vacia");
        const historial = leer(CLAVES.historial, []);
        lista.textContent = "";

        if (!Array.isArray(historial) || historial.length === 0) {
            vacia.hidden = false;
            return;
        }
        vacia.hidden = true;

        historial.slice(0, 5).forEach((compra) => {
            const fecha = new Date(compra.fecha);
            const textoFecha = isNaN(fecha) ? "" : fecha.toLocaleDateString("es-PA", { day: "numeric", month: "short", year: "numeric" });
            const metodo = compra.metodo === "yappy" ? "Yappy" : "Tarjeta";
            const boletos = Number(compra.boletos) || 1;
            const detalle = [textoFecha, metodo, `${boletos} ${boletos === 1 ? "boleto" : "boletos"}`].filter(Boolean).join(" · ");

            const item = el("li", "actividad-item");
            const info = el("div");
            info.appendChild(el("span", "actividad-peli", compra.pelicula || "Compra de boletos"));
            info.appendChild(el("span", "actividad-detalle", detalle));
            item.appendChild(info);
            item.appendChild(el("span", "actividad-puntos", `+${Number(compra.puntos) || 0} pts`));
            lista.appendChild(item);
        });
    }

    /* =====================================================
       9. ARRANQUE
       ===================================================== */
    construirOpciones();
    pintarUsuario();
    pintarPuntos();
    pintarPremios();
    pintarActividad();
});