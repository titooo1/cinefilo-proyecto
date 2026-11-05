# CINEFILO - Especificaciones Estrictas de Maquetación UI/UX

## 1. Mantenimiento del Layout y Prohibiciones
- **Header y Banner (NO TOCAR)**: Preservar intactos los estilos de `.header-reserva` y `.banner-reserva-pelicula`.
- **Prohibición de Bloques Gigantes**: Los botones de selección de pago y la barra sticky inferior no deben crecer desproporcionadamente.

## 2. Botones de Selección de Método de Pago (`.metodos-pago-selector`)
- **Contenedores `.tarjeta-metodo`**:
  - Fijar altura idónea y compacta: `height: 52px;`
  - Fondo blanco `#ffffff`, borde neutro `2px solid #e2e8f0`, `border-radius: 8px;`.
  - Alineación: `display: flex; align-items: center; justify-content: center; padding: 0.5rem 1rem;`.
- **Imágenes de Marcas (`.img-metodo-pago`)**:
  - `max-height: 34px; width: auto; object-fit: contain;`
  - La imagen de `spreedly.jpg` y `yappy.jpg` debe quedar centrada, nítida y ajustada sin distorsión ni márgenes blancos gigantes.
- **Estado Activo (`.tarjeta-metodo.activa`)**:
  - Borde de resaltado azul: `border-color: #2563eb; background-color: #f8fafc; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);`.

## 3. Barra Sticky Inferior (`.barra-sticky-resumen`)
- **Posicionamiento Estricto**:
  - Debe mantenerse SIEMPRE fija al pie de la ventana: `position: fixed; bottom: 0; left: 0; width: 100%; z-index: 999; background: #ffffff; border-top: 1px solid #e2e8f0; padding: 0.8rem 0 1rem 0;`.
  - NUNCA renderizarla como un elemento inline estático que ocupe espacio masivo al final del formulario.
- **Contenido Interno (`.contenedor-sticky-interior`)**:
  - Ancho máximo centrado: `max-width: 520px; margin: 0 auto;`.
  - Fila 1: Texto `TOTAL A PAGAR` + precio `$6.90`.
  - Fila 2: Botón `REGRESAR` (`#334155`) y Botón `CONFIRMAR Y PAGAR` (`#ea580c`).

## 4. Card del Ticket de Resumen (`.card-ticket-negro`)
- Ancho contenido (máximo `320px`), `position: sticky; top: 2rem;` sobre fondo `#000000`.
- Distribución vertical equilibrada: Cabecera, Título de Película, Asiento (`FILA G, ASIENTO 4`), Desglose de precios con línea punteada y Total `$6.90`.