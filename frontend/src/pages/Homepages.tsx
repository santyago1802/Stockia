
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import "../styles/dashboard.css";
import "../styles/prestamos.css";

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
  const navigate = useNavigate();

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario de reposición
  const [materialReponer, setMaterialReponer] =
    useState<Material | null>(null);
  const [cantidadReposicion, setCantidadReposicion] = useState(1);
  const [observacion, setObservacion] = useState("");
  const [guardandoReposicion, setGuardandoReposicion] =
    useState(false);

  // Mensajes
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState<"exito" | "error">("exito");

  // Mostrar inicialmente 6 préstamos
  const [limitePendientes, setLimitePendientes] = useState(6);
  const [limiteDevueltos, setLimiteDevueltos] = useState(6);

  // Obtener materiales y préstamos
  const obtenerDatos = async () => {
    try {
      const token = localStorage.getItem("token");

      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuestaMateriales.ok) {
        throw new Error("No se pudieron consultar los materiales");
      }

      const datosMateriales = await respuestaMateriales.json();
      setMateriales(datosMateriales);

      const respuestaPrestamos = await fetch(
        "http://localhost:3000/api/prestamos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuestaPrestamos.ok) {
        throw new Error("No se pudieron consultar los préstamos");
      }

      const datosPrestamos = await respuestaPrestamos.json();
      setPrestamos(datosPrestamos);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setMensaje("No se pudieron cargar los datos del resumen.");
      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  // Registrar entrada de inventario
  const registrarReposicion = async () => {
    if (!materialReponer) return;

    if (
      !Number.isInteger(cantidadReposicion) ||
      cantidadReposicion <= 0
    ) {
      setMensaje("Ingresa una cantidad válida mayor que cero.");
      setTipoMensaje("error");
      return;
    }

    try {
      setGuardandoReposicion(true);

      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/movimientos/entrada",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_material: materialReponer.id_material,
            cantidad: cantidadReposicion,
            observacion: observacion.trim(),
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo registrar la reposición"
        );
      }

      setMaterialReponer(null);
      setCantidadReposicion(1);
      setObservacion("");

      await obtenerDatos();

      setMensaje(
        "Entrada registrada correctamente. El inventario fue actualizado."
      );
      setTipoMensaje("exito");
    } catch (error) {
      console.error("Error al reponer material:", error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la reposición."
      );

      setTipoMensaje("error");
    } finally {
      setGuardandoReposicion(false);
    }
  };

  if (cargando) {
    return (
      <div>
        <Navbar />
        <p>Cargando resumen de inventario...</p>
      </div>
    );
  }

  // Materiales con stock bajo o en el límite mínimo
  const materialesConStockBajo = materiales.filter(
    (material) =>
      material.stock_actual <= material.stock_minimo
  );

  // Separar préstamos pendientes
  const prestamosPendientes = prestamos
    .filter(
      (prestamo) =>
        prestamo.estado?.toLowerCase().trim() === "pendiente"
    )
    .sort(
      (a, b) =>
        new Date(b.fecha_prestamo).getTime() -
        new Date(a.fecha_prestamo).getTime()
    );

  // Separar préstamos devueltos
  const prestamosDevueltos = prestamos
    .filter(
      (prestamo) =>
        prestamo.estado?.toLowerCase().trim() === "devuelto"
    )
    .sort(
      (a, b) =>
        new Date(b.fecha_prestamo).getTime() -
        new Date(a.fecha_prestamo).getTime()
    );

  // Cantidad de préstamos pendientes que se están mostrando
  const pendientesMostrados = Math.min(
    limitePendientes,
    prestamosPendientes.length
  );

  const pendientesRestantes =
    prestamosPendientes.length - pendientesMostrados;

  return (
    <div>
      <Navbar />

      <main className="products-section dashboard-section">

        {/* ENCABEZADO */}
        <div className="dashboard-encabezado">
          <div>
            <p className="dashboard-saludo">
              ¡Bienvenido, Coordinador!
            </p>

            <h1>Resumen de inventario</h1>
          </div>

          <button
            type="button"
            className="btn-registrar-movimiento"
            onClick={() => navigate("/movimientos")}
          >
            + Registrar movimiento
          </button>
        </div>

        {/* ALERTAS DE STOCK */}
        <section className="dashboard-alertas">
          <div className="dashboard-seccion-titulo">
            <h2>
              <span className="icono-alerta-titulo">⚠</span>
              Alertas de stock
            </h2>

            <span className="contador-alertas">
              {materialesConStockBajo.length}
            </span>
          </div>

          {materialesConStockBajo.length === 0 ? (
            <p className="dashboard-vacio">
              No hay materiales con stock bajo.
            </p>
          ) : (
            <div className="alertas-grid">
              {materialesConStockBajo.map((material) => {
                const enLimite =
                  material.stock_actual === material.stock_minimo;

                return (
                  <div
                    key={material.id_material}
                    className="alerta-item"
                  >
                    <div className="alerta-encabezado">
                      <span className="alerta-icono">⚠️</span>

                      <span className="alerta-estado bajo">
                        Stock bajo
                      </span>
                    </div>

                    <h3>{material.nombre_material}</h3>

                    <div className="alerta-datos">
                      <p>
                        <strong>Stock actual</strong>
                        <span>{material.stock_actual}</span>
                      </p>

                      <p>
                        <strong>Stock mínimo</strong>
                        <span>{material.stock_minimo}</span>
                      </p>
                    </div>

                    <div className="alerta-pie">
                      <p className="alerta-mensaje">
                        {enLimite
                          ? "En el límite mínimo"
                          : "Stock bajo"}
                      </p>

                      <button
                        type="button"
                        className="btn-reponer"
                        onClick={() => {
                          setMaterialReponer(material);
                          setCantidadReposicion(1);
                          setObservacion("");
                        }}
                      >
                        Reponer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PRÉSTAMOS PENDIENTES */}
        <section className="dashboard-prestamos">
          <div className="dashboard-seccion-titulo">
            <h2 className="titulo-prestamos">
              <svg
                className="icono-prestamos"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#087343"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="4" width="14" height="18" rx="2" />
                <path d="M9 4.5V3h6v1.5" />
                <path d="M9 10h6M9 14h6M9 18h6" />
              </svg>

              <span>
                Préstamos pendientes ({prestamosPendientes.length})
              </span>
            </h2>

            <button
              type="button"
              className="btn-ver-todos"
              onClick={() => navigate("/devoluciones")}
            >
              Ver todos →
            </button>
          </div>

          {prestamosPendientes.length === 0 ? (
            <p className="dashboard-vacio">
              No hay préstamos pendientes.
            </p>
          ) : (
            <>
              <div className="prestamos-grid">
                {prestamosPendientes
                  .slice(0, limitePendientes)
                  .map((prestamo) => (
                    <div
                      key={prestamo.id_prestamo}
                      className="prestamo-item"
                    >
                      <div className="prestamo-encabezado">
                        <div className="prestamo-icono">
                          {prestamo.nombre_usuario
                            ?.trim()
                            .charAt(0)
                            .toUpperCase() || "?"}
                        </div>

                        <span className="prestamo-estado pendiente">
                          <span className="estado-punto"></span>
                          {prestamo.estado}
                        </span>
                      </div>

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
                        <strong>Fecha:</strong>{" "}
                        {new Date(
                          prestamo.fecha_prestamo
                        ).toLocaleDateString("es-CO")}
                      </p>

                      <button
                        type="button"
                        className="btn-ver-detalle"
                        onClick={() => navigate("/devoluciones")}
                      >
                        Ver detalle
                      </button>
                    </div>
                  ))}
              </div>

              {/* INFORMACIÓN Y CARGA DE PRÉSTAMOS PENDIENTES */}
              <div className="dashboard-pendientes-info">
                <span>
                  Mostrando {pendientesMostrados} de{" "}
                  {prestamosPendientes.length} préstamos pendientes
                </span>

                {pendientesRestantes > 0 && (
                  <button
                    type="button"
                    className="btn-cargar-mas"
                    onClick={() =>
                      setLimitePendientes((actual) =>
                        Math.min(
                          actual + 5,
                          prestamosPendientes.length
                        )
                      )
                    }
                  >
                    Cargar los {pendientesRestantes} restantes
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* PRÉSTAMOS DEVUELTOS */}
        <section className="dashboard-prestamos">
          <div className="dashboard-seccion-titulo">
            <h2>
              Préstamos devueltos ({prestamosDevueltos.length})
            </h2>

            <button
              type="button"
              className="btn-ver-todos"
              onClick={() => navigate("/devoluciones")}
            >
              Ver todos →
            </button>
          </div>

          {prestamosDevueltos.length === 0 ? (
            <p className="dashboard-vacio">
              No hay préstamos devueltos.
            </p>
          ) : (
            <>
              <div className="prestamos-grid">
                {prestamosDevueltos
                  .slice(0, limiteDevueltos)
                  .map((prestamo) => (
                    <div
                      key={prestamo.id_prestamo}
                      className="prestamo-item"
                    >
                      <div className="prestamo-encabezado">
                        <span className="prestamo-icono">📦</span>

                        <span className="prestamo-estado devuelto">
                          <span className="estado-punto"></span>
                          Devuelto
                        </span>
                      </div>

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
                        <strong>Fecha:</strong>{" "}
                        {new Date(
                          prestamo.fecha_prestamo
                        ).toLocaleDateString("es-CO")}
                      </p>

                      <span className="prestamo-devolucion-confirmada">
                        ✓ Devolución registrada
                      </span>
                    </div>
                  ))}
              </div>

              {limiteDevueltos < prestamosDevueltos.length && (
                <button
                  type="button"
                  className="btn-cargar-mas"
                  onClick={() =>
                    setLimiteDevueltos((actual) =>
                      Math.min(
                        actual + 5,
                        prestamosDevueltos.length
                      )
                    )
                  }
                >
                  Cargar los{" "}
                  {prestamosDevueltos.length -
                    Math.min(
                      limiteDevueltos,
                      prestamosDevueltos.length
                    )}{" "}
                  restantes
                </button>
              )}
            </>
          )}
        </section>

        {/* PIE DE PÁGINA */}
        <footer className="dashboard-footer">
          <span>
            Stockia · Sistema de Almacén Técnico SENA
          </span>

          <span>
            Acceso autorizado para administrativo e instructores
          </span>
        </footer>

      </main>

      {/* FORMULARIO DE REPOSICIÓN */}
      {materialReponer && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal">
            <button
              type="button"
              className="dashboard-modal-cerrar"
              onClick={() => setMaterialReponer(null)}
              disabled={guardandoReposicion}
            >
              ×
            </button>

            <span className="modal-icono-reponer">📦</span>

            <h2>Reponer material</h2>

            <p className="modal-material-nombre">
              {materialReponer.nombre_material}
            </p>

            <div className="modal-stock-actual">
              <span>Stock actual</span>
              <strong>{materialReponer.stock_actual}</strong>
            </div>

            <label htmlFor="cantidad-reposicion">
              Cantidad que deseas ingresar
            </label>

            <input
              id="cantidad-reposicion"
              type="number"
              min="1"
              step="1"
              value={cantidadReposicion}
              onChange={(event) =>
                setCantidadReposicion(Number(event.target.value))
              }
            />

            <label htmlFor="observacion-reposicion">
              Observación (opcional)
            </label>

            <textarea
              id="observacion-reposicion"
              rows={3}
              maxLength={500}
              placeholder="Ej. Reposición de materiales..."
              value={observacion}
              onChange={(event) =>
                setObservacion(event.target.value)
              }
            />

            <div className="modal-stock-final">
              <span>Stock después de la entrada</span>

              <strong>
                {materialReponer.stock_actual +
                  (Number.isInteger(cantidadReposicion) &&
                  cantidadReposicion > 0
                    ? cantidadReposicion
                    : 0)}
              </strong>
            </div>

            <div className="modal-botones">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={() => setMaterialReponer(null)}
                disabled={guardandoReposicion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-modal-confirmar"
                onClick={registrarReposicion}
                disabled={guardandoReposicion}
              >
                {guardandoReposicion
                  ? "Registrando..."
                  : "Registrar entrada"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE DE RESULTADO */}
      {mensaje && (
        <div className="dashboard-modal-overlay">
          <div className={`dashboard-mensaje ${tipoMensaje}`}>
            <h2>
              {tipoMensaje === "exito" ? "✓ ¡Listo!" : "⚠️ Atención"}
            </h2>

            <p>{mensaje}</p>

            <button
              type="button"
              onClick={() => setMensaje("")}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepages;
