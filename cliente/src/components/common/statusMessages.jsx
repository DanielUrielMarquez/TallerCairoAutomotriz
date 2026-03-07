function StatusMessages({ error, loading }) {
  return (
    <>
      {error && <p className="error">{error}</p>}
            {loading && <p>Cargando...</p>}
    </>
  );
}

export default StatusMessages;
