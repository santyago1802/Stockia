import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Navbar from "../components/layout/Navbar";

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
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Estados para solicitar material
  const [cantidad, setCantidad] = useState(1);
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<Material | null>(null);

  // Estados para mensajes
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState<"exito" | "error">("exito");

  // Confirmación del préstamo
  const [confirmarPrestamo, setConfirmarPrestamo] = useState(false);

  // Estados para registrar material
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  // Estado para editar material
  const [materialEditando, setMaterialEditando] =
    useState<Material | null>(null);

  // Categorías y proveedores
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Datos del nuevo material
  const [nuevoMaterial, setNuevoMaterial] = useState({
    nombre_material: "",
    descripcion_material: "",
    id_categoria: "",
    id_proveedor: "",
    stock_minimo: 0,
    cantidad: 0,
  });

  // Obtener materiales
  useEffect(() => {
    const obtenerMateriales = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/materiales"
        );

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

  // Obtener categorías y proveedores
  useEffect(() => {
    const obtenerDatosFormulario = async () => {
      try {
        const respuestaCategorias = await fetch(
          "http://localhost:3000/api/categorias"
        );

        const datosCategorias = await respuestaCategorias.json();

        setCategorias(datosCategorias);

        const respuestaProveedores = await fetch(
          "http://localhost:3000/api/proveedores"
        );

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

  // Solicitar material
  const solicitarMaterial = async () => {
    if (!materialSeleccionado) {
      return;
    }

    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
      setMensaje("Debes iniciar sesión");
      setTipoMensaje("error");
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/prestamos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        setMensaje(datos.mensaje);
        setTipoMensaje("error");
        return;
      }

      setMensaje("Préstamo registrado correctamente");
      setTipoMensaje("exito");

      setMaterialSeleccionado(null);
      setCantidad(1);

      // Actualizar materiales
      const materialesActualizados = await fetch(
        "http://localhost:3000/api/materiales"
      );

      const nuevosDatos = await materialesActualizados.json();

      setMateriales(nuevosDatos);
    } catch (error) {
      console.error(error);

      setMensaje("No se pudo registrar el préstamo");
      setTipoMensaje("error");
    }
  };

  // Registrar material
  const registrarMaterial = async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/materiales",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_material: nuevoMaterial.nombre_material,
            descripcion_material:
              nuevoMaterial.descripcion_material,
            id_categoria: Number(nuevoMaterial.id_categoria),
            id_proveedor: Number(nuevoMaterial.id_proveedor),
            stock_minimo: nuevoMaterial.stock_minimo,
            cantidad: nuevoMaterial.cantidad,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje);
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

      // Actualizar lista de materiales
      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales"
      );

      const materialesActualizados =
        await respuestaMateriales.json();

      setMateriales(materialesActualizados);
    } catch (error) {
      console.error(error);

      setMensaje("No se pudo registrar el material");
      setTipoMensaje("error");
    }
  };

  // Editar material
  const editarMaterial = async () => {
    if (!materialEditando) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/materiales/${materialEditando.id_material}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_material:
              materialEditando.nombre_material,
            descripcion_material:
              materialEditando.descripcion_material,
            id_categoria: materialEditando.id_categoria,
            stock_minimo: materialEditando.stock_minimo,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje);
        setTipoMensaje("error");
        return;
      }

      setMensaje("Material actualizado correctamente");
      setTipoMensaje("exito");

      setMaterialEditando(null);

      // Actualizar lista de materiales
      const respuestaMateriales = await fetch(
        "http://localhost:3000/api/materiales"
      );

      const materialesActualizados =
        await respuestaMateriales.json();

      setMateriales(materialesActualizados);
    } catch (error) {
      console.error(error);

      setMensaje("No se pudo actualizar el material");
      setTipoMensaje("error");
    }
  };

  if (cargando) {
    return <p>Cargando materiales...</p>;
  }

  // Filtrar materiales por búsqueda
  const materialesFiltrados = materiales.filter((material) =>
    material.nombre_material
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Agrupar materiales por categoría
  const materialesPorCategoria =
    materialesFiltrados.reduce(
      (categorias, material) => {
        if (!categorias[material.nombre_categoria]) {
          categorias[material.nombre_categoria] = [];
        }

        categorias[material.nombre_categoria].push(material);

        return categorias;
      },
      {} as Record<string, Material[]>
    );

  return (
    <div>
      <Navbar />

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
              </strong>
              ?
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
                onClick={() =>
                  setConfirmarPrestamo(false)
                }
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
          <div
            className={`mensaje-box ${tipoMensaje}`}
          >
            <h2>
              {tipoMensaje === "exito"
                ? "✓ ¡Listo!"
                : "⚠️ Error"}
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

      <div className="products-section">

        {/* Botón registrar material */}
        {(() => {
          const usuarioGuardado =
            localStorage.getItem("usuario");

          if (!usuarioGuardado) {
            return null;
          }

          const usuario = JSON.parse(usuarioGuardado);

          if (usuario.rol !== "Coordinador") {
            return null;
          }

          return (
            <button
              className="btn btn-primary btn-registrar-material"
              onClick={() => setMostrarRegistro(true)}
            >
              + Registrar material
        </button>
          );
        })()}

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
                    nombre_material:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              Descripción:
              <input
                type="text"
                value={
                  nuevoMaterial.descripcion_material
                }
                onChange={(event) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    descripcion_material:
                      event.target.value,
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
                    id_categoria:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  Seleccionar categoría
                </option>

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
                    id_proveedor:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  Seleccionar proveedor
                </option>

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
                    cantidad: Number(
                      event.target.value
                    ),
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
                    stock_minimo: Number(
                      event.target.value
                    ),
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
              onClick={() =>
                setMostrarRegistro(false)
              }
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
                value={
                  materialEditando.nombre_material
                }
                onChange={(event) =>
                  setMaterialEditando({
                    ...materialEditando,
                    nombre_material:
                      event.target.value,
                  })
                }
              />
            </label>

            <label>
              Descripción:
              <input
                type="text"
                value={
                  materialEditando.descripcion_material
                }
                onChange={(event) =>
                  setMaterialEditando({
                    ...materialEditando,
                    descripcion_material:
                      event.target.value,
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
                    id_categoria: Number(
                      event.target.value
                    ),
                  })
                }
              >
                <option value="">
                  Seleccionar categoría
                </option>

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
                    stock_minimo: Number(
                      event.target.value
                    ),
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
              onClick={() =>
                setMaterialEditando(null)
              }
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Buscador */}
        <div className="busqueda-materiales">
          <span className="icono-busqueda">
            🔍
          </span>

          <input
            type="text"
            placeholder="Buscar material..."
            value={busqueda}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
          />
        </div>

        {/* Solicitar material */}
        {materialSeleccionado && (
          <div className="solicitud-box">
            <h2>Solicitar</h2>

            <p>
              <strong>
                {materialSeleccionado.nombre_material}
              </strong>
            </p>

            <p>
              Stock disponible:{" "}
              {materialSeleccionado.stock_actual}
            </p>

            <label>
              Cantidad:
              <input
                type="number"
                min="1"
                max={
                  materialSeleccionado.stock_actual
                }
                value={cantidad}
                onChange={(event) =>
                  setCantidad(
                    Number(event.target.value)
                  )
                }
              />
            </label>

            <button
              className="btn btn-primary"
              onClick={() =>
                setConfirmarPrestamo(true)
              }
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

        {/* Materiales agrupados por categoría */}
        <div>
          {Object.entries(
            materialesPorCategoria
          ).map(
            ([categoria, materialesCategoria]) => (
              <section
                key={categoria}
                className="categoria-section"
              >
                <h2 className="categoria-titulo">
                  {categoria}
                </h2>

                <div className="card-grid">
                  {materialesCategoria.map(
                    (material) => (
                      <Card
                        key={material.id_material}
                        title={
                          material.nombre_material
                        }
                      >
                        <div className="card-body">

                          <p className="card-text">
                            {
                              material.descripcion_material
                            }
                          </p>

                          <p className="card-text">
                            <strong>
                              Stock actual:
                            </strong>{" "}
                            {
                              material.stock_actual
                            }
                          </p>

                          <p className="card-text">
                            <strong>
                              Stock mínimo:
                            </strong>{" "}
                            {
                              material.stock_minimo
                            }
                          </p>

                          {material.stock_actual <=
                            material.stock_minimo && (
                            <p className="card-text">
                              ⚠️ Stock bajo
                            </p>
                          )}

                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              setMaterialSeleccionado(
                                material
                              )
                            }
                          >
                            Solicitar
                          </button>

                          {/* Botón editar para Coordinador */}
                          {(() => {
                            const usuarioGuardado =
                              localStorage.getItem(
                                "usuario"
                              );

                            if (!usuarioGuardado) {
                              return null;
                            }

                            const usuario =
                              JSON.parse(
                                usuarioGuardado
                              );

                            if (
                              usuario.rol !==
                              "Coordinador"
                            ) {
                              return null;
                            }

                            return (
                              <button
                                className="btn btn-editar"
                                onClick={() =>
                                  setMaterialEditando({
                                    ...material,
                                  })
                                }
                              >
                                Editar
                              </button>
                            );
                          })()}

                        </div>
                      </Card>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Productos;