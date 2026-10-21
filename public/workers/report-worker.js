// Web Worker que dibuja el informe en PDF con pdf-lib a partir del modelo que arma lib/report.ts.
// Lo hago aquí porque componer las curvas y paginar la explicación tarda y no quiero trabar la página.
// pdf-lib llega a public/vendor/ en cada build (npm run vendor) desde la versión fijada en package.json.
import { PDFDocument, rgb, StandardFonts } from "../vendor/pdf-lib.esm.min.js";

// A4 en puntos; el margen deja aire para el pie con el número de página
const PAGE = [595.28, 841.89];
const MARGIN = 48;
const FOOTER = 28;
const WIDTH = PAGE[0] - MARGIN * 2;
const CHART_HEIGHT = 190;
const AXIS_GUTTER = 34;

const color = (hex) => rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

/** Lienzo con cursor vertical: escribe de arriba hacia abajo y abre otra página cuando no cabe. */
class Canvas {
  constructor(doc, fonts, colors) {
    this.doc = doc;
    this.fonts = fonts;
    this.colors = colors;
    // Helvetica sólo trae WinAnsi: lo que no está (emojis, flechas) lo quito para que no reviente
    this.charset = new Set(fonts.regular.getCharacterSet());
    this.addPage();
  }

  addPage() {
    this.page = this.doc.addPage(PAGE);
    this.y = PAGE[1] - MARGIN;
  }

  ensure(height) {
    if (this.y - height < MARGIN + FOOTER) this.addPage();
  }

  clean(text) {
    return [...text]
      .map((ch) => (this.charset.has(ch.codePointAt(0)) ? ch : /\s/.test(ch) ? " " : ""))
      .join("")
      .replace(/ +([.,;:!?])/g, "$1");
  }

  lines(text, { size, bold = false, width = WIDTH }) {
    const font = bold ? this.fonts.bold : this.fonts.regular;
    const lines = [];
    let line = "";
    for (const word of this.clean(text).split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(candidate, size) > width) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    return line ? [...lines, line] : lines;
  }

  /** Texto con ajuste de línea desde el cursor; cada línea que no cabe salta de página. */
  text(text, { size = 10.5, bold = false, tint = this.colors.ink, x = MARGIN, width = WIDTH, leading = 1.45 } = {}) {
    const font = bold ? this.fonts.bold : this.fonts.regular;
    for (const line of this.lines(text, { size, bold, width })) {
      this.ensure(size * leading);
      this.y -= size * leading;
      this.page.drawText(line, { x, y: this.y + size * (leading - 1), size, font, color: color(tint) });
    }
  }

  gap(points) {
    this.y -= points;
  }
}

function header(canvas, model) {
  canvas.text(model.brand, { size: 11, bold: true, tint: model.colors.accent });
  canvas.text(model.title, { size: 22, bold: true, leading: 1.3 });
  canvas.text(model.subtitle, { size: 11, tint: model.colors.muted });
  canvas.gap(8);
  canvas.page.drawLine({ start: { x: MARGIN, y: canvas.y }, end: { x: MARGIN + WIDTH, y: canvas.y }, thickness: 2, color: color(model.colors.accent) });
  canvas.gap(16);
}

/** Pares rótulo/cifra en columnas; las cifras van en su color (rodilla, tronco, zona, riesgo). */
function pairs(canvas, items, { columns, valueSize, boxed }) {
  const cell = WIDTH / columns;
  const height = valueSize + 30;
  for (let start = 0; start < items.length; start += columns) {
    canvas.ensure(height + 8);
    const top = canvas.y;
    items.slice(start, start + columns).forEach((item, i) => {
      const x = MARGIN + i * cell;
      if (boxed) canvas.page.drawRectangle({ x, y: top - height, width: cell - 8, height, color: color(canvas.colors.panel), borderColor: color(canvas.colors.line), borderWidth: 0.75 });
      const pad = boxed ? 10 : 0;
      canvas.page.drawText(canvas.clean(item.label), { x: x + pad, y: top - 16, size: 8.5, font: canvas.fonts.regular, color: color(canvas.colors.muted), maxWidth: cell - 8 - pad * 2 });
      // La cifra se achica hasta caber en su celda: un texto largo no debe partirse fuera del recuadro
      const value = canvas.clean(item.value);
      const room = cell - 8 - pad * 2;
      const size = Math.min(valueSize, (valueSize * room) / canvas.fonts.bold.widthOfTextAtSize(value, valueSize));
      canvas.page.drawText(value, { x: x + pad, y: top - 20 - valueSize, size, font: canvas.fonts.bold, color: color(item.color) });
    });
    canvas.y = top - height - 8;
  }
  canvas.gap(8);
}

function sectionTitle(canvas, text) {
  canvas.ensure(48);
  canvas.text(text, { size: 13, bold: true, leading: 1.6 });
  canvas.gap(4);
}

/** Curvas de rodilla y tronco como vectores sobre las bandas de zona, con el pico de cada repetición. */
function chart(canvas, model) {
  const c = model.chart;
  sectionTitle(canvas, c.title);
  canvas.ensure(CHART_HEIGHT + 44);
  const left = MARGIN + AXIS_GUTTER;
  const plotWidth = WIDTH - AXIS_GUTTER;
  const top = canvas.y;
  const bottom = top - CHART_HEIGHT;
  const x = (ms) => left + (c.durationMs ? (ms / c.durationMs) * plotWidth : 0);
  const y = (degrees) => bottom + (degrees / c.maxDegrees) * CHART_HEIGHT;
  const { page, fonts } = canvas;
  const muted = color(model.colors.muted);

  for (const band of c.bands) page.drawRectangle({ x: left, y: y(band.from), width: plotWidth, height: y(band.to) - y(band.from), color: color(band.color) });
  for (const label of c.yLabels) {
    page.drawLine({ start: { x: left, y: y(label.degrees) }, end: { x: left + plotWidth, y: y(label.degrees) }, thickness: 0.5, color: color(model.colors.line) });
    const text = canvas.clean(label.text);
    page.drawText(text, { x: left - 6 - fonts.regular.widthOfTextAtSize(text, 8), y: y(label.degrees) - 3, size: 8, font: fonts.regular, color: muted });
  }
  for (const label of c.xLabels) {
    const text = canvas.clean(label.text);
    const at = Math.min(x(label.ms) - fonts.regular.widthOfTextAtSize(text, 8) / 2, left + plotWidth - fonts.regular.widthOfTextAtSize(text, 8));
    page.drawText(text, { x: Math.max(left, at), y: bottom - 14, size: 8, font: fonts.regular, color: muted });
  }
  // drawSvgPath mide y hacia abajo desde el origen: lo pongo en la esquina superior del área
  for (const series of c.series) {
    const path = series.points.map((p, i) => `${i ? "L" : "M"}${(x(p.ms) - left).toFixed(2)} ${(top - y(p.degrees)).toFixed(2)}`).join(" ");
    page.drawSvgPath(path, { x: left, y: top, borderColor: color(series.color), borderWidth: 1.6 });
  }
  for (const mark of c.marks) page.drawCircle({ x: x(mark.ms), y: y(mark.degrees), size: 3.4, color: color(mark.color), borderColor: color("#FFFFFF"), borderWidth: 1 });

  let legendX = left;
  const legendY = bottom - 32;
  for (const series of c.series) {
    page.drawLine({ start: { x: legendX, y: legendY + 3 }, end: { x: legendX + 16, y: legendY + 3 }, thickness: 2.4, color: color(series.color) });
    const text = canvas.clean(series.label);
    page.drawText(text, { x: legendX + 22, y: legendY, size: 9, font: fonts.regular, color: color(model.colors.ink) });
    legendX += 22 + fonts.regular.widthOfTextAtSize(text, 9) + 24;
  }
  canvas.y = legendY - 14;
}

function repetitions(canvas, model) {
  const table = model.repetitions;
  sectionTitle(canvas, table.title);
  const widths = [0.18, 0.27, 0.3, 0.25].map((share) => share * WIDTH);
  const row = (cells, { bold, tint, dot }) => {
    canvas.ensure(20);
    canvas.y -= 18;
    let x = MARGIN;
    cells.forEach((cell, i) => {
      if (dot && i === 0) canvas.page.drawCircle({ x: x + 4, y: canvas.y + 3.5, size: 3.5, color: color(dot) });
      const offset = dot && i === 0 ? 14 : 0;
      canvas.page.drawText(canvas.clean(cell), { x: x + offset, y: canvas.y, size: 9.5, font: bold ? canvas.fonts.bold : canvas.fonts.regular, color: color(i === 2 && dot ? dot : tint) });
      x += widths[i];
    });
    canvas.page.drawLine({ start: { x: MARGIN, y: canvas.y - 6 }, end: { x: MARGIN + WIDTH, y: canvas.y - 6 }, thickness: 0.5, color: color(model.colors.line) });
  };
  row(table.headers, { bold: true, tint: model.colors.muted });
  for (const r of table.rows) row(r.cells, { bold: false, tint: model.colors.ink, dot: r.color });
  canvas.gap(18);
}

function disclaimer(canvas, model) {
  const body = canvas.lines(model.disclaimer.body, { size: 9.5, width: WIDTH - 24 });
  const height = 28 + body.length * 9.5 * 1.45;
  canvas.ensure(height + 8);
  canvas.page.drawRectangle({ x: MARGIN, y: canvas.y - height, width: WIDTH, height, color: color(model.colors.panel), borderColor: color(model.colors.line), borderWidth: 0.75 });
  canvas.page.drawRectangle({ x: MARGIN, y: canvas.y - height, width: 4, height, color: color(model.colors.ink) });
  canvas.gap(6);
  canvas.text(model.disclaimer.title, { size: 10, bold: true, x: MARGIN + 14, width: WIDTH - 24 });
  canvas.text(model.disclaimer.body, { size: 9.5, x: MARGIN + 14, width: WIDTH - 24 });
}

/** Dibuja el informe y devuelve los bytes del PDF. */
export async function renderReport(model) {
  const doc = await PDFDocument.create();
  doc.setTitle(model.title);
  doc.setSubject(model.subtitle);
  doc.setCreator(model.brand);
  const fonts = { regular: await doc.embedFont(StandardFonts.Helvetica), bold: await doc.embedFont(StandardFonts.HelveticaBold) };
  const canvas = new Canvas(doc, fonts, model.colors);

  header(canvas, model);
  pairs(canvas, model.people, { columns: 2, valueSize: 13, boxed: false });
  pairs(canvas, model.figures, { columns: 3, valueSize: 15, boxed: true });
  if (model.chart) chart(canvas, model);
  if (model.repetitions) repetitions(canvas, model);
  sectionTitle(canvas, model.explanation.title);
  for (const paragraph of model.explanation.paragraphs) {
    canvas.text(paragraph);
    canvas.gap(6);
  }
  canvas.gap(6);
  for (const note of model.notes) canvas.text(note, { size: 9, tint: model.colors.muted });
  canvas.gap(10);
  disclaimer(canvas, model);

  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const label = canvas.clean(model.pageLabel.replace("{page}", String(i + 1)).replace("{total}", String(pages.length)));
    const options = { y: MARGIN / 2, size: 8, font: fonts.regular, color: color(model.colors.muted) };
    page.drawText(canvas.clean(model.brand), { ...options, x: MARGIN });
    page.drawText(label, { ...options, x: MARGIN + WIDTH - fonts.regular.widthOfTextAtSize(label, 8) });
  });
  return doc.save();
}

// En Node (tests) no hay `self`: sólo se exporta renderReport
if (typeof self !== "undefined") {
  self.onmessage = async (event) => {
    try {
      const bytes = await renderReport(event.data);
      self.postMessage(bytes, [bytes.buffer]);
    } catch {
      self.postMessage(null);
    }
  };
}
