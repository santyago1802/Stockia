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
        alert(datos.mensaje);
        return;
      }

      alert("Préstamo devuelto correctamente");

      obtenerPrestamos();
    } catch (error) {
      console.error("Error al devolver préstamo:", error);
      alert("No se pudo devolver el préstamo");
    }
  };

  if (cargando) {
    return <p>Cargando devoluciones...</p>;
  }

  return (
    <div>
      <Navbar />

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
                    devolverPrestamo(prestamo.id_prestamo)
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