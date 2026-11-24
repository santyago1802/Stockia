import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { exportarAExcel } from "../utils/exportacion_excel";
import "../styles/catalogo.css";
import "../styles/formularios.css";
import "../styles/modales.css";

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

  // Exportar materiales filtrados a Excel
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
        {confirmarPrestamo && materialSeleccionado && (
          <div className="confirmacion-overlay">
            <div
              className="confirmacion-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-confirmacion"
            >
              <button
                type="button"
                className="confirmacion-cerrar"
                onClick={() => setConfirmarPrestamo(false)}
                aria-label="Cerrar ventana"
              >
                ×
              </button>

              <div className="confirmacion-encabezado">
                <span>Materiales de mantenimiento</span>
                <h2 id="titulo-confirmacion">Confirmar préstamo</h2>
              </div>

              <p className="confirmacion-pregunta">
                ¿Estás seguro de que quieres solicitar{" "}
                <strong>{cantidad}</strong>{" "}
                {cantidad === 1 ? "unidad" : "unidades"} de{" "}
                <strong>{materialSeleccionado.nombre_material}</strong>?
              </p>

              <div className="confirmacion-resumen">
                <div>
                  <span>Material</span>
                  <strong>{materialSeleccionado.nombre_material}</strong>
                </div>

                <div>
                  <span>Cantidad</span>
                  <strong>
                    {cantidad} {cantidad === 1 ? "unidad" : "unidades"}
                  </strong>
                </div>
              </div>

              <div className="confirmacion-acciones">
                <button
                  type="button"
                  className="confirmacion-btn-cancelar"
                  onClick={() => setConfirmarPrestamo(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="confirmacion-btn-confirmar"
                  onClick={async () => {
                    setConfirmarPrestamo(false);
                    await solicitarMaterial();
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de resultado */}
        {mensaje && (
          <div className="mensaje-overlay">
            <div className={`mensaje-box ${tipoMensaje}`}>
              <div className="mensaje-icono">
                {tipoMensaje === "exito" ? "✓" : "!"}
              </div>

              <h2>
                {tipoMensaje === "exito" ? "¡Listo!" : "Ocurrió un error"}
              </h2>

              <p>{mensaje}</p>

              {tipoMensaje === "exito" &&
                mensaje === "Préstamo registrado correctamente" &&
                materialSeleccionado && (
                  <div className="mensaje-resumen">
                    <div>
                      <span>Material solicitado</span>
                      <strong>
                        {materialSeleccionado.nombre_material}
                      </strong>
                    </div>

                    <span className="mensaje-cantidad">
                      {cantidad}{" "}
                      {cantidad === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                )}

              <button
                onClick={() => {
                  setMensaje("");
                  setMaterialSeleccionado(null);
                  setCantidad(1);
                }}
                className="btn-mensaje"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {/* Acciones superiores */}
        <div className="acciones-catalogo">
          {esCoordinador && (
            <>
              <button
                className="btn btn-primary btn-registrar-material"
                onClick={() => setMostrarRegistro(true)}
              >
                + Registrar material
              </button>

              <button
                type="button"
                className="btn btn-exportar-excel"
                onClick={handleExportarExcel}
              >
                Exportar a Excel
              </button>
            </>
          )}
        </div>

        {/* ==========================================
            MODAL PARA REGISTRAR MATERIAL
        ========================================== */}

        {mostrarRegistro && (
          <div className="editar-material-overlay">
            <div
              className="editar-material-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-registrar-material"
            >
              <button
                type="button"
                className="editar-material-cerrar"
                onClick={() => setMostrarRegistro(false)}
                aria-label="Cerrar ventana"
              >
                ×
              </button>

              <div className="editar-material-encabezado">
                <span>Materiales de mantenimiento</span>
                <h2 id="titulo-registrar-material">
                  Registrar material
                </h2>
              </div>

              <div className="editar-material-campo">
                <label htmlFor="registrar-nombre">Nombre</label>
                <input
                  id="registrar-nombre"
                  type="text"
                  value={nuevoMaterial.nombre_material}
                  onChange={(event) =>
                    setNuevoMaterial({
                      ...nuevoMaterial,
                      nombre_material: event.target.value,
                    })
                  }
                />
              </div>

              <div className="editar-material-campo">
                <label htmlFor="registrar-descripcion">
                  Descripción
                </label>
                <input
                  id="registrar-descripcion"
                  type="text"
                  value={nuevoMaterial.descripcion_material}
                  onChange={(event) =>
                    setNuevoMaterial({
                      ...nuevoMaterial,
                      descripcion_material: event.target.value,
                    })
                  }
                />
              </div>

              <div className="editar-material-campo">
                <label htmlFor="registrar-categoria">Categoría</label>
                <select
                  id="registrar-categoria"
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
              </div>

              <div className="editar-material-campo">
                <label htmlFor="registrar-proveedor">Proveedor</label>
                <select
                  id="registrar-proveedor"
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
              </div>

              <div className="editar-material-campo">
                <label htmlFor="registrar-stock-inicial">
                  Stock inicial
                </label>
                <input
                  id="registrar-stock-inicial"
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
              </div>

              <div className="editar-material-campo">
                <label htmlFor="registrar-stock-minimo">
                  Stock mínimo
                </label>
                <input
                  id="registrar-stock-minimo"
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
                <small>Umbral de alerta para reposición</small>
              </div>

              <div className="editar-material-acciones">
                <button
                  type="button"
                  className="editar-material-btn-guardar"
                  onClick={registrarMaterial}
                >
                  Registrar material
                </button>

                <button
                  type="button"
                  className="editar-material-btn-cancelar"
                  onClick={() => setMostrarRegistro(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            MODAL PARA EDITAR MATERIAL
        ========================================== */}

        {materialEditando && (
          <div className="editar-material-overlay">
            <div
              className="editar-material-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-editar-material"
            >
              <button
                type="button"
                className="editar-material-cerrar"
                onClick={() => setMaterialEditando(null)}
                aria-label="Cerrar ventana"
              >
                ×
              </button>

              <div className="editar-material-encabezado">
                <span>Materiales de mantenimiento</span>
                <h2 id="titulo-editar-material">Editar material</h2>
              </div>

              <div className="editar-material-campo">
                <label htmlFor="editar-nombre">Nombre</label>
                <input
                  id="editar-nombre"
                  type="text"
                  value={materialEditando.nombre_material}
                  onChange={(event) =>
                    setMaterialEditando({
                      ...materialEditando,
                      nombre_material: event.target.value,
                    })
                  }
                />
              </div>

              <div className="editar-material-campo">
                <label htmlFor="editar-descripcion">Descripción</label>
                <input
                  id="editar-descripcion"
                  type="text"
                  value={materialEditando.descripcion_material}
                  onChange={(event) =>
                    setMaterialEditando({
                      ...materialEditando,
                      descripcion_material: event.target.value,
                    })
                  }
                />
              </div>

              <div className="editar-material-campo">
                <label htmlFor="editar-categoria">Categoría</label>
                <select
                  id="editar-categoria"
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
              </div>

              <div className="editar-material-campo">
                <label htmlFor="editar-stock-minimo">Stock mínimo</label>
                <input
                  id="editar-stock-minimo"
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
                <small>Umbral de alerta para reposición</small>
              </div>

              <div className="editar-material-acciones">
                <button
                  type="button"
                  className="editar-material-btn-guardar"
                  onClick={editarMaterial}
                >
                  Guardar cambios
                </button>

                <button
                  type="button"
                  className="editar-material-btn-cancelar"
                  onClick={() => setMaterialEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
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

        {/* Modal para solicitar material */}
        {materialSeleccionado && (
          <div className="solicitud-overlay">
            <div
              className="solicitud-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-solicitud"
            >
              <button
                type="button"
                className="solicitud-cerrar"
                onClick={() => {
                  setMaterialSeleccionado(null);
                  setCantidad(1);
                }}
                aria-label="Cerrar ventana"
              >
                ×
              </button>

              <div className="solicitud-encabezado">
                <span>Materiales de mantenimiento</span>
                <h2 id="titulo-solicitud">Solicitar</h2>
              </div>

              <div className="solicitud-material-info">
                <div>
                  <h3>{materialSeleccionado.nombre_material}</h3>
                  <p>
                    Stock disponible:{" "}
                    <strong>{materialSeleccionado.stock_actual}</strong>
                  </p>
                </div>

                <span className="solicitud-disponibilidad">
                  Disponible
                </span>
              </div>

              <div className="solicitud-cantidad">
                <label htmlFor="cantidad-solicitada">
                  Cantidad
                </label>

                <input
                  id="cantidad-solicitada"
                  type="number"
                  min="1"
                  max={materialSeleccionado.stock_actual}
                  value={cantidad}
                  onChange={(event) =>
                    setCantidad(
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value)
                    )
                  }
                />

                <small>
                  Ingresa la cantidad de unidades a retirar
                </small>
              </div>

              <div className="solicitud-acciones">
                <button
                  type="button"
                  className="solicitud-btn-confirmar"
                  onClick={() => {
                    if (
                      !Number.isInteger(cantidad) ||
                      cantidad < 1 ||
                      cantidad > materialSeleccionado.stock_actual
                    ) {
                      setMensaje(
                        "La cantidad solicitada no es válida"
                      );
                      setTipoMensaje("error");
                      return;
                    }

                    setConfirmarPrestamo(true);
                  }}
                >
                  Confirmar préstamo
                </button>

                <button
                  type="button"
                  className="solicitud-btn-cancelar"
                  onClick={() => {
                    setMaterialSeleccionado(null);
                    setCantidad(1);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
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

      <Footer />
    </div>
  );
}

export default Productos;