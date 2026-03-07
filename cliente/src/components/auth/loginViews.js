function LoginView({ loginForm, setLoginForm, onLogin, error }) {
  return (
    <main className="layout">
      <section className="card auth-card">
        <h1>Taller Cairo</h1>
        <p>Ingresar al sistema</p>

        <form className="form one-col" onSubmit={onLogin}>
          <input
            placeholder="Usuario"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          <button type="submit">Entrar</button>
        </form>

        {error && <p className="error">{error}</p>}
        <small>Demo: admin / 1234</small>
      </section>
    </main>
  );
}

export default LoginView;
