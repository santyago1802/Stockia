
import { useEffect, useState } from "react"; // Hooks de React para efectos secundarios y manejo de estado.
import Card from "../components/ui/Card"; // Componente de tarjeta reutilizable para cada material.
import Navbar from "../components/layout/Navbar"; // Barra de navegación superior.
import Footer from "../components/layout/Footer"; // Pie de página reutilizable.
import { exportarAExcel } from "../utils/exportacion_excel"; // Utilidad reutilizable para generar archivos .xlsx.
import "../styles/catalogo.css"; // Estilos del catálogo, filtros y grilla de materiales.
import "../styles/formularios.css"; // Estilos de formularios de registro, edición y solicitud.
import "../styles/modales.css"; // Estilos de modales de confirmación y mensajes.

interface Material {
  id_material: number;
  nombre_material: string;
  descripcion_material: string;
  id_categoria: number;
  nombre_categoria: string;
  stock_actual: number;
  stock_minimo: number;
}

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
}

function Productos() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<number | "todas">("todas");
  const [disponibilidad, setDisponibilidad] = useState("todas");
  const [estadoStock, setEstadoStock] = useState("todos");
  const [ordenamiento, setOrdenamiento] = useState("az");

  // Préstamos
  const [cantidad, setCantidad] = useState(1);
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(null);
  const [confirmarPrestamo, setConfirmarPrestamo] = useState(false);

  // Mensajes
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState<"exito" | "error">("exito");

  // Registro y edición
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [materialEditando, setMaterialEditando] =
    useState<Material | null>(null);

  // Categorías y proveedores
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Formulario de nuevo material
  const [nuevoMaterial, setNuevoMaterial] = useState({
    nombre_material: "",
    descripcion_material: "",
    id_categoria: "",
    id_proveedor: "",
    stock_minimo: 0,
    cantidad: 0,
  });

  // ==========================================
  // 2. OBTENER MATERIALES
  // ==========================================

  useEffect(() => {
    const obtenerMateriales = async () => {
      try {
        const token = localStorage.getItem("token");

        const respuesta = await fetch(
          "http://localhost:3000/api/materiales",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener los materiales");
        }

        const datos = await respuesta.json();
        setMateriales(datos);
      } catch (error) {
        console.error("Error al obtener materiales:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerMateriales();
  }, []);

  // ==========================================
  // 3. OBTENER CATEGORÍAS Y PROVEEDORES
  // ==========================================

  useEffect(() => {
    const obtenerDatosFormulario = async () => {
      try {
        const token = localStorage.getItem("token");

        const respuestaCategorias = await fetch(
          "http://localhost:3000/api/categorias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuestaCategorias.ok) {
          throw new Error("No se pudieron obtener las categorías");
        }

        const datosCategorias = await respuestaCategorias.json();
        setCategorias(datosCategorias);

        const respuestaProveedores = await fetch(
          "http://localhost:3000/api/proveedores",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuestaProveedores.ok) {
          throw new Error("No se pudieron obtener los proveedores");
        }

        const datosProveedores = await respuestaProveedores.json();
        setProveedores(datosProveedores);
      } catch (error) {
        console.error(
          "Error al obtener categorías y proveedores:",
          error
        );
      }
    };

    obtenerDatosFormulario();
  }, []);

  // ==========================================
  // 4. SOLICITAR MATERIAL
  // ==========================================

  const solicitarMaterial = async () => {
    if (!materialSeleccionado) return;

    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
      setMensaje("Debes iniciar sesión");
      setTipoMensaje("error");
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/prestamos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: usuario.id_usuario,
            id_material: materialSeleccionado.id_material,
            cantidad: cantidad,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo registrar el préstamo");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Préstamo registrado correctamente");
      setTipoMensaje("exito");
      setMaterialSeleccionado(null);
      setCantidad(1);

      // Actualizar materiales
      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (respuestaMateriales.ok) {
        const nuevosDatos = await respuestaMateriales.json();
        setMateriales(nuevosDatos);
      }
    } catch (error) {
      console.error("Error al solicitar material:", error);
      setMensaje("No se pudo registrar el préstamo");
      setTipoMensaje("error");
    }
  };

  // ==========================================
  // 5. REGISTRAR MATERIAL
  // ==========================================

  const registrarMaterial = async () => {
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/materiales",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre_material: nuevoMaterial.nombre_material,
            descripcion_material: nuevoMaterial.descripcion_material,
            id_categoria: Number(nuevoMaterial.id_categoria),
            id_proveedor: Number(nuevoMaterial.id_proveedor),
            stock_minimo: nuevoMaterial.stock_minimo,
            cantidad: nuevoMaterial.cantidad,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo registrar el material");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Material registrado correctamente");
      setTipoMensaje("exito");
      setMostrarRegistro(false);

      setNuevoMaterial({
        nombre_material: "",
        descripcion_material: "",
        id_categoria: "",
        id_proveedor: "",
        stock_minimo: 0,
        cantidad: 0,
      });

      // Actualizar catálogo
      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (respuestaMateriales.ok) {
        const materialesActualizados =
          await respuestaMateriales.json();

        setMateriales(materialesActualizados);
      }
    } catch (error) {
      console.error("Error al registrar material:", error);
      setMensaje("No se pudo registrar el material");
      setTipoMensaje("error");
    }
  };

  // ==========================================
  // 6. EDITAR MATERIAL
  // ==========================================

  const editarMaterial = async () => {
    if (!materialEditando) return;

    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        `http://localhost:3000/api/materiales/${materialEditando.id_material}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre_material: materialEditando.nombre_material,
            descripcion_material: materialEditando.descripcion_material,
            id_categoria: materialEditando.id_categoria,
            stock_minimo: materialEditando.stock_minimo,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo actualizar el material");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Material actualizado correctamente");
      setTipoMensaje("exito");
      setMaterialEditando(null);

      // Actualizar catálogo
      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (respuestaMateriales.ok) {
        const materialesActualizados =
          await respuestaMateriales.json();

        setMateriales(materialesActualizados);
      }
    } catch (error) {
      console.error("Error al editar material:", error);
      setMensaje("No se pudo actualizar el material");
      setTipoMensaje("error");
    }
  };

  // ==========================================
  // 7. CARGA Y FILTROS
  // ==========================================

  if (cargando) {
    return <p>Cargando materiales...</p>;
  }

  // Aplicar todos los filtros
  const materialesFiltrados = materiales
    .filter((material) => {
      const coincideBusqueda = material.nombre_material
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        material.id_categoria === categoriaSeleccionada;

      const coincideDisponibilidad =
        disponibilidad === "todas" ||
        (disponibilidad === "disponible" &&
          material.stock_actual > 0) ||
        (disponibilidad === "agotado" &&
          material.stock_actual === 0);

      const coincideStock =
        estadoStock === "todos" ||
        (estadoStock === "bajo" &&
          material.stock_actual > 0 &&
          material.stock_actual <= material.stock_minimo) ||
        (estadoStock === "normal" &&
          material.stock_actual > material.stock_minimo) ||
        (estadoStock === "agotado" &&
          material.stock_actual === 0);

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideDisponibilidad &&
        coincideStock
      );
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case "az":
          return a.nombre_material.localeCompare(b.nombre_material);

        case "za":
          return b.nombre_material.localeCompare(a.nombre_material);

        case "mayor":
          return b.stock_actual - a.stock_actual;

        case "menor":
          return a.stock_actual - b.stock_actual;

        default:
          return 0;
      }
    });

  // Exportar materiales filtrados/consultados a Excel
  const handleExportarExcel = () => {
    if (materialesFiltrados.length === 0) {
      setMensaje("No hay materiales para exportar con los filtros actuales.");
      setTipoMensaje("error");
      return;
    }

    const filasExcel = materialesFiltrados.map((material) => {
      let estado = "Stock normal";

      if (material.stock_actual === 0) {
        estado = "Agotado";
      } else if (material.stock_actual <= material.stock_minimo) {
        estado = "Stock bajo";
      }

      return {
        ID: material.id_material,
        Material: material.nombre_material,
        Descripción: material.descripcion_material,
        Categoría: material.nombre_categoria,
        "Stock actual": material.stock_actual,
        "Stock mínimo": material.stock_minimo,
        Estado: estado,
      };
    });

    exportarAExcel(filasExcel, "stockia_materiales", "Materiales");
  };

  // Agrupar materiales por categoría
  const materialesPorCategoria = materialesFiltrados.reduce(
    (resultado, material) => {
      if (!resultado[material.nombre_categoria]) {
        resultado[material.nombre_categoria] = [];
      }

      resultado[material.nombre_categoria].push(material);
      return resultado;
    },
    {} as Record<string, Material[]>
  );

  // Identificar al Coordinador
  const usuarioGuardado = localStorage.getItem("usuario");

  const esCoordinador = usuarioGuardado
    ? JSON.parse(usuarioGuardado).rol === "Coordinador"
    : false;

  // ==========================================
  // 8. INTERFAZ
  // ==========================================

  return (
    <div className="pagina-con-footer">
      <Navbar />

      <div className="products-section">

        {/* Confirmación del préstamo */}
        {confirmarPrestamo && (
          <div className="mensaje-overlay">
            <div className="mensaje-box">
              <h2>Confirmar préstamo</h2>

              <p>
                ¿Estás seguro de que quieres solicitar{" "}
                <strong>{cantidad}</strong> unidad(es) de{" "}
                <strong>
                  {materialSeleccionado?.nombre_material}
                </strong>?
              </p>

              <div className="botones-confirmacion">
                <button
                  className="btn-confirmar"
                  onClick={() => {
                    setConfirmarPrestamo(false);
                    solicitarMaterial();
                  }}
                >
                  Confirmar
                </button>

                <button
                  className="btn-cancelar"
                  onClick={() => setConfirmarPrestamo(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de resultado */}
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

        {/* Acciones superiores: registrar material y exportar a Excel */}
        <div className="acciones-catalogo">
          {esCoordinador && (
            <button
              className="btn btn-primary btn-registrar-material"
              onClick={() => setMostrarRegistro(true)}
            >
              + Registrar material
            </button>
          )}

          <button
            type="button"
            className="btn btn-exportar-excel"
            onClick={handleExportarExcel}
          >
            Exportar a Excel
          </button>
        </div>

        {/* Formulario para registrar material */}
        {mostrarRegistro && (
          <div className="solicitud-box">
            <h2>Registrar material</h2>

            <label>
              Nombre:
              <input
                type="text"
                value={nuevoMaterial.nombre_material}
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    nombre_material: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Descripción:
              <input
                type="text"
                value={nuevoMaterial.descripcion_material}
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    descripcion_material: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Categoría:
              <select
                value={nuevoMaterial.id_categoria}
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    id_categoria: event.target.value,
                  })
                }
              >
                <option value="">Seleccionar categoría</option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id_categoria}
                    value={categoria.id_categoria}
                  >
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Proveedor:
              <select
                value={nuevoMaterial.id_proveedor}
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    id_proveedor: event.target.value,
                  })
                }
              >
                <option value="">Seleccionar proveedor</option>

                {proveedores.map((proveedor) => (
                  <option
                    key={proveedor.id_proveedor}
                    value={proveedor.id_proveedor}
                  >
                    {proveedor.nombre_proveedor}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Stock inicial:
              <input
                type="number"
                min="0"
                value={nuevoMaterial.cantidad}
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    cantidad: Number(event.target.value),
                  })
                }
              />
            </label>

            <label>
              Stock mínimo:
              <input
                type="number"
                min="0"
                value={nuevoMaterial.stock_minimo}
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    stock_minimo: Number(event.target.value),
                  })
                }
              />
            </label>

            <button
              className="btn btn-primary"
              onClick={registrarMaterial}
            >
              Registrar
            </button>

            <button
              className="btn btn-cancelar"
              onClick={() => setMostrarRegistro(false)}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Formulario para editar material */}
        {materialEditando && (
          <div className="solicitud-box">
            <h2>Editar material</h2>

            <label>
              Nombre:
              <input
                type="text"
                value={materialEditando.nombre_material}
                onChange={(event) =>
                  setMaterialEditando({
                    ...materialEditando,
                    nombre_material: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Descripción:
              <input
                type="text"
                value={materialEditando.descripcion_material}
                onChange={(event) =>
                  setMaterialEditando({
                    ...materialEditando,
                    descripcion_material: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Categoría:
              <select
                value={materialEditando.id_categoria}
                onChange={(event) =>
                  setMaterialEditando({
                    ...materialEditando,
                    id_categoria: Number(event.target.value),
                  })
                }
              >
                <option value="">Seleccionar categoría</option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id_categoria}
                    value={categoria.id_categoria}
                  >
                    {categoria.nombre_categoria}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Stock mínimo:
              <input
                type="number"
                min="0"
                value={materialEditando.stock_minimo}
                onChange={(event) =>
                  setMaterialEditando({
                    ...materialEditando,
                    stock_minimo: Number(event.target.value),
                  })
                }
              />
            </label>

            <button
              className="btn btn-primary"
              onClick={editarMaterial}
            >
              Guardar cambios
            </button>

            <button
              className="btn btn-cancelar"
              onClick={() => setMaterialEditando(null)}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ==================================
            BARRA ÚNICA DE FILTROS
        ================================== */}

        <div className="barra-filtros">

          <div className="filtro-grupo">
            <label>Buscar material</label>

            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          <div className="filtro-grupo">
            <label>Categoría</label>

            <select
              value={categoriaSeleccionada}
              onChange={(event) =>
                setCategoriaSeleccionada(
                  event.target.value === "todas"
                    ? "todas"
                    : Number(event.target.value)
                )
              }
            >
              <option value="todas">Todas las categorías</option>

              {categorias.map((categoria) => (
                <option
                  key={categoria.id_categoria}
                  value={categoria.id_categoria}
                >
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Disponibilidad</label>

            <select
              value={disponibilidad}
              onChange={(event) =>
                setDisponibilidad(event.target.value)
              }
            >
              <option value="todas">Todas</option>
              <option value="disponible">Disponible</option>
              <option value="agotado">Sin existencias</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Estado del stock</label>

            <select
              value={estadoStock}
              onChange={(event) =>
                setEstadoStock(event.target.value)
              }
            >
              <option value="todos">Todos</option>
              <option value="bajo">Stock bajo</option>
              <option value="normal">Stock normal</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Ordenar por</label>

            <select
              value={ordenamiento}
              onChange={(event) =>
                setOrdenamiento(event.target.value)
              }
            >
              <option value="az">Nombre A-Z</option>
              <option value="za">Nombre Z-A</option>
              <option value="mayor">Mayor stock</option>
              <option value="menor">Menor stock</option>
            </select>
          </div>

          {/* Contador y botón dentro del mismo recuadro */}
          <div className="filtros-footer">

            <div className="resultado-filtros">
              Se encontraron {materialesFiltrados.length} materiales
            </div>

            <button
              type="button"
              className="btn-limpiar-filtros"
              onClick={() => {
                setBusqueda("");
                setCategoriaSeleccionada("todas");
                setDisponibilidad("todas");
                setEstadoStock("todos");
                setOrdenamiento("az");
              }}
            >
              Limpiar filtros
            </button>

          </div>

        </div>

        {/* Solicitar material */}
        {materialSeleccionado && (
          <div className="solicitud-box">
            <h2>Solicitar</h2>

            <p>
              <strong>{materialSeleccionado.nombre_material}</strong>
            </p>

            <p>
              Stock disponible: {materialSeleccionado.stock_actual}
            </p>

            <label>
              Cantidad:

              <input
                type="number"
                min="1"
                max={materialSeleccionado.stock_actual}
                value={cantidad}
                onChange={(event) =>
                  setCantidad(Number(event.target.value))
                }
              />
            </label>

            <button
              className="btn btn-primary"
              onClick={() => {
                if (
                  cantidad < 1 ||
                  cantidad > materialSeleccionado.stock_actual
                ) {
                  setMensaje("La cantidad solicitada no es válida");
                  setTipoMensaje("error");
                  return;
                }

                setConfirmarPrestamo(true);
              }}
            >
              Confirmar préstamo
            </button>

            <button
              className="btn"
              onClick={() => {
                setMaterialSeleccionado(null);
                setCantidad(1);
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ==================================
            CATÁLOGO AGRUPADO POR CATEGORÍA
        ================================== */}

        <div>
          {materialesFiltrados.length === 0 ? (
            <p className="catalogo-sin-resultados">
              No se encontraron materiales para los filtros seleccionados.
            </p>
          ) : (
            Object.entries(materialesPorCategoria).map(
              ([categoria, materialesCategoria]) => (
                <section
                  key={categoria}
                  className="categoria-section"
                >
                  <h2 className="categoria-titulo">
                    {categoria}
                  </h2>

                  <div className="card-grid">
                    {materialesCategoria.map((material) => (
                      <Card
                        key={material.id_material}
                        title={material.nombre_material}
                      >
                        <div className="card-body">

                          <p className="card-text">
                            {material.descripcion_material}
                          </p>

                          <p className="card-text">
                            <strong>Stock actual:</strong>{" "}
                            {material.stock_actual}
                          </p>

                          <p className="card-text">
                            <strong>Stock mínimo:</strong>{" "}
                            {material.stock_minimo}
                          </p>

                          {material.stock_actual === 0 && (
                            <p className="card-text">
                              Sin existencias
                            </p>
                          )}

                          {material.stock_actual > 0 &&
                            material.stock_actual <= material.stock_minimo && (
                              <p className="card-text">
                                Stock bajo
                              </p>
                            )}

                          <button
                            className="btn btn-primary"
                            disabled={material.stock_actual <= 0}
                            onClick={() =>
                              setMaterialSeleccionado(material)
                            }
                          >
                            Solicitar
                          </button>

                          {esCoordinador && (
                            <button
                              className="btn btn-editar"
                              onClick={() =>
                                setMaterialEditando({ ...material })
                              }
                            >
                              Editar
                            </button>
                          )}

                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )
            )
          )}
        </div>
      </div>

      {/* PIE DE PÁGINA STOCKIA */}
      <Footer />
    </div>
  );
}

export default Productos;
