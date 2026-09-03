//sidebar le da la pagina depende del rol del usuario, 
// si es coordinador o instructor, se le mostrara 
// diferentes opciones de menu

import { Link } from "react-router-dom";

function Sidebar() {
  const usuarioGuardado = localStorage.getItem("usuario");

  let rol = "";

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    rol = usuario.rol;
  }

  return (
    <aside className="sidebar">
      <ul>

        {rol === "Coordinador" && (
          <li>
            <Link to="/dashboard">
              Dashboard
            </Link>
          </li>
        )}

        {rol === "Instructor" && (
          <li>
            <Link to="/devoluciones">
              Devoluciones
            </Link>
          </li>
        )}

        {rol === "Coordinador" && (
          <li>
            <Link to="/usuarios">
              Usuarios
            </Link>
          </li>
        )}

        <li>
          <Link to="/productos">
            Materiales
          </Link>
        </li>

      </ul>
    </aside>
  );
}

export default Sidebar;