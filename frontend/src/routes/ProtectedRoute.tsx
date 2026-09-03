import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolPermitido?: string;
}

function ProtectedRoute({
  children,
  rolPermitido,
}: ProtectedRouteProps) {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return <Navigate to="/" replace />;
  }

  const usuario = JSON.parse(usuarioGuardado);

  if (rolPermitido && usuario.rol !== rolPermitido) {
    return <Navigate to="/productos" replace />;
  }

  return children;
}

export default ProtectedRoute;