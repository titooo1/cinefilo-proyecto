// Vistas de acceso y registro: conmutación y validación básica en Frontend.
// La autenticación se simula hasta la integración con la base de datos.

document.addEventListener('DOMContentLoaded', () => {
  const vistaIngreso = document.getElementById('vista-ingreso');
  const vistaRegistro = document.getElementById('vista-registro');
  const btnMostrarRegistro = document.getElementById('btn-mostrar-registro');
  const btnVolverIngreso = document.getElementById('btn-volver-ingreso');
  const formularioIngreso = document.getElementById('formulario-ingreso');
  const formularioRegistro = document.getElementById('formulario-registro');
  const mensajeEstado = document.getElementById('mensaje-estado-auth');

  function mostrarMensajeAuth(texto) {
    if (!mensajeEstado) return;
    mensajeEstado.textContent = texto;
    mensajeEstado.classList.add('visible');
  }

  function limpiarMensajeAuth() {
    if (!mensajeEstado) return;
    mensajeEstado.textContent = '';
    mensajeEstado.classList.remove('visible');
  }

  // Conmuta entre la vista de inicio de sesión y la de creación de cuenta.
  function cambiarFormulario(destino) {
    const esIngreso = destino === 'ingreso';

    if (vistaIngreso) {
      vistaIngreso.classList.toggle('activo', esIngreso);
      vistaIngreso.classList.toggle('oculto', !esIngreso);
    }
    if (vistaRegistro) {
      vistaRegistro.classList.toggle('activo', !esIngreso);
      vistaRegistro.classList.toggle('oculto', esIngreso);
    }

    limpiarMensajeAuth();

    // El foco pasa al primer campo de la vista mostrada.
    const vistaDestino = esIngreso ? vistaIngreso : vistaRegistro;
    vistaDestino?.querySelector('input')?.focus();
  }

  // Detectar el parámetro ?mode= enviado en la URL (ejemplo: registro.html?mode=registro)
  const urlParams = new URLSearchParams(window.location.search);
  const modoURL = urlParams.get('mode');

  if (modoURL === 'registro') {
    cambiarFormulario('registro');
  } else {
    cambiarFormulario('ingreso');
  }

  // Cada conmutador aplica preventDefault: el clic no debe disparar envíos,
  // recargas ni redirecciones.
  btnMostrarRegistro?.addEventListener('click', evento => {
    evento.preventDefault();
    cambiarFormulario('registro');
  });

  btnVolverIngreso?.addEventListener('click', evento => {
    evento.preventDefault();
    cambiarFormulario('ingreso');
  });

  function manejarEnvio(evento, nombreOperacion) {
    evento.preventDefault();
    const formulario = evento.target;

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    // En el registro se verifica la coincidencia de las contraseñas.
    const clave = document.getElementById('clave-registro');
    const confirmarClave = document.getElementById('confirmar-clave-registro');
    if (nombreOperacion === 'Registro' && clave && confirmarClave && clave.value !== confirmarClave.value) {
      mostrarMensajeAuth('Las contraseñas no coinciden. Verifica ambos campos.');
      return;
    }

    mostrarMensajeAuth(
      `${nombreOperacion} simulada correctamente. La integración con la base de datos se habilitará en una fase posterior.`
    );
  }

  formularioIngreso?.addEventListener('submit', evento => {
    manejarEnvio(evento, 'Inicio de sesión');
  });

  formularioRegistro?.addEventListener('submit', evento => {
    manejarEnvio(evento, 'Registro');
  });
});