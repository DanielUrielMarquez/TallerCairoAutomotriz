function RequireRole({ allow, fallback = null, children }) {
  if (!allow) return fallback;
  return children;
}

export default RequireRole;
