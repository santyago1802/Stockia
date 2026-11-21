import { Link, useLocation, useNavigate } from "react-router-dom"; // Hooks de navegación y ruta actual de React Router.
import logoStockia from "../../assets/Stockia Logo.png"; // Importa el logotipo como recurso estático tipado por Vite.
import "../../styles/navbar.css"; // Importa los estilos de la barra fija desde su archivo CSS dedicado.

interface UsuarioSesion { // Interfaz TypeScript que describe la estructura esperada del objeto usuario en localStorage.
  rol?: string; // Propiedad rol opcional (string) para evitar errores si el JSON no trae ese campo.
}

function Navbar() { // Declara el componente funcional Navbar.
  const location = useLocation(); // Obtiene la ubicación actual (por ejemplo "/dashboard" o "/productos").
  const navigate = useNavigate(); // Obtiene la función para redirigir programáticamente entre rutas.

  const usuarioGuardado = localStorage.getItem("usuario"); // Lee la cadena JSON guardada en localStorage bajo la clave "usuario".

  let rol = ""; // Inicializa el rol vacío por defecto (usuario sin rol o no autenticado).

  if (usuarioGuardado) { // Solo parsea si existe un valor guardado en localStorage.
    const usuario: UsuarioSesion = JSON.parse(usuarioGuardado); // Convierte el texto JSON a objeto y lo tipa con UsuarioSesion.
    rol = usuario.rol ?? ""; // Asigna usuario.rol si existe, o "" si es undefined/null.
  }

  const cerrarSesion = () => { // Función que limpia la sesión local y regresa al inicio de sesión.
    localStorage.removeItem("token"); // Elimina el token de autenticación guardado.
    localStorage.removeItem("usuario"); // Elimina los datos del usuario guardado.

    navigate("/"); // Redirige a la ruta principal ("/", donde está Login).
  };

  return ( // Retorna el JSX del componente.
    <nav className="navbar"> {/* Barra de navegación principal (fija con position: sticky en CSS). */}
      <img
        src={logoStockia} // Muestra la imagen importada del logo.
        alt="Logo Stockia" // Texto alternativo accesible para la imagen.
        className="logo" // Aplica estilos del logo dentro de .navbar.
      />

      {rol && <strong className="navbar-saludo">¡Bienvenido {rol}!</strong>}

      <div className="navbar-links"> {/* Contenedor de enlaces dinámicos según rol y ruta actual. */}
        {rol === "Coordinador" && ( // Renderizado condicional: solo muestra estas opciones si el rol es Coordinador.
          <>
            {location.pathname !== "/dashboard" && ( // Oculta el enlace a Resumen de inventario si ya estás en "/dashboard".
              <Link to="/dashboard">Resumen de inventario</Link> // Enlace a la ruta "/dashboard".
            )}

            {location.pathname !== "/usuarios" && ( // Oculta el enlace a Usuarios si ya estás en "/usuarios".
              <Link to="/usuarios">Usuarios</Link> // Enlace a la ruta "/usuarios".
            )}
            
          </>
        )}

        {location.pathname !== "/productos" && ( // Enlace visible para cualquier rol autenticado, excepto si ya estás en "/productos".
          <Link to="/productos">Materiales</Link> // Enlace a la ruta "/productos".
        )}

        {rol === "Instructor" && // Solo muestra Devoluciones si el rol es "Instructor"...
          location.pathname !== "/devoluciones" && ( // ...y si no estás ya en "/devoluciones".
            <Link to="/devoluciones">Devoluciones</Link> // Enlace a la ruta "/devoluciones".
          )}

        <button
          className="btn-logout" // Estilo del botón de cerrar sesión.
          onClick={cerrarSesion} // Ejecuta cerrarSesion al hacer clic.
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar; // Exporta el componente para usarlo en las páginas/layout.