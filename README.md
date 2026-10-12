# CINEFILO 

**CINEFILO** 
Es una aplicación web interactiva diseñada para ofrecer a los usuarios una experiencia fluida al consultar la cartelera de cine, explorar detalles de películas, seleccionar funciones y realizar la reserva de boletos y asientos en tiempo real.



## Tecnologías Utilizadas

- **Frontend:**
  - HTML5 (Estructura semántica / MPA)
  - CSS3 (Estilos personalizados, Responsive Design)
  - JavaScript (Vainilla JS - Manejo de interfaz e interacción)
- **Backend & Base de Datos:**
  - PHP
  - MySQL 
- **Control de Versiones y Entorno de trabajo:**
  - Git & GitHub
  - Visual Studio Code


## Estructura del Proyecto

```text
cinefi proyecto/
├── assets/
│   └── img/          # Banners, pósters y recursos visuales
├── css/              # Hojas de estilo estructuradas por módulo de cada vista
│   ├── cartelera.css
│   ├── detalle.css
│   ├── formulario.css
│   ├── main.css
│   └── reserva.css
├── js/               # Scripts de interacción y lógica
│   ├── cartelera.js
│   ├── detalle.js
│   └── reserva.js
├── php/              # Conexión y scripts de servidor
│   └── conexion.php
├── index.html        # Página principal y cartelera
├── detalle.html      # Ficha técnica de la película junto con su horario, cine y tipo
├── reserva.html      # Selección de asientos y boletos
├── registro.html     # Formulario de registro/autenticación
└── README.md         # Documentación principal del repositorio