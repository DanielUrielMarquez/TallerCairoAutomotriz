function ReportesPanel({ tab, resumen, totalTareas, exportarResumen }) {
  return (
    <>
      {tab === "reportes" && (
        <section className="card">
          <h2>Reportes</h2>
          <ul className="list">
            <li>Clientes registrados: {resumen?.clientes ?? 0}</li>
            <li>Vehiculos en taller: {resumen?.vehiculosEnTaller ?? 0}</li>
            <li>Tareas abiertas: {resumen?.tareasAbiertas ?? 0}</li>
            <li>Tareas en proceso: {resumen?.tareasEnProceso ?? 0}</li>
            <li>Tareas cerradas: {resumen?.tareasCerradas ?? 0}</li>
            <li>Recursos con stock bajo: {resumen?.recursosStockBajo ?? 0}</li>
            <li>Total acumulado de tareas: ${totalTareas.toLocaleString("es-AR")}</li>
          </ul>

          <button type="button" onClick={exportarResumen}>
            Exportar resumen Excel
          </button>
        </section>
      )}
    </>
  );
}

export default ReportesPanel;
