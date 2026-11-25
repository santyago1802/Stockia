
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { exportarAExcel } from "../utils/exportacion_excel";

// URL del backend según el entorno
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

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

function Dashboard() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [materiales, setMateriales] = useState<Material[]>([]);

  // Obtener préstamos y materiales
  const obtenerPrestamos = async () => {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const respuesta = await fetch(
        `${API_URL}/api/prestamos`,
        { headers }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los préstamos");
      }

      const datos = await respuesta.json();
      setPrestamos(datos);

      const respuestaMateriales = await fetch(
        `${API_URL}/api/materiales`,
        { headers }
      );

      if (!respuestaMateriales.ok) {
        throw new Error("No se pudieron cargar los materiales");
      }

      const datosMateriales = await respuestaMateriales.json();
      setMateriales(datosMateriales);
    } catch (error) {
      console.error("Error al obtener préstamos y materiales:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPrestamos();
  }, []);

  // Devolver préstamo
  const devolverPrestamo = async (idPrestamo: number) => {
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `${API_URL}/api/prestamos/${idPrestamo}/devolver`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.mensaje || "No se pudo devolver el préstamo");
        return;
      }

      alert("Préstamo devuelto correctamente");
      await obtenerPrestamos();
    } catch (error) {
      console.error("Error al devolver préstamo:", error);
      alert("No se pudo devolver el préstamo");
    }
  };

  // Materiales con stock bajo
  const alertasStock = materiales.filter(
    (material) => material.stock_actual <= material.stock_minimo
  );

  // Préstamos pendientes
  const prestamosPendientes = prestamos.filter(
    (prestamo) => prestamo.estado === "pendiente"
  );

  // Exportar alertas de stock
  const handleExportarAlertasStock = () => {
    if (alertasStock.length === 0) {
      alert("No hay alertas de stock para exportar.");
      return;
    }

    const filas = alertasStock.map((material) => ({
      ID: material.id_material,
      Material: material.nombre_material,
      Descripción: material.descripcion_material,
      "Stock actual": material.stock_actual,
      "Stock mínimo": material.stock_minimo,
      Estado: material.stock_actual === 0 ? "Agotado" : "Stock bajo",
    }));

    exportarAExcel(filas, "stockia_alertas_stock", "Alertas de stock");
  };

  // Exportar préstamos pendientes
  const handleExportarPrestamosPendientes = () => {
    if (prestamosPendientes.length === 0) {
      alert("No hay préstamos pendientes para exportar.");
      return;
    }

    const filas = prestamosPendientes.map((prestamo) => ({
      ID: prestamo.id_prestamo,
      Usuario: prestamo.nombre_usuario,
      Material: prestamo.nombre_material,
      Cantidad: prestamo.cantidad,
      Estado: prestamo.estado,
      "Fecha préstamo": prestamo.fecha_prestamo,
    }));

    exportarAExcel(
      filas,
      "stockia_prestamos_pendientes_dashboard",
      "Préstamos pendientes"
    );
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

        <div style={{ marginBottom: "12px" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportarAlertasStock}
          >
            Exportar alertas a Excel
          </button>
        </div>

        <div className="alertas-grid">
          {alertasStock.length === 0 ? (
            <p>No hay materiales con stock bajo.</p>
          ) : (
            alertasStock.map((material) => (
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

        <div style={{ marginBottom: "12px" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportarPrestamosPendientes}
          >
            Exportar pendientes a Excel
          </button>
        </div>

        {prestamosPendientes.length === 0 ? (
          <p>No hay préstamos pendientes.</p>
        ) : (
          <div className="prestamos-grid">
            {prestamosPendientes.map((prestamo) => (
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
