function StatsHeader({ resumen, setTab }) {
  return (
    <>
      {resumen && (
              <section className="stats-grid always-visible-stats">
                <button type="button" className="stat clickable" onClick={() => setTab("clientes")}>
                  <span>Clientes</span><strong>{resumen.clientes}</strong>
                </button>
                <button type="button" className="stat clickable" onClick={() => setTab("vehiculos")}>
                  <span>Vehiculos en taller</span><strong>{resumen.vehiculosEnTaller}</strong>
                </button>
                <button type="button" className="stat clickable" onClick={() => setTab("tareas")}>
                  <span>Tareas abiertas</span><strong>{resumen.tareasAbiertas}</strong>
                </button>
                <button type="button" className="stat clickable" onClick={() => setTab("tareas")}>
                  <span>En proceso</span><strong>{resumen.tareasEnProceso}</strong>
                </button>
                <button type="button" className="stat clickable" onClick={() => setTab("tareas")}>
                  <span>Cerradas</span><strong>{resumen.tareasCerradas}</strong>
                </button>
                <button type="button" className="stat clickable" onClick={() => setTab("recursos")}>
                  <span>Stock bajo</span><strong>{resumen.recursosStockBajo}</strong>
                </button>
              </section>
            )}
      
            {resumen && (
              <div className="top-kpi-bar">
                <span className="kpi-label">Alertas</span>
                <span className={`kpi-stock ${resumen.recursosStockBajo > 0 ? "danger" : "ok"}`}>
                  Stock bajo: {resumen.recursosStockBajo}
                </span>
              </div>
            )}
    </>
  );
}

export default StatsHeader;
