const traducciones = {
  es: {
    locale: "es-CO",
    idioma: "Idioma", elegir: "Selecciona una opción", calcular: "Calcular",
    transporte: "Medio de transporte al colegio", hojas: "Hojas de papel usadas al día",
    reciclaje: "Nivel de reciclaje", bus: "Bus", privado: "Carro privado",
    compartido: "Carro compartido", activo: "Bicicleta/Caminando",
    bajo: "Bajo", medio: "Medio", alto: "Alto", fecha: "Fecha",
    resultados: "Resultados", certificado: "Certificado ecológico",
    huella: "Huella semanal estimada", unidad: "kg de CO₂", de: "de",
    imprimir: "Imprimir / Guardar Reporte PDF",
    nota: "La estimación usa factores ilustrativos y supone cinco días escolares por semana."
  },
  en: {
    locale: "en-US",
    idioma: "Language", elegir: "Select an option", calcular: "Calculate",
    transporte: "Transportation to school", hojas: "Sheets of paper used per day",
    reciclaje: "Recycling level", bus: "Bus", privado: "Private car",
    compartido: "Carpool", activo: "Cycling/Walking",
    bajo: "Low", medio: "Medium", alto: "High", fecha: "Date",
    resultados: "Results", certificado: "Environmental certificate",
    huella: "Estimated weekly footprint", unidad: "kg of CO₂", de: "out of",
    imprimir: "Print / Save Report as PDF",
    nota: "This estimate uses illustrative factors and assumes five school days per week."
  }
};

// Factores ilustrativos de transporte por estudiante y día, ida y vuelta.
const diasEscolares = 5;
const kgPorHoja = 0.005;

const opcionesTransporte = {
  bus: { kgPorDia: 0.8, puntos: 30 },
  privado: { kgPorDia: 2, puntos: 0 },
  compartido: { kgPorDia: 1, puntos: 20 },
  activo: { kgPorDia: 0, puntos: 40 }
};

const opcionesReciclaje = {
  bajo: { reduccionPapel: 0, puntos: 0 },
  medio: { reduccionPapel: 0.15, puntos: 15 },
  alto: { reduccionPapel: 0.30, puntos: 30 }
};

const idioma = document.getElementById("idioma");
const formulario = document.getElementById("formulario-ambiental");
const resultado = document.getElementById("resultado");
const botonImprimir = document.getElementById("imprimir");
const textos = document.querySelectorAll("[data-texto]");
let reporte = null;

function mostrarReporte() {
  resultado.hidden = reporte === null;
  botonImprimir.disabled = reporte === null;
  if (!reporte) return;

  const t = traducciones[idioma.value];
  const decimal = new Intl.NumberFormat(t.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  document.getElementById("fecha-reporte").textContent =
    new Intl.DateTimeFormat(t.locale, { dateStyle: "long" }).format(reporte.fecha);
  document.getElementById("transporte-reporte").textContent = t[reporte.transporte];
  document.getElementById("hojas-reporte").textContent =
    new Intl.NumberFormat(t.locale).format(reporte.hojas);
  document.getElementById("reciclaje-reporte").textContent = t[reporte.reciclaje];
  document.getElementById("huella-reporte").textContent =
    `${decimal.format(reporte.huella)} ${t.unidad}`;
  document.getElementById("puntos-reporte").textContent =
    `${reporte.puntos} ${t.de} 100`;
}

function cambiarIdioma() {
  const t = traducciones[idioma.value];
  document.documentElement.lang = idioma.value;

  for (const elemento of textos) {
    elemento.textContent = t[elemento.dataset.texto];
  }

  mostrarReporte();
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const transporte = formulario.elements.transporte.value;
  const hojas = formulario.elements.hojas.valueAsNumber;
  const reciclaje = formulario.elements.reciclaje.value;
  const viaje = opcionesTransporte[transporte];
  const nivel = opcionesReciclaje[reciclaje];

  // Huella semanal = cinco días de transporte y papel, con ajuste por reciclaje.
  const huellaPapelDiaria = hojas * kgPorHoja * (1 - nivel.reduccionPapel);
  const huella = diasEscolares * (viaje.kgPorDia + huellaPapelDiaria);

  // Hasta 40 puntos por transporte, 30 por papel y 30 por reciclaje.
  const puntosPapel = Math.max(0, 30 - 2 * hojas);
  const puntos = viaje.puntos + puntosPapel + nivel.puntos;

  reporte = { fecha: new Date(), transporte, hojas, reciclaje, huella, puntos };
  mostrarReporte();
});

// Si cambian los datos, se requiere recalcular antes de imprimir.
formulario.addEventListener("input", () => {
  if (!reporte) return;
  reporte = null;
  mostrarReporte();
});

idioma.addEventListener("change", cambiarIdioma);

botonImprimir.addEventListener("click", () => {
  if (reporte) window.print();
});

cambiarIdioma();