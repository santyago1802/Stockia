import { Link, useLocation, useNavigate } from "react-router-dom";
import logoStockia from "../../assets/Stockia Logo.png";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("usuario");

  let rol = "";

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    rol = usuario.rol;
  }

  const cerrarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  navigate("/");
  };
  return (
    <nav className="navbar">
      <img
        src={logoStockia}
        alt="Logo Stockia"
        className="logo"
      />

      <div className="navbar-links">
        
        {rol === "Coordinador" && (
          <>
            {location.pathname !== "/dashboard" && (
              <Link to="/dashboard">Resumen de inventario</Link>
            )}

            {location.pathname !== "/usuarios" && (
              <Link to="/usuarios">Usuarios</Link>
            )}
          </>
        )}

        {location.pathname !== "/productos" && (
          <Link to="/productos">Materiales</Link>
        )}
        {rol === "Instructor" && 
          location.pathname !== "/devoluciones" && (
            <Link to="/devoluciones">Devoluciones</Link>
          )}
        <button
          className="btn-logout"
          onClick={cerrarSesion}
        >
        Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;