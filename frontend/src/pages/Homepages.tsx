import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";

interface Material {
  id_material: number;
  nombre_material: string;
  descripcion_material: string;
  stock_actual: number;
  stock_minimo: number;
}

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

function Homepages() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);

  const obtenerDatos = async () => {
    try {
      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales"
      );

      const datosMateriales = await respuestaMateriales.json();

      setMateriales(datosMateriales);

      const respuestaPrestamos = await fetch(
        "http://localhost:3000/api/prestamos"
      );

      const datosPrestamos = await respuestaPrestamos.json();

      setPrestamos(datosPrestamos);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  if (cargando) {
    return <p>Cargando Resumen de inventario...</p>;
  }

  const materialesConStockBajo = materiales.filter(
    (material) => material.stock_actual <= material.stock_minimo
  );

  return (
    <div>
      <Navbar />

      <main className="products-section">
        <h1>Resumen de inventario</h1>

        <h2>⚠️ Alertas de stock</h2>

        {materialesConStockBajo.length === 0 ? (
          <p>No hay materiales con stock bajo.</p>
        ) : (
          <div className="alertas-grid">
            {materialesConStockBajo.map((material) => (
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
            ))}
          </div>
        )}

        <h2> Préstamos realizados</h2>

        {prestamos.length === 0 ? (
          <p>No hay préstamos registrados.</p>
        ) : (
          <div className="prestamos-grid">
            {prestamos.map((prestamo) => (
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Homepages;