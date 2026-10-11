document.addEventListener('DOMContentLoaded', () => {

  // Botón "IR A RESERVAR" -> Scroll suave
  const btnIrReservar = document.getElementById('btn-ir-reservar');
  const seccionFiltrosCine = document.getElementById('seccion-filtros-cine');

  if (btnIrReservar && seccionFiltrosCine) {
    btnIrReservar.addEventListener('click', () => {
      seccionFiltrosCine.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Lógica de desvelado de horarios al seleccionar los 3 campos
  const selectorCine = document.getElementById('selector-cine');
  const botonesFormato = document.querySelectorAll('#grupo-formato .btn-opcion');
  const botonesFecha = document.querySelectorAll('#grupo-fecha .btn-fecha');
  const seccionHorarios = document.getElementById('horarios-disponibles');

  const tituloCine = document.getElementById('nombre-cine-resultado');
  const direccionCine = document.getElementById('direccion-cine-resultado');
  const tituloFormato = document.getElementById('formato-resultado');

  const seleccion = {
    cine: null,
    formato: null,
    fecha: null
  };

  const direcciones = {
    'donbosco': 'Plaza Don Bosco, Local 4, Panamá',
    'colon': 'Calle 13, C.C. Colón 2000, Colón',
    'metromall': 'Vía Tocumen, C.C. Metromall, San Miguelito'
  };

  function evaluarDespliegue() {
    if (seleccion.cine && seleccion.formato && seleccion.fecha) {
      tituloCine.textContent = selectorCine.options[selectorCine.selectedIndex].text;
      direccionCine.textContent = direcciones[seleccion.cine];
      tituloFormato.textContent = `2D ${seleccion.formato}`;

      seccionHorarios.classList.remove('oculto');
      seccionHorarios.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  selectorCine.addEventListener('change', (e) => {
    seleccion.cine = e.target.value;
    evaluarDespliegue();
  });

  botonesFormato.forEach(btn => {
    btn.addEventListener('click', () => {
      botonesFormato.forEach(b => b.classList.remove('seleccionado'));
      btn.classList.add('seleccionado');
      seleccion.formato = btn.getAttribute('data-valor');
      evaluarDespliegue();
    });
  });

  botonesFecha.forEach(btn => {
    btn.addEventListener('click', () => {
      botonesFecha.forEach(b => b.classList.remove('seleccionado'));
      btn.classList.add('seleccionado');
      seleccion.fecha = btn.getAttribute('data-valor');
      evaluarDespliegue();
    });
  });

});