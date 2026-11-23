
import { useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import "../styles/prestamos.css";
import "../styles/modales.css";

export type EstadoPrestamo = "pendiente" | "devuelto";

interface Prestamo {
  id_prestamo: number;
  id_usuario: number;
  nombre_usuario: string;
  fecha_prestamo: string;
  estado: EstadoPrestamo | string;
  id_material: number;
  nombre_material: string;
  cantidad: number;
}

interface UsuarioLocal {
  id_usuario: number;
}

function Devoluciones() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  const [vistaEstado, setVistaEstado] =
    useState<EstadoPrestamo>("pendiente");

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState<"exito" | "error">("exito");

  const [prestamoADevolver, setPrestamoADevolver] =
    useState<number | null>(null);

  // Obtener préstamos del instructor
  const obtenerPrestamos = async () => {
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/prestamos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los préstamos");
      }

      const datos: Prestamo[] = await respuesta.json();

      const usuarioGuardado = localStorage.getItem("usuario");

      if (!usuarioGuardado) {
        return;
      }

      const usuario: UsuarioLocal = JSON.parse(usuarioGuardado);

      const misPrestamos = datos.filter(
        (prestamo) =>
          prestamo.id_usuario === usuario.id_usuario
      );

      setPrestamos(misPrestamos);
    } catch (error) {
      console.error("Error al obtener préstamos:", error);

      setMensaje("No se pudieron cargar tus devoluciones.");
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPrestamos();
  }, []);

  // Registrar devolución
  const devolverPrestamo = async (idPrestamo: number) => {
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `http://localhost:3000/api/prestamos/${idPrestamo}/devolver`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(
          datos.mensaje || "No se pudo registrar la devolución"
        );
        setTipoMensaje("error");
        return;
      }

      setMensaje("Préstamo devuelto correctamente");
      setTipoMensaje("exito");

      await obtenerPrestamos();
    } catch (error) {
      console.error("Error al devolver préstamo:", error);

      setMensaje("No se pudo devolver el préstamo");
      setTipoMensaje("error");
    }
  };

  // Separar préstamos por estado
  const prestamosPendientes = prestamos.filter(
    (prestamo) => prestamo.estado === "pendiente"
  );

  const prestamosDevueltos = prestamos.filter(
    (prestamo) => prestamo.estado === "devuelto"
  );

  const prestamosMostrados =
    vistaEstado === "pendiente"
      ? prestamosPendientes
      : prestamosDevueltos;

  // Buscar por material o identificador
  const prestamosFiltrados = prestamosMostrados.filter(
    (prestamo) => {
      const termino = busqueda.toLowerCase().trim();

      if (!termino) return true;

      return (
        prestamo.nombre_material.toLowerCase().includes(termino) ||
        String(prestamo.id_prestamo).includes(termino) ||
        String(prestamo.id_material).includes(termino)
      );
    }
  );

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No disponible";

    const fechaLocal = new Date(fecha);

    if (isNaN(fechaLocal.getTime())) {
      return fecha;
    }

    return fechaLocal.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="pagina-con-footer devoluciones-page">
      <Navbar />

      <main className="products-section devoluciones-contenido">

        {/* MODAL DE CONFIRMACIÓN */}
        {prestamoADevolver !== null && (
          <div className="mensaje-overlay">
            <div className="mensaje-box">
              <h2>Confirmar devolución</h2>

              <p>
                ¿Estás seguro de que quieres devolver este préstamo?
              </p>

              <div className="botones-confirmacion">
                <button
                  className="btn-confirmar"
                  onClick={() => {
                    const id = prestamoADevolver;
                    setPrestamoADevolver(null);
                    devolverPrestamo(id);
                  }}
                >
                  Confirmar
                </button>

                <button
                  className="btn-cancelar"
                  onClick={() => setPrestamoADevolver(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MENSAJES */}
        {mensaje && (
          <div className="mensaje-overlay">
            <div className={`mensaje-box ${tipoMensaje}`}>
              <h2>
                {tipoMensaje === "exito" ? "✓ ¡Listo!" : "⚠ Error"}
              </h2>

              <p>{mensaje}</p>

              <button
                onClick={() => setMensaje("")}
                className="btn-mensaje"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {/* ENCABEZADO */}
        <div className="devoluciones-encabezado">
          <div>
            <h1>Mis devoluciones</h1>

            <p>
              Gestiona los materiales asignados y registra su
              reintegro al almacén.
            </p>
          </div>
        </div>

        {/* CONTROLES */}
        <div className="devoluciones-controles">

          <div
            className="prestamos-tabs"
            role="tablist"
            aria-label="Separación de préstamos"
          >
            <button
              type="button"
              role="tab"
              aria-selected={vistaEstado === "pendiente"}
              className={
                vistaEstado === "pendiente"
                  ? "prestamo-tab activa"
                  : "prestamo-tab"
              }
              onClick={() => setVistaEstado("pendiente")}
            >
              Pendientes ({prestamosPendientes.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={vistaEstado === "devuelto"}
              className={
                vistaEstado === "devuelto"
                  ? "prestamo-tab activa"
                  : "prestamo-tab"
              }
              onClick={() => setVistaEstado("devuelto")}
            >
              Devueltos ({prestamosDevueltos.length})
            </button>
          </div>

          {/* BUSCADOR */}
          <div className="devoluciones-buscador">
            <span className="buscador-icono">⌕</span>

            <input
              type="text"
              placeholder="Buscar material o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar material o identificador"
            />
          </div>
        </div>

        {/* CONTENIDO */}
        {cargando ? (
          <p className="prestamos-vacio">
            Cargando devoluciones...
          </p>
        ) : prestamosFiltrados.length === 0 ? (
          <p className="prestamos-vacio">
            {busqueda
              ? "No se encontraron préstamos con esa búsqueda."
              : vistaEstado === "pendiente"
                ? "No tienes préstamos pendientes."
                : "No tienes préstamos devueltos."}
          </p>
        ) : (
          <div className="prestamos-grid">
            {prestamosFiltrados.map((prestamo) => (
              <article
                key={prestamo.id_prestamo}
                className="prestamo-item"
              >
                <div className="prestamo-card-encabezado">
                  <span className="prestamo-identificador">
                    PRÉSTAMO #{prestamo.id_prestamo}
                  </span>

                  <span
                    className={`prestamo-badge ${
                      prestamo.estado === "devuelto"
                        ? "badge-devuelto"
                        : "badge-pendiente"
                    }`}
                  >
                    <span className="badge-punto"></span>

                    {prestamo.estado === "devuelto"
                      ? "Devuelto"
                      : "Pendiente"}
                  </span>
                </div>

                <h3 className="prestamo-material-nombre">
                  {prestamo.nombre_material}
                </h3>

                <div className="prestamo-card-detalles">
                  <div>
                    <span className="detalle-label">
                      Cantidad
                    </span>

                    <strong>
                      {prestamo.cantidad}{" "}
                      {prestamo.cantidad === 1
                        ? "unidad"
                        : "unidades"}
                    </strong>
                  </div>

                  <div>
                    <span className="detalle-label">
                      Préstamo
                    </span>

                    <strong>
                      {formatearFecha(prestamo.fecha_prestamo)}
                    </strong>
                  </div>
                </div>

                <div className="prestamo-card-footer">
                  {prestamo.estado === "pendiente" ? (
                    <button
                      type="button"
                      className="btn-devolver-card"
                      onClick={() =>
                        setPrestamoADevolver(prestamo.id_prestamo)
                      }
                    >
                      <span>↪</span> Devolver
                    </button>
                  ) : (
                    <span className="prestamo-devuelto-texto">
                      Devolución registrada
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Devoluciones;
