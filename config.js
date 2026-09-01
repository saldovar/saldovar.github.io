/**
 * config.js
 * ------------------------------------------------------------------
 * Configuración global del sitio. Edita estos valores para personalizar
 * el nombre, la descripción, los colores y el comportamiento por defecto
 * sin tener que tocar el resto del código.
 * ------------------------------------------------------------------
 */

const CONFIG = {
  // Nombre que aparece en la cabecera (navbar) y en la pestaña del navegador.
  siteName: "Archivo",

  // Subtítulo corto que aparece bajo el nombre en la cabecera.
  siteDescription: "Tu colección personal de vídeo",

  // Color principal de acento (botones, enlaces activos, barra de progreso, etc).
  primaryColor: "#d99a3d",

  // Color de acento secundario (detalles, hover, iconos activos).
  secondaryColor: "#5fb3a3",

  // Color de fondo general del sitio.
  backgroundColor: "#0c0d10",

  // Color de fondo de las tarjetas y paneles.
  cardColor: "#16181d",

  // Color de texto principal.
  textColor: "#eef0f2",

  // Categoría seleccionada por defecto al cargar la página ("Todos" = sin filtro).
  defaultCategory: "Todos",

  // Ruta del archivo JSON con el catálogo de vídeos (relativa, para GitHub Pages).
  dataSource: "./videos.json",

  // Número de vídeos que se muestran en "Continuar viendo" y "Añadidos recientemente".
  maxContinueWatching: 10,

  // Porcentaje de vídeo visto a partir del cual se considera "terminado"
  // y por tanto se retira de "Continuar viendo".
  finishedThreshold: 0.95,
};
