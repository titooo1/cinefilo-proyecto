const PRECIOS = { adulto: 6.50, nino: 5.25, tercera: 3.25, discap: 3.25 };
const cantidades = { adulto: 0, nino: 0, tercera: 0, discap: 0 };

const ICONO_ACOMPANANTE = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="4" r="2"></circle>
    <path d="M11 7v5h5"></path>
    <path d="M16 12l2.5 6H21"></path>
    <circle cx="12.5" cy="15.5" r="5.5"></circle>
  </svg>`;

function crearButacaSVG(contenidoInterno) {
  return `
    <svg viewBox="0 0 32 26" aria-hidden="true">
      <rect class="parte-butaca" x="1.5" y="10.5" width="4.5" height="11.5" rx="1.8"></rect>
      <rect class="parte-butaca" x="26" y="10.5" width="4.5" height="11.5" rx="1.8"></rect>
      <rect class="parte-butaca" x="7" y="1.5" width="18" height="14.5" rx="4"></rect>
      <rect class="parte-butaca" x="5" y="13.5" width="22" height="7.5" rx="2.5"></rect>
      ${contenidoInterno}
    </svg>`;
}

function crearNumeroAsiento(numero) {
  return `<text class="numero-asiento" x="16" y="9" text-anchor="middle" dominant-baseline="middle">${numero}</text>`;
}

let pasoActual = 1;
let totalBoletosComprados = 0;
let asientosSeleccionados = [];

function cerrarModalInvitado() {
  const modal = document.getElementById('modal-cinefilitos');
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
  }
}

function cambiarCantidadBoleto(tipo, cambio) {
  const cantidadActual = Number(cantidades[tipo]) || 0;
  cantidades[tipo] = Math.max(0, cantidadActual + cambio);
  document.getElementById(`cant-${tipo}`).textContent = cantidades[tipo];
  actualizarResumenTotales();
}

function actualizarResumenTotales() {
  totalBoletosComprados = cantidades.adulto + cantidades.nino + cantidades.tercera + cantidades.discap;
  const montoTotal = (cantidades.adulto * PRECIOS.adulto) +
                     (cantidades.nino * PRECIOS.nino) +
                     (cantidades.tercera * PRECIOS.tercera) +
                     (cantidades.discap * PRECIOS.discap);

  const txtContador = document.getElementById('txt-tickets-contador');
  const txtMonto = document.getElementById('txt-monto-total');
  const btnContinuar = document.getElementById('btn-continuar-asientos');
  const txtRegresar = document.getElementById('texto-regresar');

  if (pasoActual === 1) {
    txtContador.classList.remove('alerta');
    txtContador.textContent = `${totalBoletosComprados} Tickets seleccionados`;
    txtMonto.textContent = `$${montoTotal.toFixed(2)}`;

    if (totalBoletosComprados > 0) {
      btnContinuar.classList.remove('deshabilitado');
      txtRegresar.textContent = 'CANCELAR';
    } else {
      btnContinuar.classList.add('deshabilitado');
      txtRegresar.textContent = 'REGRESAR';
    }
  } else if (pasoActual === 2) {
    const enLimite = asientosSeleccionados.length >= totalBoletosComprados;
    txtContador.classList.toggle('alerta', enLimite);
    txtContador.textContent = enLimite
      ? `Límite alcanzado: ${asientosSeleccionados.length} de ${totalBoletosComprados} asientos.`
      : `${asientosSeleccionados.length} de ${totalBoletosComprados} Asientos seleccionados`;

    btnContinuar.classList.toggle('deshabilitado', !enLimite);
  }
}

function avanzarAAsientos() {
  if (pasoActual === 1) {
    if (totalBoletosComprados === 0) return;
    
    pasoActual = 2;
    document.getElementById('paso-1').classList.add('oculto');
    document.getElementById('paso-2').classList.remove('oculto');
    
    document.getElementById('paso-hdr-1').classList.remove('activo');
    document.getElementById('paso-hdr-2').classList.add('activo');
    document.getElementById('texto-regresar').textContent = 'VOLVER';

    construirMapaSala();
    actualizarResumenTotales();

  } else if (pasoActual === 2) {
    if (asientosSeleccionados.length < totalBoletosComprados) return;

    const txtContador = document.getElementById('txt-tickets-contador');
    txtContador.classList.remove('alerta');
    txtContador.textContent = 'Asientos confirmados. La pasarela de pago se habilitará en la siguiente fase.';
  }
}

function ejecutarAccionRegresar() {
  if (pasoActual === 1) {
    if (totalBoletosComprados > 0) {
      for (let k in cantidades) cantidades[k] = 0;
      ['adulto', 'nino', 'tercera', 'discap'].forEach(id => {
        const el = document.getElementById(`cant-${id}`);
        if (el) el.textContent = '0';
      });
      actualizarResumenTotales();
    } else {
      window.location.href = 'detalle.html';
    }
  } else if (pasoActual === 2) {
    pasoActual = 1;
    asientosSeleccionados = [];
    document.getElementById('paso-2').classList.add('oculto');
    document.getElementById('paso-1').classList.remove('oculto');

    document.getElementById('paso-hdr-2').classList.remove('activo');
    document.getElementById('paso-hdr-1').classList.add('activo');

    actualizarResumenTotales();
  }
}

function construirMapaSala() {
  const container = document.getElementById('mapa-asientos-container');
  container.innerHTML = '';

  const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const ocupadosSimulados = ['D15', 'H4', 'H5', 'H6']; 
  const asientosDiscapacidad = ['A9', 'A10'];

  filas.forEach(fila => {
    const divFila = document.createElement('div');
    divFila.classList.add('fila-asientos');

    const totalAsientos = (fila === 'K') ? 20 : 16;

    for (let num = totalAsientos; num >= 1; num--) {
      const codigoAsiento = `${fila}${num}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('asiento-btn');
      
      if (asientosDiscapacidad.includes(codigoAsiento)) {
        btn.classList.add('discapacidad');
        btn.innerHTML = ICONO_ACOMPANANTE;
      } else {
        btn.innerHTML = crearButacaSVG(crearNumeroAsiento(num));
      }
      btn.setAttribute('aria-label', `Asiento ${codigoAsiento}`);

      if (ocupadosSimulados.includes(codigoAsiento)) {
        btn.classList.add('reservado');
      } else {
        btn.classList.add('disponible');
        btn.addEventListener('click', () => toggleSeleccionAsiento(btn, codigoAsiento));
      }

      divFila.appendChild(btn);

      if (num === 3 || num === 14) {
        const pasillo = document.createElement('div');
        pasillo.classList.add('pasillo-espacio');
        divFila.appendChild(pasillo);
      }
    }

    const spanLetra = document.createElement('span');
    spanLetra.classList.add('etiqueta-fila');
    spanLetra.textContent = fila;
    divFila.appendChild(spanLetra);

    container.appendChild(divFila);
  });
}

function aplicarAnimacionShake(elemento) {
  elemento.classList.remove('shake');
  void elemento.offsetWidth;
  elemento.classList.add('shake');
  elemento.addEventListener('animationend', () => elemento.classList.remove('shake'), { once: true });
}

function toggleSeleccionAsiento(btnElement, codigo) {
  if (btnElement.classList.contains('seleccionado')) {
    btnElement.classList.remove('seleccionado');
    asientosSeleccionados = asientosSeleccionados.filter(a => a !== codigo);
  } else {
    if (asientosSeleccionados.length >= totalBoletosComprados) {
      aplicarAnimacionShake(btnElement);
      return;
    }
    btnElement.classList.add('seleccionado');
    asientosSeleccionados.push(codigo);
  }

  actualizarResumenTotales();
}