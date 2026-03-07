function TopBar({ usuario, onRefresh, onLogout }) {
  const cargarTodo = onRefresh;
  const cerrarSesion = onLogout;
  return (
    <>
      <header className="topbar">
              <div>
                <h1>Sistema Taller Automotriz</h1>
                <p>{usuario.username} ({usuario.rol})</p>
              </div>
      
              <div className="topbar-actions">
                <button type="button" onClick={cargarTodo}>Actualizar</button>
                <button type="button" className="btn-logout" onClick={cerrarSesion}>
                  Cerrar sesion
                </button>
              </div>
            </header>
    </>
  );
}

export default TopBar;
