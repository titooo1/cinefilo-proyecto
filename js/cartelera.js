document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. MOTOR DEL CARRUSEL (ARRASTRE + AUTOPLAY)
  // ==========================================
  const contenedor = document.getElementById('contenedor-carrusel');
  const pista = document.getElementById('pista-carrusel');
  const diapositivas = Array.from(document.querySelectorAll('.diapositiva'));
  const totalDiapositivas = diapositivas.length;

  if (contenedor && pista && totalDiapositivas > 0) {
    let indiceActual = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let autoPlayTimer;

    // Configuración
    const threshold = 100; // Píxeles necesarios para cambiar de diapositiva
    const slideInterval = 4000; // 4 segundos

    function obtenerAnchoContenedor() {
      return contenedor.getBoundingClientRect().width;
    }

    // Funciones de Posicionamiento
    function setSliderPosition() {
      pista.style.transform = `translateX(${currentTranslate}px)`;
    }

    function setPositionByIndex() {
      const ancho = obtenerAnchoContenedor();
      currentTranslate = indiceActual * -ancho;
      prevTranslate = currentTranslate;
      setSliderPosition();
    }

    // Navegación
    function irA(indice) {
      if (indice < 0) {
        indiceActual = totalDiapositivas - 1;
      } else if (indice >= totalDiapositivas) {
        indiceActual = 0;
      } else {
        indiceActual = indice;
      }
      
      pista.style.transition = 'transform 0.4s ease-out';
      setPositionByIndex();
      reiniciarAutoPlay();
    }

    function avanzar() {
      irA(indiceActual + 1);
    }

    // AutoPlay
    function iniciarAutoPlay() {
      autoPlayTimer = setInterval(avanzar, slideInterval);
    }

    function reiniciarAutoPlay() {
      clearInterval(autoPlayTimer);
      iniciarAutoPlay();
    }

    // Animación fluida durante el arrastre
    function animation() {
      if (isDragging) {
        setSliderPosition();
        requestAnimationFrame(animation);
      }
    }

    // Manejo de Eventos Pointer (Mouse y Touch unificados)
    function touchStart(e) {
      isDragging = true;
      startPos = e.clientX;
      pista.style.transition = 'none';
      clearInterval(autoPlayTimer);
      animationID = requestAnimationFrame(animation);
      
      // Evita selección de texto o comportamientos extraños
      contenedor.setPointerCapture(e.pointerId);
    }

    function touchMove(e) {
      if (isDragging) {
        const currentPosition = e.clientX;
        const movido = currentPosition - startPos;
        currentTranslate = prevTranslate + movido;
      }
    }

    function touchEnd() {
      if (!isDragging) return;
      isDragging = false;
      cancelAnimationFrame(animationID);
      
      const movedBy = currentTranslate - prevTranslate;

      if (movedBy < -threshold) {
        irA(indiceActual + 1); // Deslizó hacia la izquierda (siguiente)
      } else if (movedBy > threshold) {
        irA(indiceActual - 1); // Deslizó hacia la derecha (anterior)
      } else {
        irA(indiceActual);     // No superó el umbral, regresa a la actual
      }
    }

    // Asignar listeners (pointer-events soportan touch y mouse nativamente)
    contenedor.addEventListener('pointerdown', touchStart);
    contenedor.addEventListener('pointermove', touchMove);
    contenedor.addEventListener('pointerup', touchEnd);
    contenedor.addEventListener('pointercancel', touchEnd);
    
    // Evitar menú contextual o arrastre por defecto de imágenes
    contenedor.addEventListener('contextmenu', e => e.preventDefault());
    contenedor.addEventListener('dragstart', e => e.preventDefault());

    // Reajustar en resize
    window.addEventListener('resize', () => {
      pista.style.transition = 'none';
      setPositionByIndex();
    });

    // Inicializar
    setPositionByIndex();
    iniciarAutoPlay();
  }

  // ==========================================
  // 2. LÓGICA DE LAS PESTAÑAS
  // ==========================================
  const botonesPestana = document.querySelectorAll('.boton-pestana');
  const tarjetasPelicula = document.querySelectorAll('.tarjeta-pelicula');

  botonesPestana.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesPestana.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoriaSeleccionada = boton.getAttribute('data-pestana');

      tarjetasPelicula.forEach(tarjeta => {
        const categoriaPelicula = tarjeta.getAttribute('data-categoria');
        if (categoriaSeleccionada === categoriaPelicula) {
          tarjeta.classList.remove('oculto');
        } else {
          tarjeta.classList.add('oculto');
        }
      });
    });
  });

});