import { useEffect, useState } from "react"; // Importa hooks de React para efectos secundarios y manejo de estado.
import Navbar from "../components/layout/Navbar"; // Importa la barra de navegación superior.
import "../styles/prestamos.css"; // Importa los estilos de la grilla y tarjetas de préstamos.
import "../styles/modales.css"; // Importa los estilos de los modales de confirmación y mensajes.

export type EstadoPrestamo = "pendiente" | "devuelto"; // Tipo unión que restringe los estados válidos a "pendiente" o "devuelto".

interface Prestamo { // Interfaz TypeScript que define la forma de cada objeto préstamo recibido de la API.
  id_prestamo: number; // Identificador numérico único del préstamo.
  id_usuario: number; // Identificador del usuario que realizó el préstamo.
  nombre_usuario: string; // Nombre del usuario asociado al préstamo.
  fecha_prestamo: string; // Fecha en que se registró el préstamo.
  estado: EstadoPrestamo | string; // Estado del préstamo (tipado para "pendiente" | "devuelto" con respaldo string).
  id_material: number; // Identificador del material prestado.
  nombre_material: string; // Nombre del material prestado.
  cantidad: number; // Cantidad de unidades prestadas.
}

interface UsuarioLocal { // Interfaz TypeScript para tipar el objeto usuario guardado en localStorage.
  id_usuario: number; // ID del usuario autenticado para filtrar solo sus préstamos.
}

function Devoluciones() { // Declara el componente funcional Devoluciones.
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]); // Guarda todos los préstamos del usuario actual (pendientes y devueltos).
  const [vistaEstado, setVistaEstado] = useState<EstadoPrestamo>("pendiente"); // Controla qué grupo se consulta: "pendiente" o "devuelto".
  const [cargando, setCargando] = useState(true); // Indica si se están cargando los préstamos desde el backend.
  const [mensaje, setMensaje] = useState(""); // Guarda el texto del modal de resultado (éxito o error).
  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error">("exito"); // Tipa el estilo del modal como "exito" o "error".
  const [prestamoADevolver, setPrestamoADevolver] = useState<number | null>( // Guarda el id del préstamo a confirmar devolución o null si no hay modal abierto.
    null // Valor inicial nulo.
  );

  const obtenerPrestamos = async () => { // Función asíncrona que consulta los préstamos en la API.
    try { // Intenta realizar la petición y filtrar los registros.
      const token = localStorage.getItem("token"); // Obtiene el token JWT guardado en localStorage.

      const respuesta = await fetch( // Llama al endpoint GET de préstamos.
        "http://localhost:3000/api/prestamos", // URL del backend para listar préstamos.
        { // Opciones de configuración de fetch.
          headers: { // Encabezados HTTP de la petición.
            Authorization: `Bearer ${token}`, // Envía el token de autenticación en formato Bearer.
          },
        }
      );

      const datos: Prestamo[] = await respuesta.json(); // Parsea la respuesta JSON y la tipa como arreglo de Prestamo.

      const usuarioGuardado = localStorage.getItem("usuario"); // Lee los datos del usuario autenticado desde localStorage.

      if (!usuarioGuardado) { // Si no hay usuario guardado en localStorage...
        return; // ...detiene la ejecución para evitar errores al parsear.
      }

      const usuario: UsuarioLocal = JSON.parse(usuarioGuardado); // Convierte el JSON del usuario y lo tipa con UsuarioLocal.

      const misPrestamos = datos.filter( // Filtra la lista completa para quedarse solo con los préstamos del usuario actual.
        (prestamo: Prestamo) => prestamo.id_usuario === usuario.id_usuario // Compara el id_usuario del préstamo con el del usuario logueado.
      );

      setPrestamos(misPrestamos); // Guarda pendientes y devueltos del usuario para poder separarlos en la vista.
    } catch (error) { // Captura errores de red o de parseo.
      console.error("Error al obtener préstamos:", error); // Registra el error en la consola del navegador.
    } finally { // Se ejecuta siempre al finalizar el try/catch.
      setCargando(false); // Finaliza el estado de carga.
    }
  };

  useEffect(() => { // Hook de efecto que se ejecuta al montar el componente.
    obtenerPrestamos(); // Carga los préstamos al entrar a la vista.
  }, []); // Arreglo de dependencias vacío: corre una sola vez al montar.

  const devolverPrestamo = async (idPrestamo: number) => { // Función asíncrona que marca un préstamo como devuelto en el backend.
    try { // Intenta ejecutar la devolución.
      const token = localStorage.getItem("token"); // Recupera el token de sesión.

      const respuesta = await fetch( // Envía petición PUT al endpoint de devolución del préstamo.
        `http://localhost:3000/api/prestamos/${idPrestamo}/devolver`, // Ruta dinámica con el id del préstamo.
        { // Configuración de la petición PUT.
          method: "PUT", // Método HTTP PUT para actualizar el estado del préstamo.
          headers: { // Encabezados HTTP.
            Authorization: `Bearer ${token}`, // Envía el token de autorización.
          },
        }
      );

      const datos = await respuesta.json(); // Lee la respuesta JSON del servidor.

      if (!respuesta.ok) { // Si la respuesta HTTP no es exitosa (2xx)...
        setMensaje(datos.mensaje); // ...muestra el mensaje de error enviado por el backend.
        setTipoMensaje("error"); // Marca el modal como error.
        return; // Sale de la función sin refrescar como éxito.
      }

      setMensaje("Préstamo devuelto correctamente"); // Define el mensaje de confirmación exitosa.
      setTipoMensaje("exito"); // Marca el modal como éxito.

      obtenerPrestamos(); // Vuelve a consultar los préstamos para que el ítem pase de "pendiente" a "devuelto".
    } catch (error) { // Captura fallos de conexión o excepciones.
      console.error("Error al devolver préstamo:", error); // Muestra el error en consola.
      setMensaje("No se pudo devolver el préstamo"); // Muestra mensaje amigable al usuario.
      setTipoMensaje("error"); // Marca el modal como error.
    }
  };

  const prestamosPendientes = prestamos.filter( // Filtra del estado general solo los préstamos con estado "pendiente".
    (prestamo) => prestamo.estado === "pendiente" // Condición de filtrado para pendientes.
  );

  const prestamosDevueltos = prestamos.filter( // Filtra del estado general solo los préstamos con estado "devuelto".
    (prestamo) => prestamo.estado === "devuelto" // Condición de filtrado para devueltos.
  );

  const prestamosMostrados = // Selecciona qué grupo mostrar según la vista elegida ("pendiente" o "devuelto").
    vistaEstado === "pendiente" ? prestamosPendientes : prestamosDevueltos; // Operador ternario para alternar entre ambos grupos.

  if (cargando) { // Mientras cargando sea true...
    return <p>Cargando devoluciones...</p>; // ...muestra un mensaje provisional de carga.
  }

  return ( // Retorna el JSX completo de la página.
    <div> {/* Contenedor raíz de la vista. */}
      <Navbar /> {/* Renderiza la barra de navegación fija. */}

      {prestamoADevolver !== null && ( // Renderiza el modal de confirmación solo si hay un id seleccionado.
        <div className="mensaje-overlay"> {/* Fondo oscuro del modal. */}
          <div className="mensaje-box"> {/* Caja del modal de confirmación. */}
            <h2>Confirmar devolución</h2> {/* Título del modal. */}

            <p> {/* Texto de confirmación. */}
              ¿Estás seguro de que quieres devolver este préstamo?
            </p>

            <div className="botones-confirmacion"> {/* Contenedor de botones de confirmar/cancelar. */}
              <button // Botón para confirmar la devolución.
                className="btn-confirmar" // Clase de estilo confirmar.
                onClick={() => { // Al hacer clic...
                  devolverPrestamo(prestamoADevolver); // ...llama a devolverPrestamo con el id seleccionado...
                  setPrestamoADevolver(null); // ...y cierra el modal de confirmación.
                }}
              >
                Confirmar
              </button>

              <button // Botón para cancelar y cerrar el modal.
                className="btn-cancelar" // Clase de estilo cancelar.
                onClick={() => setPrestamoADevolver(null)} // Limpia prestamoADevolver para cerrar el modal.
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mensaje && ( // Renderiza el modal de alerta cuando existe un mensaje.
        <div className="mensaje-overlay"> {/* Fondo del modal de mensaje. */}
          <div className={`mensaje-box ${tipoMensaje}`}> {/* Aplica clase "exito" o "error" dinámicamente. */}
            <h2> {/* Encabezado según el tipo de mensaje. */}
              {tipoMensaje === "exito" ? "✓ ¡Listo!" : "⚠️ Error"}
            </h2>

            <p>{mensaje}</p> {/* Muestra el texto del mensaje. */}

            <button // Botón para cerrar el modal de mensaje.
              onClick={() => setMensaje("")} // Limpia mensaje para ocultar el modal.
              className="btn-mensaje" // Clase de estilo del botón aceptar.
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <main className="products-section"> {/* Contenido principal de la página. */}
        <h1>Mis devoluciones</h1> {/* Título principal de la sección. */}

        <div className="prestamos-tabs" role="tablist" aria-label="Separación de préstamos"> {/* Contenedor de pestañas para separar préstamos. */}
          <button // Botón para ver únicamente préstamos pendientes.
            type="button" // Evita envío accidental de formulario.
            role="tab" // Rol semántico de pestaña.
            aria-selected={vistaEstado === "pendiente"} // Indica accesibilidad si está activa la pestaña pendiente.
            className={ // Clase dinámica para resaltar la pestaña activa.
              vistaEstado === "pendiente"
                ? "prestamo-tab activa"
                : "prestamo-tab"
            }
            onClick={() => setVistaEstado("pendiente")} // Cambia la vista a préstamos pendientes.
          >
            Pendientes ({prestamosPendientes.length})
          </button>

          <button // Botón para ver únicamente préstamos devueltos.
            type="button" // Evita envío accidental de formulario.
            role="tab" // Rol semántico de pestaña.
            aria-selected={vistaEstado === "devuelto"} // Indica accesibilidad si está activa la pestaña devuelto.
            className={ // Clase dinámica para resaltar la pestaña activa.
              vistaEstado === "devuelto"
                ? "prestamo-tab activa"
                : "prestamo-tab"
            }
            onClick={() => setVistaEstado("devuelto")} // Cambia la vista a préstamos devueltos.
          >
            Devueltos ({prestamosDevueltos.length})
          </button>
        </div>

        {prestamosMostrados.length === 0 ? ( // Si el grupo seleccionado ("pendiente" o "devuelto") no tiene registros...
          <p className="prestamos-vacio">
            {vistaEstado === "pendiente"
              ? "No tienes préstamos pendientes."
              : "No tienes préstamos devueltos."}
          </p>
        ) : ( // Si sí hay préstamos en el grupo seleccionado...
          <div className="prestamos-grid"> {/* Grilla de tarjetas de préstamos. */}
            {prestamosMostrados.map((prestamo) => ( // Recorre únicamente los préstamos del grupo activo.
              <div // Tarjeta individual de préstamo.
                key={prestamo.id_prestamo} // Identificador único para React.
                className="prestamo-item" // Clase de estilo de tarjeta.
              >
                <p>
                  <strong>Material:</strong>{" "}
                  {prestamo.nombre_material}
                </p>

                <p>
                  <strong>Cantidad:</strong>{" "}
                  {prestamo.cantidad}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  {prestamo.estado}
                </p>

                {prestamo.estado === "pendiente" && ( // Solo muestra el botón "Devolver" si el préstamo sigue pendiente.
                  <button // Botón para iniciar el proceso de devolución.
                    className="btn btn-primary" // Estilo principal del botón.
                    onClick={() =>
                      setPrestamoADevolver(prestamo.id_prestamo) // Abre el modal de confirmación para este préstamo.
                    }
                  >
                    Devolver
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Devoluciones; // Exporta el componente Devoluciones.