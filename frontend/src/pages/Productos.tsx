import { useEffect, useState } from "react"; // Hooks de React para efectos secundarios y manejo de estado.
import Card from "../components/ui/Card"; // Componente de tarjeta reutilizable para cada material.
import Navbar from "../components/layout/Navbar"; // Barra de navegación superior.
import { exportarAExcel } from "../utils/exportacion_excel"; // Utilidad reutilizable para generar archivos .xlsx.
import "../styles/catalogo.css"; // Estilos del catálogo, filtros y grilla de materiales.
import "../styles/formularios.css"; // Estilos de formularios de registro, edición y solicitud.
import "../styles/modales.css"; // Estilos de modales de confirmación y mensajes.

interface Material { // Interfaz que describe la estructura de cada material devuelto por la API.
  id_material: number; // Identificador único del material.
  nombre_material: string; // Nombre del material.
  descripcion_material: string; // Descripción del material.
  id_categoria: number; // ID de la categoría asociada.
  nombre_categoria: string; // Nombre de la categoría asociada.
  stock_actual: number; // Unidades disponibles actualmente.
  stock_minimo: number; // Umbral mínimo de stock permitido.
}

interface Categoria { // Interfaz para las categorías del catálogo.
  id_categoria: number; // ID de la categoría.
  nombre_categoria: string; // Nombre de la categoría.
}

interface Proveedor { // Interfaz para los proveedores de materiales.
  id_proveedor: number; // ID del proveedor.
  nombre_proveedor: string; // Nombre del proveedor.
}

function Productos() { // Componente principal del catálogo y gestión de materiales.
  // ==========================================
  // 1. ESTADOS
  // ==========================================

  const [materiales, setMateriales] = useState<Material[]>([]); // Lista completa de materiales cargados desde el backend.
  const [cargando, setCargando] = useState(true); // Indica si se están consultando los materiales inicialmente.

  // Filtros
  const [busqueda, setBusqueda] = useState(""); // Texto de búsqueda por nombre de material.
  const [categoriaSeleccionada, setCategoriaSeleccionada] = // Filtro por ID de categoría o "todas".
    useState<number | "todas">("todas");
  const [disponibilidad, setDisponibilidad] = useState("todas"); // Filtro por disponibilidad ("todas", "disponible", "agotado").
  const [estadoStock, setEstadoStock] = useState("todos"); // Filtro por nivel de stock ("todos", "bajo", "normal", "agotado").
  const [ordenamiento, setOrdenamiento] = useState("az"); // Criterio de ordenamiento ("az", "za", "mayor", "menor").

  // Préstamos
  const [cantidad, setCantidad] = useState(1); // Cantidad de unidades solicitadas en préstamo.
  const [materialSeleccionado, setMaterialSeleccionado] = // Material elegido para solicitar préstamo.
    useState<Material | null>(null);
  const [confirmarPrestamo, setConfirmarPrestamo] = useState(false); // Controla el modal de confirmación de préstamo.

  // Mensajes
  const [mensaje, setMensaje] = useState(""); // Texto del modal de resultado (éxito o error).
  const [tipoMensaje, setTipoMensaje] = // Estilo del modal de mensaje ("exito" o "error").
    useState<"exito" | "error">("exito");

  // Registro y edición
  const [mostrarRegistro, setMostrarRegistro] = useState(false); // Muestra u oculta el formulario de nuevo material.
  const [materialEditando, setMaterialEditando] = // Guarda el material en edición o null si no se está editando.
    useState<Material | null>(null);

  // Categorías y proveedores
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Catálogo de categorías para selects y filtros.
  const [proveedores, setProveedores] = useState<Proveedor[]>([]); // Catálogo de proveedores para registro.

  // Formulario de nuevo material
  const [nuevoMaterial, setNuevoMaterial] = useState({ // Estado controlado del formulario de registro.
    nombre_material: "", // Nombre inicial vacío.
    descripcion_material: "", // Descripción inicial vacía.
    id_categoria: "", // Categoría seleccionada como string hasta convertir a Number.
    id_proveedor: "", // Proveedor seleccionado como string hasta convertir a Number.
    stock_minimo: 0, // Stock mínimo inicial.
    cantidad: 0, // Stock inicial.
  });

  // ==========================================
  // 2. OBTENER MATERIALES
  // ==========================================

  useEffect(() => { // Carga los materiales al montar el componente.
    const obtenerMateriales = async () => { // Función asíncrona para consultar /api/materiales.
      try {
        const token = localStorage.getItem("token"); // Recupera el token JWT guardado.

        const respuesta = await fetch( // Petición GET protegida por token.
          "http://localhost:3000/api/materiales",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Envía autorización Bearer.
            },
          }
        );

        if (!respuesta.ok) { // Verifica respuesta exitosa.
          throw new Error("No se pudieron obtener los materiales");
        }

        const datos = await respuesta.json(); // Parsea el arreglo de materiales.
        setMateriales(datos); // Guarda los materiales en estado.
      } catch (error) {
        console.error("Error al obtener materiales:", error); // Registra error en consola.
      } finally {
        setCargando(false); // Finaliza el estado de carga.
      }
    };

    obtenerMateriales(); // Ejecuta la consulta inicial.
  }, []); // Solo al montar.

  // ==========================================
  // 3. OBTENER CATEGORÍAS Y PROVEEDORES
  // ==========================================

  useEffect(() => { // Carga categorías y proveedores al montar.
    const obtenerDatosFormulario = async () => { // Consulta ambos catálogos en paralelo lógico.
      try {
        const token = localStorage.getItem("token"); // Token JWT.

        const respuestaCategorias = await fetch( // Consulta /api/categorias.
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

        const datosCategorias = await respuestaCategorias.json(); // Parsea categorías.
        setCategorias(datosCategorias); // Guarda categorías.

        const respuestaProveedores = await fetch( // Consulta /api/proveedores.
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

        const datosProveedores = await respuestaProveedores.json(); // Parsea proveedores.
        setProveedores(datosProveedores); // Guarda proveedores.
      } catch (error) {
        console.error(
          "Error al obtener categorías y proveedores:",
          error
        );
      }
    };

    obtenerDatosFormulario(); // Ejecuta carga de catálogos.
  }, []); // Solo al montar.

  // ==========================================
  // 4. SOLICITAR MATERIAL
  // ==========================================

  const solicitarMaterial = async () => { // Registra un préstamo del material seleccionado.
    if (!materialSeleccionado) return; // Evita ejecutar si no hay material seleccionado.

    const usuarioGuardado = localStorage.getItem("usuario"); // Lee usuario de localStorage.

    if (!usuarioGuardado) { // Si no hay sesión activa...
      setMensaje("Debes iniciar sesión"); // ...muestra aviso.
      setTipoMensaje("error");
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado); // Parsea datos del usuario.
      const token = localStorage.getItem("token"); // Token JWT.

      const respuesta = await fetch( // Envía POST a /api/prestamos.
        "http://localhost:3000/api/prestamos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: usuario.id_usuario, // ID del usuario que solicita.
            id_material: materialSeleccionado.id_material, // ID del material.
            cantidad: cantidad, // Cantidad solicitada.
          }),
        }
      );

      const datos = await respuesta.json(); // Lee respuesta del backend.

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo registrar el préstamo");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Préstamo registrado correctamente"); // Confirma préstamo.
      setTipoMensaje("exito");
      setMaterialSeleccionado(null); // Cierra caja de solicitud.
      setCantidad(1); // Reinicia cantidad.

      // Actualizar materiales
      const respuestaMateriales = await fetch( // Refresca el stock actual mostrado en pantalla.
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

  const registrarMaterial = async () => { // Crea un nuevo material en el backend.
    try {
      const token = localStorage.getItem("token"); // Token JWT.

      const respuesta = await fetch( // Envía POST a /api/materiales.
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

      const datos = await respuesta.json(); // Lee respuesta.

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo registrar el material");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Material registrado correctamente");
      setTipoMensaje("exito");
      setMostrarRegistro(false); // Cierra formulario de registro.

      setNuevoMaterial({ // Limpia campos del formulario.
        nombre_material: "",
        descripcion_material: "",
        id_categoria: "",
        id_proveedor: "",
        stock_minimo: 0,
        cantidad: 0,
      });

      // Actualizar catálogo
      const respuestaMateriales = await fetch( // Recarga catálogo actualizado.
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

  const editarMaterial = async () => { // Actualiza un material existente.
    if (!materialEditando) return; // Sale si no hay material en edición.

    try {
      const token = localStorage.getItem("token"); // Token JWT.

      const respuesta = await fetch( // Envía PUT a /api/materiales/:id.
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

      const datos = await respuesta.json(); // Lee respuesta.

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo actualizar el material");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Material actualizado correctamente");
      setTipoMensaje("exito");
      setMaterialEditando(null); // Cierra formulario de edición.

      // Actualizar catálogo
      const respuestaMateriales = await fetch( // Recarga catálogo.
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

  if (cargando) { // Muestra estado de carga inicial.
    return <p>Cargando materiales...</p>;
  }

  // Aplicar todos los filtros
  const materialesFiltrados = materiales // Filtra y ordena los materiales según los controles activos.
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
    .sort((a, b) => { // Ordena los resultados filtrados según ordenamiento.
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
  const handleExportarExcel = () => { // Prepara los datos consultados y dispara la descarga .xlsx.
    if (materialesFiltrados.length === 0) { // Si no hay materiales que coincidan con los filtros...
      setMensaje("No hay materiales para exportar con los filtros actuales."); // ...avisa al usuario.
      setTipoMensaje("error");
      return;
    }

    const filasExcel = materialesFiltrados.map((material) => { // Formatea cada material con columnas legibles.
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

    exportarAExcel(filasExcel, "stockia_materiales", "Materiales"); // Genera y descarga stockia_materiales.xlsx.
  };

  // Agrupar materiales por categoría
  const materialesPorCategoria = materialesFiltrados.reduce( // Agrupa los materiales filtrados por nombre_categoria.
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
  const usuarioGuardado = localStorage.getItem("usuario"); // Obtiene usuario guardado para verificar rol.

  const esCoordinador = usuarioGuardado // Determina si el usuario actual tiene rol Coordinador.
    ? JSON.parse(usuarioGuardado).rol === "Coordinador"
    : false;

  // ==========================================
  // 8. INTERFAZ
  // ==========================================

  return (
    <div>
      <Navbar /> {/* Barra de navegación superior. */}

      <div className="products-section"> {/* Contenedor principal de la sección. */}

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
        <div className="acciones-catalogo"> {/* Contenedor de botones superiores. */}
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

        {/* Cantidad de resultados */}
        <p className="resultado-filtros">
          Se encontraron {materialesFiltrados.length} materiales
        </p>

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
    </div>
  );
}

export default Productos;