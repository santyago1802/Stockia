
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import logoStockia from "../../assets/Stockia Logo.png";
import "../../styles/navbar.css";

interface UsuarioSesion {
  rol?: string;
  nombre_usuario?: string;
  nombre?: string;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const usuarioGuardado = localStorage.getItem("usuario");

  let rol = "";
  let nombreUsuario = "";

  if (usuarioGuardado) {
    try {
      const usuario: UsuarioSesion = JSON.parse(usuarioGuardado);

      rol = usuario.rol ?? "";
      nombreUsuario =
        usuario.nombre_usuario ?? usuario.nombre ?? "";
    } catch (error) {
      console.error("Error al leer los datos del usuario:", error);
    }
  }

  const inicialUsuario = nombreUsuario.trim()
    ? nombreUsuario.trim().charAt(0).toUpperCase()
    : "U";

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const enlaceActivo = (ruta: string) =>
    location.pathname === ruta
      ? "navbar-link activo"
      : "navbar-link";

  return (
    <nav className="navbar">

      <Link to={rol === "Coordinador" ? "/dashboard" : "/devoluciones"}>
        <img
          src={logoStockia}
          alt="Logo Stockia"
          className="logo"
        />
      </Link>

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
          <Link to="/devoluciones" className={enlaceActivo("/devoluciones")}>
            Devoluciones
          </Link>
        )}

      </div>

      <div className="navbar-right">

        <div className="navbar-sede">
          <span className="sede-indicator"></span>
          <span>Sede CGMLTI</span>
        </div>

        <div className="navbar-perfil">

          <button
            type="button"
            className="navbar-avatar"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir menú del usuario"
            aria-expanded={menuAbierto}
          >
            {inicialUsuario}
          </button>

          {menuAbierto && (
            <div className="navbar-menu-perfil">

              <div className="navbar-menu-usuario">
                {nombreUsuario || "Usuario"}
              </div>

              <Link
                to="/perfil"
                className="navbar-menu-opcion"
                onClick={() => setMenuAbierto(false)}
              >
                <span>👤</span>
                Mi perfil
              </Link>

              <button
                type="button"
                className="navbar-menu-logout"
                onClick={cerrarSesion}
              >
                <span>↪</span>
                Cerrar sesión
              </button>

            </div>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;
