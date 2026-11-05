document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       0. CARGA DE DATOS REALES DE LA SESIÓN
       ===================================================== */
    let reservaActual = null;
    try {
        const guardado = sessionStorage.getItem("cinefilo_reserva_temp");
        if (guardado) reservaActual = JSON.parse(guardado);
    } catch (e) { console.warn("No se encontró reserva previa guardada."); }

    if (!reservaActual) {
        reservaActual = {
            boletos: [{ tipo: "General Adulto", cantidad: 1, precio: 650 }]
        };
    }

    const TARIFA = {
        cargoPorBoleto: 40,   // $0.40 por boleto
        itbmsRatio: 0.07,     // 7% ITBMS
        cuponValido: "CINE2026",
        descuentoFijo: 65     // Descuento de $0.65 de prueba
    };

    const formatoMoneda = (centavos) => `$${(centavos / 100).toFixed(2)}`;
    const setTexto = (id, texto) => { const el = document.getElementById(id); if (el) el.textContent = texto; };
    let cuponAplicado = false;

    /* =====================================================
       1. RENDERING DINÁMICO DEL TICKET
       ===================================================== */
    function renderTicket() {
        const contenedorDesglose = document.getElementById("desglose-boletos-contenedor");
        if (!contenedorDesglose) return;

        contenedorDesglose.innerHTML = "";
        let totalBoletosConteo = 0;
        let subtotalBoletos = 0;

        reservaActual.boletos.forEach(b => {
            if (b.cantidad > 0) {
                totalBoletosConteo += b.cantidad;
                const totalItem = b.precio * b.cantidad;
                subtotalBoletos += totalItem;

                const fila = document.createElement("div");
                fila.className = "linea-desglose";
                fila.innerHTML = `<span>x${b.cantidad} Boleto ${b.tipo}</span><span>${formatoMoneda(totalItem)}</span>`;
                contenedorDesglose.appendChild(fila);
            }
        });

        const totalCargos = TARIFA.cargoPorBoleto * totalBoletosConteo;
        const filaCargo = document.createElement("div");
        filaCargo.className = "linea-desglose";
        filaCargo.innerHTML = `<span>Cargo por servicio online</span><span>${formatoMoneda(totalCargos)}</span>`;
        contenedorDesglose.appendChild(filaCargo);

        let descuentoTotal = 0;
        if (cuponAplicado) {
            descuentoTotal = TARIFA.descuentoFijo;
            const filaCupon = document.createElement("div");
            filaCupon.className = "linea-desglose";
            filaCupon.innerHTML = `<span>Descuento aplicado</span><span class="text-verde">-${formatoMoneda(descuentoTotal)}</span>`;
            contenedorDesglose.appendChild(filaCupon);
        }

        const baseSinImpuesto = subtotalBoletos + totalCargos - descuentoTotal;
        const montoItbms = Math.round(baseSinImpuesto * TARIFA.itbmsRatio);
        const montoTotalFinal = baseSinImpuesto + montoItbms;

        const filaSubtotal = document.createElement("div");
        filaSubtotal.className = "linea-desglose";
        filaSubtotal.innerHTML = `<span>Subtotal</span><span>${formatoMoneda(baseSinImpuesto)}</span>`;
        contenedorDesglose.appendChild(filaSubtotal);

        const filaItbms = document.createElement("div");
        filaItbms.className = "linea-desglose";
        filaItbms.innerHTML = `<span>ITBMS 7%</span><span>${formatoMoneda(montoItbms)}</span>`;
        contenedorDesglose.appendChild(filaItbms);

        setTexto("cantidad-asientos-txt", `x${totalBoletosConteo} ASIENTO${totalBoletosConteo > 1 ? 'S' : ''} RESERVADO${totalBoletosConteo > 1 ? 'S' : ''}`);
        setTexto("tk-total", formatoMoneda(montoTotalFinal));
        setTexto("total-sticky", formatoMoneda(montoTotalFinal));
    }

    renderTicket();

    /* =====================================================
       2. TEMPORIZADOR (07:00 / 420 seg)
       ===================================================== */
    let tiempoRestante = 420; 
    const displayTimer = document.getElementById("timer");
    const bannerTimer = document.getElementById("banner-timer");
    const mensajeTimer = document.getElementById("timer-mensaje");
    const btnPagar = document.getElementById("btn-continuar-pago");

    if (displayTimer) {
        const intervalo = setInterval(() => {
            if (tiempoRestante > 0) tiempoRestante--;

            const minutos = Math.floor(tiempoRestante / 60);
            const segundos = tiempoRestante % 60;
            displayTimer.textContent = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

            if (tiempoRestante === 0) {
                clearInterval(intervalo);
                if (bannerTimer) bannerTimer.classList.add("expirado");
                if (mensajeTimer) mensajeTimer.innerHTML = "Tu tiempo de reserva ha expirado. <strong>Redirigiendo a asientos...</strong>";
                if (btnPagar) btnPagar.disabled = true;
                
                setTimeout(() => {
                    window.location.href = "reserva.html";
                }, 2500);
            }
        }, 1000);
    }

    /* =====================================================
       3. CONMUTADOR TARJETA / YAPPY
       ===================================================== */
    const opcionTarjeta = document.getElementById("opcion-tarjeta");
    const opcionYappy = document.getElementById("opcion-yappy");
    const panelTarjeta = document.getElementById("panel-tarjeta");
    const panelYappy = document.getElementById("panel-yappy");
    const radioTarjeta = document.getElementById("radio-tarjeta");
    const radioYappy = document.getElementById("radio-yappy");

    function alternarMetodo() {
        const esTarjeta = radioTarjeta.checked;
        opcionTarjeta.classList.toggle("activa", esTarjeta);
        opcionYappy.classList.toggle("activa", !esTarjeta);
        
        panelTarjeta.classList.toggle("oculto", !esTarjeta);
        panelYappy.classList.toggle("oculto", esTarjeta);
        
        panelTarjeta.querySelectorAll("input").forEach(i => i.required = esTarjeta);
        panelYappy.querySelectorAll("input").forEach(i => i.required = !esTarjeta);
    }

    if (opcionTarjeta && opcionYappy) {
        opcionTarjeta.addEventListener("click", () => { radioTarjeta.checked = true; alternarMetodo(); });
        opcionYappy.addEventListener("click", () => { radioYappy.checked = true; alternarMetodo(); });
        alternarMetodo();
    }

    /* =====================================================
       4. PANELES EN FLUJO (Cupón y Facturación)
       ===================================================== */
    const btnCupon = document.getElementById("btn-cupon");
    const btnFacturacion = document.getElementById("btn-facturacion");
    const panelCupon = document.getElementById("panel-cupon");
    const panelFacturacion = document.getElementById("panel-facturacion");

    function togglePanelNormal(btnActivo, panelActivo, btnInactivo, panelInactivo) {
        if (panelInactivo) {
            panelInactivo.classList.add("oculto");
            if (btnInactivo) btnInactivo.classList.remove("activa");
        }
        
        if (panelActivo && btnActivo) {
            const estaOculto = panelActivo.classList.contains("oculto");
            if (estaOculto) {
                panelActivo.classList.remove("oculto");
                btnActivo.classList.add("activa");
            } else {
                panelActivo.classList.add("oculto");
                btnActivo.classList.remove("activa");
            }
        }
    }

    if (btnCupon && panelCupon) {
        btnCupon.addEventListener("click", () => togglePanelNormal(btnCupon, panelCupon, btnFacturacion, panelFacturacion));
    }
    if (btnFacturacion && panelFacturacion) {
        btnFacturacion.addEventListener("click", () => togglePanelNormal(btnFacturacion, panelFacturacion, btnCupon, panelCupon));
    }

    /* =====================================================
       5. VALIDACIÓN DE CUPÓN
       ===================================================== */
    const btnAplicarCupon = document.getElementById("btn-aplicar-cupon");
    const inputCupon = document.getElementById("codigo-cupon");
    const msgFeedbackCupon = document.getElementById("msg-feedback-cupon");

    function mostrarMensajeCupon(texto, tipo) {
        msgFeedbackCupon.textContent = texto;
        msgFeedbackCupon.classList.remove("oculto", "exito", "error");
        msgFeedbackCupon.classList.add(tipo);
    }

    function reiniciarCupon() {
        inputCupon.value = "";
        inputCupon.readOnly = false;
        msgFeedbackCupon.classList.add("oculto");
        btnAplicarCupon.classList.remove("btn-rojo-equis", "btn-aplicado");
        btnAplicarCupon.textContent = "Aplicar";
        cuponAplicado = false;
        renderTicket();
    }

    if (btnAplicarCupon && inputCupon) {
        btnAplicarCupon.addEventListener("click", () => {
            if (cuponAplicado || btnAplicarCupon.classList.contains("btn-rojo-equis")) {
                reiniciarCupon();
                return;
            }

            const codigo = inputCupon.value.trim().toUpperCase();
            if (codigo === "") {
                mostrarMensajeCupon("Por favor, ingrese un código de cupón.", "error");
                return;
            }

            if (codigo === TARIFA.cuponValido) {
                cuponAplicado = true;
                inputCupon.readOnly = true;
                btnAplicarCupon.classList.add("btn-aplicado");
                btnAplicarCupon.textContent = "Quitar";
                mostrarMensajeCupon("¡Cupón aplicado con éxito!", "exito");
                renderTicket();
            } else {
                btnAplicarCupon.classList.add("btn-rojo-equis");
                btnAplicarCupon.textContent = "✕";
                mostrarMensajeCupon("El código de cupón no es válido o ha expirado.", "error");
            }
        });

        inputCupon.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); btnAplicarCupon.click(); }
        });

        inputCupon.addEventListener("input", () => {
            if (!cuponAplicado && btnAplicarCupon.classList.contains("btn-rojo-equis")) {
                btnAplicarCupon.classList.remove("btn-rojo-equis");
                btnAplicarCupon.textContent = "Aplicar";
                msgFeedbackCupon.classList.add("oculto");
            }
        });
    }

    /* =====================================================
       6. MÁSCARAS DE ENTRADA
       ===================================================== */
    const soloDigitos = (valor) => valor.replace(/\D/g, "");

    const inputTarjeta = document.getElementById("numero-tarjeta");
    if (inputTarjeta) {
        inputTarjeta.addEventListener("input", () => {
            inputTarjeta.value = soloDigitos(inputTarjeta.value).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
        });
    }

    const inputVencimiento = document.getElementById("vencimiento");
    if (inputVencimiento) {
        inputVencimiento.addEventListener("input", () => {
            const d = soloDigitos(inputVencimiento.value).slice(0, 4);
            inputVencimiento.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
        });
    }

    ["cvv", "numero-yappy", "dv"].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.addEventListener("input", () => { input.value = soloDigitos(input.value); });
    });

    /* =====================================================
       7. ENVÍO DEL FORMULARIO
       ===================================================== */
    const formPago = document.getElementById("form-pago");
    if (formPago) {
        formPago.addEventListener("submit", (e) => {
            e.preventDefault();
            if (btnPagar) { btnPagar.textContent = "PROCESANDO..."; btnPagar.disabled = true; }
            setTimeout(() => { window.location.href = "confirmar.html"; }, 1200);
        });
    }
});