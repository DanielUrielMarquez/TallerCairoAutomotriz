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

  return rows.map((r) => {
    const normalized = {};
    Object.entries(r).forEach(([k, v]) => {
      normalized[String(k).trim().toLowerCase()] = v;
    });

    return {
      nombre: String(normalized.nombre ?? "").trim(),
      tipo: String(normalized.tipo ?? "").trim().toLowerCase(),
      stock: Number(normalized.stock ?? 0),
      minimo: Number(normalized.minimo ?? 0),
    };
  });
}

