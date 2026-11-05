/* Confirmación de compra CINEFILO.
   Lee la confirmación generada en js/pago.js, completa el hero y el ticket,
   genera el código QR y gestiona las acciones posteriores al pago. */

const CONFIRMACION_DEMO = {
  codigo: 'CNF-89234',
  fechaCompra: '',
  puntosMembresia: false,
  cupon: '',
  invitado: {
    nombre: 'Cliente CINEFILO',
    correo: '',
    tarjetaClub: ''
  },
  orden: {
    pelicula: 'Resident Evil: Noche Cero Dob',
    cineSala: 'CINEFILO METROMALL, SALA 8',
    fechaHora: 'sábado, 03/10/2026 03:50 p. m.',
    clasificacion: 'Clasificación: B15',
    cantidades: { adulto: 1, nino: 0, tercera: 0, discap: 0 },
    totalBoletos: 1,
    asientos: ['A3'],
    total: 6.90
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const confirmacion = leerConfirmacionDesdeSesion();
  pintarConfirmacion(confirmacion);
  configurarAcciones(confirmacion);
});

/* ---------- Datos de la compra ---------- */

function leerConfirmacionDesdeSesion() {
  try {
    const crudo = sessionStorage.getItem('confirmacionCinefilo');
    if (!crudo) return CONFIRMACION_DEMO;
    const confirmacion = JSON.parse(crudo);
    if (!confirmacion || !confirmacion.orden || !confirmacion.codigo) return CONFIRMACION_DEMO;
    return confirmacion;
  } catch (error) {
    return CONFIRMACION_DEMO;
  }
}

function obtenerSala(orden) {
  const coincidencia = String(orden.cineSala || '').match(/SALA\s+[A-Z0-9]+/i);
  return coincidencia ? coincidencia[0].toUpperCase() : (orden.cineSala || 'SALA 1');
}

function obtenerFila(asientos) {
  const filas = [];
  asientos.forEach(asiento => {
    const fila = String(asiento).match(/^\D+/);
    if (fila && !filas.includes(fila[0].toUpperCase())) filas.push(fila[0].toUpperCase());
  });
  if (filas.length === 0) return 'FILA A';
  return filas.length === 1 ? `FILA ${filas[0]}` : `FILAS ${filas.join(', ')}`;
}

function obtenerNumerosAsientos(asientos) {
  const numeros = asientos
    .map(asiento => String(asiento).match(/\d+/))
    .filter(Boolean)
    .map(coincidencia => coincidencia[0]);
  return numeros.length > 0 ? numeros.join(', ') : '1';
}

function pintarConfirmacion(confirmacion) {
  const orden = confirmacion.orden;
  const invitado = confirmacion.invitado || {};
  const asientos = Array.isArray(orden.asientos) ? orden.asientos : ['A3'];

  document.getElementById('codigo-reserva').textContent = confirmacion.codigo;
  document.getElementById('ticket-pelicula').textContent = orden.pelicula;
  document.getElementById('ticket-clasificacion').textContent = orden.clasificacion || '';
  document.getElementById('ticket-sala').textContent = obtenerSala(orden);
  document.getElementById('ticket-fila').textContent = obtenerFila(asientos);
  document.getElementById('ticket-asientos').textContent = `ASIENTOS ${obtenerNumerosAsientos(asientos)}`;
  document.getElementById('ticket-fecha').textContent = orden.fechaHora;
  document.getElementById('ticket-boletos').textContent =
    `${orden.totalBoletos} ${Number(orden.totalBoletos) === 1 ? 'boleto' : 'boletos'}`;
  document.getElementById('ticket-titular').textContent = invitado.nombre || 'Cliente invitado';
  document.getElementById('ticket-total').textContent = `Total pagado: $${Number(orden.total).toFixed(2)}`;

  generarCodigoQR(confirmacion, asientos);
}

/* ---------- Código QR ---------- */

function generarCodigoQR(confirmacion, asientos) {
  const orden = confirmacion.orden;
  const contenido = [
    'CINEFILO',
    `Reserva: ${confirmacion.codigo}`,
    `Pelicula: ${orden.pelicula}`,
    `Cine: ${orden.cineSala}`,
    `Fecha: ${orden.fechaHora}`,
    `Asientos: ${asientos.join(', ')}`,
    `Total: $${Number(orden.total).toFixed(2)}`
  ].join('\n');

  const imagenQR = document.getElementById('img-qr');
  const respaldoQR = document.getElementById('qr-respaldo');

  imagenQR.onerror = () => {
    imagenQR.classList.add('oculto');
    document.getElementById('qr-respaldo-codigo').textContent = confirmacion.codigo;
    respaldoQR.classList.remove('oculto');
  };

  imagenQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(contenido)}`;
}

/* ---------- Acciones posteriores ---------- */

function mostrarMensaje(texto, esError) {
  const mensaje = document.getElementById('mensaje-accion');
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', Boolean(esError));
}

function configurarAcciones(confirmacion) {
  document.getElementById('btn-imprimir').addEventListener('click', () => {
    window.print();
  });

  const campoCorreo = document.getElementById('correo-boletos');
  campoCorreo.value = (confirmacion.invitado && confirmacion.invitado.correo) || '';

  document.getElementById('form-correo').addEventListener('submit', evento => {
    evento.preventDefault();
    const correo = campoCorreo.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarMensaje('Ingresa un correo electrónico válido para enviar los boletos.', true);
      campoCorreo.focus();
      return;
    }

    mostrarMensaje(`Boletos enviados a ${correo}.`, false);
  });
}
