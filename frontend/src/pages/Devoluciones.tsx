
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { exportarAExcel } from "../utils/exportacion_excel";
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
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState<"exito" | "error">("exito");
  const [prestamoADevolver, setPrestamoADevolver] =
    useState<number | null>(null);

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
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPrestamos();
  }, []);

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
        setMensaje(datos.mensaje || "No se pudo registrar la devolución");
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

  const handleExportarExcel = () => {
    if (prestamosMostrados.length === 0) {
      setMensaje(
        vistaEstado === "pendiente"
          ? "No hay préstamos pendientes para exportar."
          : "No hay préstamos devueltos para exportar."
      );
      setTipoMensaje("error");
      return;
    }

    const filasExcel = prestamosMostrados.map((prestamo) => ({
      ID: prestamo.id_prestamo,
      Material: prestamo.nombre_material,
      Cantidad: prestamo.cantidad,
      Estado: prestamo.estado,
      "Fecha préstamo": prestamo.fecha_prestamo,
      Usuario: prestamo.nombre_usuario,
    }));

    const etiquetaEstado =
      vistaEstado === "pendiente" ? "pendientes" : "devueltos";

    exportarAExcel(
      filasExcel,
      `stockia_prestamos_${etiquetaEstado}`,
      vistaEstado === "pendiente"
        ? "Préstamos pendientes"
        : "Préstamos devueltos"
    );
  };

  if (cargando) {
    return <p>Cargando devoluciones...</p>;
  }

  return (
    <div className="pagina-con-footer">
      <Navbar />

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
                  devolverPrestamo(prestamoADevolver);
                  setPrestamoADevolver(null);
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

      {mensaje && (
        <div className="mensaje-overlay">
          <div className={`mensaje-box ${tipoMensaje}`}>
            <h2>
              {tipoMensaje === "exito" ? "✓ ¡Listo!" : "⚠️ Error"}
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

      <main className="products-section">
        <div className="prestamos-encabezado">
          <h1>Mis devoluciones</h1>

          <button
            type="button"
            className="btn-exportar-prestamos"
            onClick={handleExportarExcel}
          >
            Exportar a Excel
          </button>
        </div>

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

        {prestamosMostrados.length === 0 ? (
          <p className="prestamos-vacio">
            {vistaEstado === "pendiente"
              ? "No tienes préstamos pendientes."
              : "No tienes préstamos devueltos."}
          </p>
        ) : (
          <div className="prestamos-grid">
            {prestamosMostrados.map((prestamo) => (
              <div
                key={prestamo.id_prestamo}
                className="prestamo-item"
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

                {prestamo.estado === "pendiente" && (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      setPrestamoADevolver(prestamo.id_prestamo)
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

      <Footer />
    </div>
  );
}

export default Devoluciones;
