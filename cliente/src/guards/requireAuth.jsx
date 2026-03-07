
function RequireAuth({ usuario, fallback, children }) {
  if (!usuario) return fallback;
  return children;
}

export default RequireAuth;
