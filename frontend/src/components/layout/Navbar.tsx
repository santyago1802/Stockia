
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoStockia from "../../assets/Stockia Logo.png";
import "../../styles/navbar.css";

interface UsuarioSesion {
  rol?: string;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("usuario");

  let rol = "";

  if (usuarioGuardado) {
    try {
      const usuario: UsuarioSesion = JSON.parse(usuarioGuardado);
      rol = usuario.rol ?? "";
    } catch (error) {
      console.error("Error al leer los datos del usuario:", error);
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const enlaceActivo = (ruta: string) =>
    location.pathname === ruta ? "navbar-link activo" : "navbar-link";

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to={rol === "Coordinador" ? "/dashboard" : "/devoluciones"}>
        <img
          src={logoStockia}
          alt="Logo Stockia"
          className="logo"
        />
      </Link>

      {/* NAVEGACIÓN */}
      <div className="navbar-links">
        {rol === "Coordinador" && (
          <>
            <Link to="/dashboard" className={enlaceActivo("/dashboard")}>
              Resumen
            </Link>

            <Link to="/movimientos" className={enlaceActivo("/movimientos")}>
              Movimientos
            </Link>

            <Link to="/usuarios" className={enlaceActivo("/usuarios")}>
              Usuarios
            </Link>
          </>
        )}

        <Link to="/productos" className={enlaceActivo("/productos")}>
          Materiales
        </Link>

        {rol === "Instructor" && (
          <Link
            to="/devoluciones"
            className={enlaceActivo("/devoluciones")}
          >
            Devoluciones
          </Link>
        )}
      </div>

      {/* INFORMACIÓN DE SEDE Y SESIÓN */}
      <div className="navbar-right">
        <div className="navbar-sede">
          <span className="sede-indicator"></span>
          <span>Sede CGMLTI</span>
        </div>

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
