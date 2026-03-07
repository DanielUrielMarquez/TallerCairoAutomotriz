import { useState } from "react";
import { api } from "./api";

export function useAuth({ setTab }) {
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem("usuario_sesion");
    return raw ? JSON.parse(raw) : null;
  });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  async function onLogin(e) {
    e.preventDefault();

    const res = await api.login(loginForm);
    if (res.error) return res.error;

    setUsuario(res.usuario);
    localStorage.setItem("usuario_sesion", JSON.stringify(res.usuario));
    return null;
  }

  function cerrarSesion() {
    setUsuario(null);
    setTab("clientes");
    setLoginForm({ username: "", password: "" });
    localStorage.removeItem("usuario_sesion");
    localStorage.removeItem("tab_actual");
  }

  return { usuario, loginForm, setLoginForm, onLogin, cerrarSesion };
}
