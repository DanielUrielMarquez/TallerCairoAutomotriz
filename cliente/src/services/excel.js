import * as XLSX from "xlsx";

export function exportRecursosToExcel(recursos) {
  const rows = recursos.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    tipo: r.tipo,
    stock: r.stock,
    minimo: r.minimo,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Recursos");
  XLSX.writeFile(wb, "recursos.xlsx");
}
export async function parseRecursosFromExcel(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const ok = [];
  const errores = [];

  rows.forEach((r, idx) => {
    const fila = idx + 2; // +2 porque la fila 1 suele ser encabezado
    const normalized = {};

    Object.entries(r).forEach(([k, v]) => {
      normalized[String(k).trim().toLowerCase()] = v;
    });

    const item = {
      nombre: String(normalized.nombre ?? "").trim(),
      tipo: String(normalized.tipo ?? "").trim().toLowerCase(),
      stock: Number(normalized.stock ?? 0),
      minimo: Number(normalized.minimo ?? 0),
    };

    const motivos = [];
    if (!item.nombre) motivos.push("nombre vacío");
    if (!["repuesto", "insumo", "herramienta"].includes(item.tipo)) motivos.push("tipo inválido");
    if (!Number.isFinite(item.stock) || item.stock < 0) motivos.push("stock inválido");
    if (!Number.isFinite(item.minimo) || item.minimo < 0) motivos.push("mínimo inválido");

    if (motivos.length) {
      errores.push({ fila, motivo: motivos.join(", "), original: r });
    } else {
      ok.push(item);
    }
  });

  return { ok, errores, total: rows.length };
}
export function exportErroresImportacionToExcel(errores) {
  if (!Array.isArray(errores) || !errores.length) return;

  const rows = errores.map((e) => ({
    fila: e.fila,
    motivo: e.motivo,
    nombre: e.original?.nombre ?? "",
    tipo: e.original?.tipo ?? "",
    stock: e.original?.stock ?? "",
    minimo: e.original?.minimo ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ErroresImportacion");
  XLSX.writeFile(wb, "errores_importacion_recursos.xlsx");
}
export function exportResumenToExcel(resumen, totalTareas) {
  const rows = [
    { indicador: "Clientes", valor: resumen?.clientes ?? 0 },
    { indicador: "Vehículos en taller", valor: resumen?.vehiculosEnTaller ?? 0 },
    { indicador: "Tareas abiertas", valor: resumen?.tareasAbiertas ?? 0 },
    { indicador: "Tareas en proceso", valor: resumen?.tareasEnProceso ?? 0 },
    { indicador: "Tareas cerradas", valor: resumen?.tareasCerradas ?? 0 },
    { indicador: "Tareas vencidas", valor: resumen?.tareasVencidas ?? 0 },
    { indicador: "Recursos stock bajo", valor: resumen?.recursosStockBajo ?? 0 },
    { indicador: "Total tareas", valor: totalTareas ?? 0 },
  ];

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  XLSX.writeFile(wb, "reporte_resumen_taller.xlsx");
}
export function exportPedidoMayoristaToExcel(recursosStockBajo) {
  if (!Array.isArray(recursosStockBajo) || !recursosStockBajo.length) return;

const factorReposicion = 2;

const rows = recursosStockBajo.map((r) => {
  const stock = Number(r.stock) || 0;
  const minimo = Number(r.minimo) || 0;
  const objetivo = Math.ceil(minimo * factorReposicion);
  const cantidadAPedir = Math.max(0, objetivo - stock);

  return {
    id: r.id,
    nombre: r.nombre,
    tipo: r.tipo,
    stock_actual: stock,
    minimo,
    objetivo_stock: objetivo,
    cantidad_a_pedir: cantidadAPedir,
  };
});
const totalItems = rows.length;
const totalAPedir = rows.reduce((acc, r) => acc + Number(r.cantidad_a_pedir || 0), 0);

const resumenRows = [
  { campo: "Fecha exportacion", valor: new Date().toLocaleString("es-AR") },
  { campo: "Items con stock bajo", valor: totalItems },
  { campo: "Total unidades a pedir", valor: totalAPedir },
];

const wsResumen = XLSX.utils.json_to_sheet(resumenRows);



  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PedidoMayorista");
  const now = new Date();
  XLSX.utils.book_append_sheet(wb, wsResumen, "ResumenPedido");
const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
XLSX.writeFile(wb, `pedido_mayorista_${stamp}.xlsx`);

}

