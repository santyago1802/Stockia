
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { exportarAExcel } from "../utils/exportacion_excel";
import "../styles/movimientos.css";

interface Movimiento {
  id_movimiento: number;
  id_prestamo: number | null;
  cantidad: number;
  observacion: string | null;
  fecha_movimiento: string;
  id_material: number;
  nombre_material: string;
  id_usuario: number;
  nombre_usuario: string;
  tipo_movimiento: "entrada" | "salida";
  nombre_categoria: string;
}

interface Resumen {
  total_movimientos: number;
  total_entradas: number;
  total_salidas: number;
}

function Movimientos() {
  const fechaActual = new Date();

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [resumen, setResumen] = useState<Resumen>({
    total_movimientos: 0,
    total_entradas: 0,
    total_salidas: 0,
  });

  const [mes, setMes] = useState(
    String(fechaActual.getMonth() + 1)
  );
  const [anio, setAnio] = useState(
    String(fechaActual.getFullYear())
  );
  const [tipo, setTipo] = useState("todos");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Consultar movimientos según los filtros
  const obtenerMovimientos = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      const parametros = new URLSearchParams();

      if (mes) parametros.append("mes", mes);
      if (anio) parametros.append("anio", anio);
      if (tipo !== "todos") parametros.append("tipo", tipo);

      const respuesta = await fetch(
        `http://localhost:3000/api/movimientos?${parametros.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudieron consultar los movimientos"
        );
      }

      setMovimientos(datos.movimientos || []);

      setResumen({
        total_movimientos: Number(
          datos.resumen?.total_movimientos || 0
        ),
        total_entradas: Number(
          datos.resumen?.total_entradas || 0
        ),
        total_salidas: Number(
          datos.resumen?.total_salidas || 0
        ),
      });
    } catch (error) {
      console.error("Error al consultar movimientos:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al consultar los movimientos"
      );

      setMovimientos([]);

      setResumen({
        total_movimientos: 0,
        total_entradas: 0,
        total_salidas: 0,
      });
    } finally {
      setCargando(false);
    }
  };

  // Consultar nuevamente cuando cambien los filtros
  useEffect(() => {
    obtenerMovimientos();
  }, [mes, anio, tipo]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setMes("");
    setAnio("");
    setTipo("todos");
  };

  // Exportar resultados a Excel
  const exportarMovimientos = () => {
    if (movimientos.length === 0) {
      setError("No hay movimientos para exportar.");
      return;
    }

    const filasExcel = movimientos.map((movimiento) => ({
      ID: movimiento.id_movimiento,
      Fecha: new Date(
        movimiento.fecha_movimiento
      ).toLocaleString("es-CO"),
      Material: movimiento.nombre_material,
      Categoría: movimiento.nombre_categoria,
      Tipo: movimiento.tipo_movimiento,
      Cantidad: movimiento.cantidad,
      Usuario: movimiento.nombre_usuario,
      Observación:
        movimiento.observacion || "Sin observación",
      "ID préstamo": movimiento.id_prestamo ?? "No asociado",
    }));

    exportarAExcel(
      filasExcel,
      "stockia_movimientos",
      "Movimientos"
    );
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="movimientos-page pagina-con-footer">
      <Navbar />

      <main className="movimientos-contenedor">
        <div className="movimientos-encabezado">
          <div>
            <h1>Movimientos de inventario</h1>
            <p>
              Consulta las entradas y salidas de materiales de Stockia.
            </p>
          </div>

          <button
            type="button"
            className="movimientos-btn-exportar"
            onClick={exportarMovimientos}
            disabled={cargando || movimientos.length === 0}
          >
            Exportar a Excel
          </button>
        </div>

        {/* INDICADORES */}
        <section className="movimientos-resumen">
          <article className="movimiento-indicador">
            <span>Total de movimientos</span>
            <strong>{resumen.total_movimientos}</strong>
          </article>

          <article className="movimiento-indicador indicador-entrada">
            <span>Unidades de entrada</span>
            <strong>{resumen.total_entradas}</strong>
          </article>

          <article className="movimiento-indicador indicador-salida">
            <span>Unidades de salida</span>
            <strong>{resumen.total_salidas}</strong>
          </article>
        </section>

        {/* FILTROS */}
        <section className="movimientos-filtros">
          <h2>Consultar movimientos</h2>

          <div className="movimientos-filtros-grid">
            <div className="movimiento-filtro">
              <label htmlFor="filtro-mes">Mes</label>

              <select
                id="filtro-mes"
                value={mes}
                onChange={(event) => setMes(event.target.value)}
              >
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>

            <div className="movimiento-filtro">
              <label htmlFor="filtro-anio">Año</label>

              <select
                id="filtro-anio"
                value={anio}
                onChange={(event) => setAnio(event.target.value)}
              >
                <option value="">Todos los años</option>

                {Array.from(
                  { length: 7 },
                  (_, index) =>
                    fechaActual.getFullYear() - 5 + index
                ).map((valorAnio) => (
                  <option key={valorAnio} value={valorAnio}>
                    {valorAnio}
                  </option>
                ))}
              </select>
            </div>

            <div className="movimiento-filtro">
              <label htmlFor="filtro-tipo">
                Tipo de movimiento
              </label>

              <select
                id="filtro-tipo"
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="salida">Salidas</option>
              </select>
            </div>

            <button
              type="button"
              className="movimientos-btn-limpiar"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        {/* HISTORIAL */}
        <section className="movimientos-historial">
          <div className="movimientos-historial-encabezado">
            <h2>Historial de movimientos</h2>

            <span>
              {movimientos.length} registros encontrados
            </span>
          </div>

          {cargando ? (
            <p className="movimientos-estado">
              Cargando movimientos...
            </p>
          ) : error ? (
            <p className="movimientos-error">{error}</p>
          ) : movimientos.length === 0 ? (
            <p className="movimientos-estado">
              No se encontraron movimientos para los filtros seleccionados.
            </p>
          ) : (
            <div className="movimientos-tabla-contenedor">
              <table className="movimientos-tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Material</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                    <th>Observación</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id_movimiento}>
                      <td>{movimiento.id_movimiento}</td>

                      <td>
                        {formatearFecha(
                          movimiento.fecha_movimiento
                        )}
                      </td>

                      <td>{movimiento.nombre_material}</td>

                      <td>{movimiento.nombre_categoria}</td>

                      <td>
                        <span
                          className={`movimiento-tipo ${
                            movimiento.tipo_movimiento === "entrada"
                              ? "tipo-entrada"
                              : "tipo-salida"
                          }`}
                        >
                          {movimiento.tipo_movimiento}
                        </span>
                      </td>

                      <td>{movimiento.cantidad}</td>

                      <td>{movimiento.nombre_usuario}</td>

                      <td>
                        {movimiento.observacion || "Sin observación"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* PIE DE PÁGINA */}
      <Footer />
    </div>
  );
}

export default Movimientos;
