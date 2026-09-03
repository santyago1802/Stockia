import { useState } from "react";
import { Link } from "react-router-dom";
import logoStockia from "../../assets/Stockia Logo.png";

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const usuarioGuardado = localStorage.getItem("usuario");

  let rol = "";

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    rol = usuario.rol;
  }

  return (
    <>
      <nav className="navbar">

        <button
          className="menu-button"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>

        <img
          src={logoStockia}
          alt="Logo Stockia"
          className="logo"
        />

      </nav>

      {menuAbierto && (
        <aside className="menu-lateral">

          <button
            className="cerrar-menu"
            onClick={() => setMenuAbierto(false)}
          >
            ✕
          </button>

          <h3>Menú</h3>

          {rol === "Coordinador" && (
            <>
              <Link to="/dashboard" onClick={() => setMenuAbierto(false)}>
                Dashboard
              </Link>

              <Link to="/usuarios" onClick={() => setMenuAbierto(false)}>
                Usuarios
              </Link>
            </>
          )}

          <Link to="/productos" onClick={() => setMenuAbierto(false)}>
            Materiales
          </Link>

          {rol === "Instructor" && (
            <Link
              to="/devoluciones"
              onClick={() => setMenuAbierto(false)}
            >
              Devoluciones
            </Link>
          )}

        </aside>
      )}
    </>
  );
}

export default Navbar;