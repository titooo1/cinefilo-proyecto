const PRECIOS = { adulto: 6.50, nino: 5.25, tercera: 3.25, discapacitado: 3.25 };
const cantidades = { adulto: 0, nino: 0, tercera: 0, discapacitado: 0 };

let pasoActual = 1;
let totalBoletosComprados = 0;
let asientosSeleccionados = [];

function cerrarModalInvitado() {
  const modal = document.getElementById('modal-cinefilitos');
  if (modal) modal.style.display = 'none';
}

function cambiarCantidadBoleto(tipo, cambio) {
  cantidades[tipo] = Math.max(0, cantidades[tipo] + cambio);
  document.getElementById(`cant-${tipo}`).textContent = cantidades[tipo];
  actualizarResumenTotales();
}

function actualizarResumenTotales() {
  totalBoletosComprados = cantidades.adulto + cantidades.nino + cantidades.tercera + cantidades.discapacitado;
  const montoTotal = (cantidades.adulto * PRECIOS.adulto) +
                     (cantidades.nino * PRECIOS.nino) +
                     (cantidades.tercera * PRECIOS.tercera) +
                     (cantidades.discapacitado * PRECIOS.discapacitado);

  const txtTickets = document.getElementById('txt-tickets-contador');
  const txtMonto = document.getElementById('txt-monto-total');
  const btnContinuar = document.getElementById('btn-continuar-asientos');
  const txtRegresar = document.getElementById('texto-regresar');

  if (pasoActual === 1) {
    txtTickets.textContent = `${totalBoletosComprados} Tickets seleccionados`;
    txtMonto.textContent = `$${montoTotal.toFixed(2)}`;

    if (totalBoletosComprados > 0) {
      btnContinuar.classList.remove('deshabilitado');
      txtRegresar.textContent = 'CANCELAR';
    } else {
      btnContinuar.classList.add('deshabilitado');
      txtRegresar.textContent = 'REGRESAR';
    }
  } else if (pasoActual === 2) {
    txtTickets.textContent = `${asientosSeleccionados.length} de ${totalBoletosComprados} Asientos seleccionados`;
    
    if (asientosSeleccionados.length === totalBoletosComprados) {
      btnContinuar.classList.remove('deshabilitado');
    } else {
      btnContinuar.classList.add('deshabilitado');
    }
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
    if (asientosSeleccionados.length < totalBoletosComprados) {
      alert(`Por favor selecciona los ${totalBoletosComprados} asientos requeridos.`);
      return;
    }
    alert('¡Asientos confirmados! Redirigiendo a la pantalla de Pago...');
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

// CONSTRUCTOR DE SALA REALISTA
function construirMapaSala() {
  const container = document.getElementById('mapa-asientos-container');
  container.innerHTML = '';

  const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  // Solo se marcan ocupados si existen en la matriz
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
        btn.textContent = '♿';
      } else {
        btn.textContent = num;
      }

      if (ocupadosSimulados.includes(codigoAsiento)) {
        btn.classList.add('reservado');
        // No agrega evento ni cambia puntero, simplemente es estático
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

  // Habilitar toggle por clic en la leyenda para dispositivos móviles
  document.querySelectorAll('.item-leyenda').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('activo-tooltip');
    });
  });
}

function toggleSeleccionAsiento(btnElement, codigo) {
  if (btnElement.classList.contains('seleccionado')) {
    btnElement.classList.remove('seleccionado');
    asientosSeleccionados = asientosSeleccionados.filter(a => a !== codigo);
  } else {
    if (asientosSeleccionados.length >= totalBoletosComprados) {
      alert(`Solo compraste ${totalBoletosComprados} ticket(s). Desmarca uno si deseas cambiar.`);
      return;
    }
    btnElement.classList.add('seleccionado');
    asientosSeleccionados.push(codigo);
  }
  actualizarResumenTotales();
}