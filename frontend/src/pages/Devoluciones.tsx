import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";

interface Prestamo {
  id_prestamo: number;
  id_usuario: number;
  nombre_usuario: string;
  fecha_prestamo: string;
  estado: string;
  id_material: number;
  nombre_material: string;
  cantidad: number;
}

function Devoluciones() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error">("exito");
  const [prestamoADevolver, setPrestamoADevolver] = useState<number | null>(null);

  const obtenerPrestamos = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/prestamos"
      );

      const datos = await respuesta.json();

      const usuarioGuardado = localStorage.getItem("usuario");

      if (!usuarioGuardado) {
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);

      const misPrestamos = datos.filter(
        (prestamo: Prestamo) =>
          prestamo.id_usuario === usuario.id_usuario &&
          prestamo.estado === "pendiente"
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
      const respuesta = await fetch(
        `http://localhost:3000/api/prestamos/${idPrestamo}/devolver`,
        {
          method: "PUT",
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje);
        setTipoMensaje("error");
        return;
      }

      setMensaje("Préstamo devuelto correctamente");
      setTipoMensaje("exito");

      obtenerPrestamos();
    } catch (error) {
      console.error("Error al devolver préstamo:", error);
      setMensaje("No se pudo devolver el préstamo");
      setTipoMensaje("error");
    }
  };

  if (cargando) {
    return <p>Cargando devoluciones...</p>;
  }

  return (
    <div>
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
        <h1>Mis devoluciones</h1>

        {prestamos.length === 0 ? (
          <p>No tienes préstamos pendientes.</p>
        ) : (
          <div className="prestamos-grid">
            {prestamos.map((prestamo) => (
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

                <button
                  className="btn btn-primary"
                  onClick={() =>
                  setPrestamoADevolver(prestamo.id_prestamo)
                  }
                >
                  Devolver
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Devoluciones;