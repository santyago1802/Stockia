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

interface Material {
  id_material: number;
  nombre_material: string;
  descripcion_material: string;
  stock_actual: number;
  stock_minimo: number;
}

function Devoluciones() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [materiales, setMateriales] = useState<Material[]>([]);

  const obtenerPrestamos = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/prestamos"
      );

      const datos = await respuesta.json();

      setPrestamos(datos);
      const respuestaMateriales = await fetch(
      "http://localhost:3000/api/materiales"
);
const datosMateriales = await respuestaMateriales.json();

setMateriales(datosMateriales);
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
    return <p>Cargando préstamos...</p>;
  }

  return (
    <div>
      <Navbar />

      <main className="products-section">
        <h1>Devoluciones</h1>

<h2>⚠️ Alertas de stock</h2>

<div className="alertas-grid">
  {materiales.filter(
    (material) => material.stock_actual <= material.stock_minimo
  ).length === 0 ? (
    <p>No hay materiales con stock bajo.</p>
  ) : (
    materiales
      .filter(
        (material) => material.stock_actual <= material.stock_minimo
      )
      .map((material) => (
        <div
          key={material.id_material}
          className="alerta-item"
        >
          <p>
            <strong>Material:</strong>{" "}
            {material.nombre_material}
          </p>

          <p>
            <strong>Stock actual:</strong>{" "}
            {material.stock_actual}
          </p>

          <p>
            <strong>Stock mínimo:</strong>{" "}
            {material.stock_minimo}
          </p>

          <p>⚠️ Stock bajo</p>
        </div>
      ))
  )}
</div>
        <h2>Préstamos pendientes</h2>

        {prestamos.filter(
          (prestamo) => prestamo.estado === "pendiente"
        ).length === 0 ? (
          <p>No hay préstamos pendientes.</p>
        ) : (
          <div className="prestamos-grid">
            {prestamos
              .filter(
                (prestamo) => prestamo.estado === "pendiente"
              )
              .map((prestamo) => (
                <div
                  key={prestamo.id_prestamo}
                  className="prestamo-item"
                >
                  <p>
                    <strong>Usuario:</strong>{" "}
                    {prestamo.nombre_usuario}
                  </p>

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

export default Dashboard;