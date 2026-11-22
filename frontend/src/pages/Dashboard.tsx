import { useEffect, useState } from "react"; // Importa hooks de React para efectos y estado.
import Navbar from "../components/layout/Navbar"; // Importa la barra de navegación superior.
import { exportarAExcel } from "../utils/exportacion_excel"; // Reutiliza la función genérica para exportar .xlsx.

interface Prestamo { // Estructura de cada préstamo devuelto por /api/prestamos.
  id_prestamo: number; // ID único del préstamo.
  id_usuario: number; // ID del usuario que solicitó el préstamo.
  nombre_usuario: string; // Nombre del usuario asociado.
  fecha_prestamo: string; // Fecha de registro del préstamo.
  estado: string; // Estado del préstamo (ej. "pendiente", "devuelto").
  id_material: number; // ID del material prestado.
  nombre_material: string; // Nombre del material prestado.
  cantidad: number; // Cantidad de unidades prestadas.
}

interface Material { // Estructura de cada material devuelto por /api/materiales.
  id_material: number; // ID único del material.
  nombre_material: string; // Nombre del material.
  descripcion_material: string; // Descripción del material.
  stock_actual: number; // Unidades disponibles actualmente.
  stock_minimo: number; // Stock mínimo requerido.
}

function Dashboard() { // Componente principal del panel / dashboard.
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]); // Lista de préstamos consultados.
  const [cargando, setCargando] = useState(true); // Indica si los datos iniciales están cargando.
  const [materiales, setMateriales] = useState<Material[]>([]); // Lista de materiales consultados.

  const obtenerPrestamos = async () => { // Consulta préstamos y materiales desde el backend.
    try {
      const respuesta = await fetch( // Petición GET de préstamos.
        "http://localhost:3000/api/prestamos"
      );

      const datos = await respuesta.json(); // Parsea préstamos.
      setPrestamos(datos); // Guarda préstamos en estado.

      const respuestaMateriales = await fetch( // Petición GET de materiales.
        "http://localhost:3000/api/materiales"
      );
      const datosMateriales = await respuestaMateriales.json(); // Parsea materiales.
      setMateriales(datosMateriales); // Guarda materiales en estado.
    } catch (error) {
      console.error("Error al obtener préstamos:", error); // Registra error en consola.
    } finally {
      setCargando(false); // Finaliza la carga inicial.
    }
  };

  useEffect(() => { // Ejecuta la carga inicial al montar el componente.
    obtenerPrestamos();
  }, []);

  const devolverPrestamo = async (idPrestamo: number) => { // Marca un préstamo como devuelto.
    try {
      const respuesta = await fetch( // Petición PUT para devolver préstamo.
        `http://localhost:3000/api/prestamos/${idPrestamo}/devolver`,
        {
          method: "PUT",
        }
      );

      const datos = await respuesta.json(); // Lee respuesta del servidor.

      if (!respuesta.ok) {
        alert(datos.mensaje); // Muestra mensaje de error si falla.
        return;
      }

      alert("Préstamo devuelto correctamente"); // Confirma devolución.
      obtenerPrestamos(); // Refresca préstamos y stock de materiales.
    } catch (error) {
      console.error("Error al devolver préstamo:", error);
      alert("No se pudo devolver el préstamo");
    }
  };

  const alertasStock = materiales.filter( // Filtra materiales con stock igual o menor al mínimo.
    (material) => material.stock_actual <= material.stock_minimo
  );

  const prestamosPendientes = prestamos.filter( // Filtra únicamente los préstamos en estado "pendiente".
    (prestamo) => prestamo.estado === "pendiente"
  );

  const handleExportarAlertasStock = () => { // Exporta las alertas de stock consultadas a Excel.
    if (alertasStock.length === 0) { // Evita descargar un archivo vacío si no hay alertas.
      alert("No hay alertas de stock para exportar.");
      return;
    }

    const filas = alertasStock.map((material) => ({ // Formatea las columnas para la hoja de Excel.
      ID: material.id_material,
      Material: material.nombre_material,
      Descripción: material.descripcion_material,
      "Stock actual": material.stock_actual,
      "Stock mínimo": material.stock_minimo,
      Estado: material.stock_actual === 0 ? "Agotado" : "Stock bajo",
    }));

    exportarAExcel(filas, "stockia_alertas_stock", "Alertas de stock"); // Descarga stockia_alertas_stock.xlsx.
  };

  const handleExportarPrestamosPendientes = () => { // Exporta los préstamos pendientes consultados a Excel[cite: 3].
    if (prestamosPendientes.length === 0) { // Evita descargar un archivo vacío si no hay pendientes.
      alert("No hay préstamos pendientes para exportar.");
      return;
    }

    const filas = prestamosPendientes.map((prestamo) => ({ // Formatea las columnas para el Excel.
      ID: prestamo.id_prestamo,
      Usuario: prestamo.nombre_usuario,
      Material: prestamo.nombre_material,
      Cantidad: prestamo.cantidad,
      Estado: prestamo.estado,
      "Fecha préstamo": prestamo.fecha_prestamo,
    }));

    exportarAExcel( // Genera y descarga stockia_prestamos_pendientes_dashboard.xlsx.
      filas,
      "stockia_prestamos_pendientes_dashboard",
      "Préstamos pendientes"
    );
  };

  if (cargando) { // Muestra mensaje mientras se cargan los datos.
    return <p>Cargando préstamos...</p>;
  }

  return (
    <div>
      <Navbar /> {/* Barra de navegación superior. */}

      <main className="products-section"> {/* Contenedor principal del panel. */}
        <h1>Devoluciones</h1> {/* Título principal. */}

        <h2>⚠️ Alertas de stock</h2> {/* Subtítulo de alertas de stock. */}

        <div style={{ marginBottom: "12px" }}> {/* Contenedor para acción de exportar alertas. */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportarAlertasStock}
          >
            Exportar alertas a Excel
          </button>
        </div>

        <div className="alertas-grid"> {/* Grilla de materiales con stock bajo o agotado. */}
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

        <h2>Préstamos pendientes</h2> {/* Subtítulo de préstamos pendientes. */}

        <div style={{ marginBottom: "12px" }}> {/* Contenedor para acción de exportar préstamos pendientes. */}
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
          <div className="prestamos-grid"> {/* Grilla de préstamos pendientes. */}
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