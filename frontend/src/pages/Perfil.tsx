
import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/perfil.css";

interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  documento_usuario: string;
  correo_usuario: string;
  rol: string;
}

interface Prestamo {
  id_prestamo: number;
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  estado: string;
  id_material: number;
  nombre_material: string;
  cantidad: number;
}

interface Movimiento {
  id_movimiento: number;
  id_prestamo: number | null;
  id_material: number;
  nombre_material: string;
  cantidad: number;
  observacion: string | null;
  fecha_movimiento: string;
  tipo_movimiento: string;
  nombre_categoria: string;
}

type Pestaña = "resumen" | "historial" | "seguridad";

function Perfil() {
  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const API = `${API_URL}/api`;
  const token = localStorage.getItem("token");

  const [pestana, setPestana] = useState<Pestaña>("resumen");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [filtroPrestamo, setFiltroPrestamo] = useState("todos");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const encabezados = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Consultar los datos del perfil
  const cargarPerfil = async () => {
    const respuesta = await fetch(`${API}/usuarios/perfil`, {
      headers: encabezados,
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "No se pudo cargar el perfil");
    }

    const usuarioActual = datos.usuario as Usuario;

    setUsuario(usuarioActual);
    setNombre(usuarioActual.nombre_usuario);
    setApellido(usuarioActual.apellido_usuario);
    setCorreo(usuarioActual.correo_usuario);
  };

  // Consultar historial de préstamos
  const cargarPrestamos = async () => {
    const respuesta = await fetch(`${API}/prestamos/historial`, {
      headers: encabezados,
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "No se pudo cargar el historial");
    }

    setPrestamos(datos.historial || []);
  };

  // Consultar movimientos recientes
  const cargarMovimientos = async () => {
    const respuesta = await fetch(`${API}/movimientos/perfil`, {
      headers: encabezados,
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "No se pudieron cargar los movimientos");
    }

    setMovimientos(datos.movimientos || []);
  };

  useEffect(() => {
    if (!token) {
      setError("No se encontró una sesión activa. Inicia sesión nuevamente.");
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        await Promise.all([
          cargarPerfil(),
          cargarPrestamos(),
          cargarMovimientos(),
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar el perfil"
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Actualizar información personal
  const actualizarDatos = async () => {
    setMensaje("");
    setError("");

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setError("Todos los campos editables son obligatorios");
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await fetch(`${API}/usuarios/perfil`, {
        method: "PUT",
        headers: encabezados,
        body: JSON.stringify({
          nombre_usuario: nombre,
          apellido_usuario: apellido,
          correo_usuario: correo,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudieron actualizar los datos");
      }

      setUsuario(datos.usuario);
      setNombre(datos.usuario.nombre_usuario);
      setApellido(datos.usuario.apellido_usuario);
      setCorreo(datos.usuario.correo_usuario);

      setMensaje("Tus datos se actualizaron correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar contraseña
  const cambiarContrasena = async () => {
    setMensaje("");
    setError("");

    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setError("Completa todos los campos de contraseña");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError("La nueva contraseña debe tener mínimo 8 caracteres");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await fetch(`${API}/usuarios/perfil/contrasena`, {
        method: "PUT",
        headers: encabezados,
        body: JSON.stringify({
          contrasenaActual,
          nuevaContrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo cambiar la contraseña");
      }

      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

      setMensaje("Contraseña actualizada correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Pendiente";

    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const iniciales = usuario
    ? `${usuario.nombre_usuario.charAt(0)}${usuario.apellido_usuario.charAt(0)}`.toUpperCase()
    : "U";

  const prestamosFiltrados = prestamos.filter((prestamo) => {
    if (filtroPrestamo === "todos") return true;
    return prestamo.estado === filtroPrestamo;
  });

  const totalPendientes = prestamos.filter(
    (prestamo) => prestamo.estado === "pendiente"
  ).length;

  const totalDevueltos = prestamos.filter(
    (prestamo) => prestamo.estado === "devuelto"
  ).length;

  if (cargando) {
    return (
      <div className="pagina-con-footer">
        <Navbar />
        <main className="perfil-cargando">
          <div className="perfil-spinner"></div>
          <p>Cargando información del perfil...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pagina-con-footer">
      <Navbar />

      <main className="perfil-page">
        <div className="perfil-contenedor">

          <header className="perfil-encabezado">
            <div>
              <span className="perfil-etiqueta">CUENTA PERSONAL</span>
              <h1>Mi perfil</h1>
              <p>Consulta y administra tu información personal.</p>
            </div>

            <button
              className="perfil-boton-actualizar"
              onClick={actualizarDatos}
              disabled={guardando || !usuario}
            >
              {guardando ? "Guardando..." : "Actualizar datos"}
            </button>
          </header>

          {mensaje && (
            <div className="perfil-mensaje perfil-mensaje-exito">
              <span>✓</span> {mensaje}
            </div>
          )}

          {error && (
            <div className="perfil-mensaje perfil-mensaje-error">
              <span>!</span> {error}
            </div>
          )}

          {usuario && (
            <div className="perfil-layout">

              {/* PANEL IZQUIERDO */}
              <aside className="perfil-tarjeta-usuario">

                <div className="perfil-avatar">
                  {iniciales}
                </div>

                <h2>
                  {usuario.nombre_usuario} {usuario.apellido_usuario}
                </h2>

                <span className="perfil-rol">
                  {usuario.rol}
                </span>

                <div className="perfil-identificacion">
                  <span>DOCUMENTO DE IDENTIDAD</span>
                  <strong>{usuario.documento_usuario}</strong>
                </div>

                <div className="perfil-sesion">
                  <span className="perfil-punto-activo"></span>
                  Sesión activa
                </div>

                <div className="perfil-resumen-contadores">
                  <div>
                    <strong>{totalPendientes}</strong>
                    <span>Pendientes</span>
                  </div>

                  <div>
                    <strong>{totalDevueltos}</strong>
                    <span>Devueltos</span>
                  </div>
                </div>

              </aside>

              {/* PANEL DERECHO */}
              <section className="perfil-panel">

                <nav className="perfil-pestanas">
                  <button
                    className={pestana === "resumen" ? "activa" : ""}
                    onClick={() => {
                      setPestana("resumen");
                      setMensaje("");
                      setError("");
                    }}
                  >
                    Resumen
                  </button>

                  <button
                    className={pestana === "historial" ? "activa" : ""}
                    onClick={() => {
                      setPestana("historial");
                      setMensaje("");
                      setError("");
                    }}
                  >
                    Historial de préstamos
                  </button>

                  <button
                    className={pestana === "seguridad" ? "activa" : ""}
                    onClick={() => {
                      setPestana("seguridad");
                      setMensaje("");
                      setError("");
                    }}
                  >
                    Seguridad y acceso
                  </button>
                </nav>

                {/* RESUMEN */}
                {pestana === "resumen" && (
                  <div className="perfil-seccion">

                    <div className="perfil-seccion-titulo">
                      <h2>Información general</h2>
                      <p>Consulta y actualiza tus datos personales.</p>
                    </div>

                    <div className="perfil-formulario">

                      <div className="perfil-campo">
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          maxLength={100}
                        />
                      </div>

                      <div className="perfil-campo">
                        <label>Apellido</label>
                        <input
                          type="text"
                          value={apellido}
                          onChange={(e) => setApellido(e.target.value)}
                          maxLength={100}
                        />
                      </div>

                      <div className="perfil-campo">
                        <label>Correo electrónico</label>
                        <input
                          type="email"
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          maxLength={100}
                        />
                      </div>

                      <div className="perfil-campo">
                        <label>Documento</label>
                        <input
                          type="text"
                          value={usuario.documento_usuario}
                          readOnly
                          disabled
                        />
                        <small>Este dato no se puede modificar.</small>
                      </div>

                      <div className="perfil-campo">
                        <label>Rol asignado</label>
                        <input
                          type="text"
                          value={usuario.rol}
                          readOnly
                          disabled
                        />
                      </div>

                    </div>

                    <div className="perfil-boton-contenedor">
                      <button
                        className="perfil-boton-guardar"
                        onClick={actualizarDatos}
                        disabled={guardando}
                      >
                        {guardando ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>

                    {/* MOVIMIENTOS RECIENTES */}
                    <div className="perfil-seccion-movimientos">
                      <div className="perfil-seccion-titulo">
                        <h2>Movimientos recientes</h2>
                        <p>Últimas actividades registradas en el sistema.</p>
                      </div>

                      {movimientos.length === 0 ? (
                        <div className="perfil-vacio">
                          No tienes movimientos registrados.
                        </div>
                      ) : (
                        <div className="perfil-lista-movimientos">
                          {movimientos.slice(0, 5).map((movimiento) => (
                            <div
                              className="perfil-movimiento-item"
                              key={movimiento.id_movimiento}
                            >
                              <div
                                className={`perfil-movimiento-icono ${
                                  movimiento.tipo_movimiento === "entrada"
                                    ? "entrada"
                                    : "salida"
                                }`}
                              >
                                {movimiento.tipo_movimiento === "entrada" ? "↓" : "↑"}
                              </div>

                              <div className="perfil-movimiento-info">
                                <strong>{movimiento.nombre_material}</strong>
                                <span>
                                  {movimiento.tipo_movimiento} · {movimiento.observacion || "Sin observación"}
                                </span>
                              </div>

                              <div className="perfil-movimiento-detalle">
                                <strong>
                                  {movimiento.tipo_movimiento === "entrada" ? "+" : "-"}
                                  {movimiento.cantidad}
                                </strong>
                                <span>{formatearFecha(movimiento.fecha_movimiento)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* HISTORIAL */}
                {pestana === "historial" && (
                  <div className="perfil-seccion">

                    <div className="perfil-seccion-titulo">
                      <h2>Historial de préstamos</h2>
                      <p>Consulta los materiales que has solicitado.</p>
                    </div>

                    <div className="perfil-historial-resumen">
                      <div>
                        <strong>{prestamos.length}</strong>
                        <span>Total de préstamos</span>
                      </div>

                      <div>
                        <strong>{totalPendientes}</strong>
                        <span>Pendientes</span>
                      </div>

                      <div>
                        <strong>{totalDevueltos}</strong>
                        <span>Devueltos</span>
                      </div>
                    </div>

                    <div className="perfil-filtros">
                      <button
                        className={filtroPrestamo === "todos" ? "activo" : ""}
                        onClick={() => setFiltroPrestamo("todos")}
                      >
                        Todos
                      </button>

                      <button
                        className={filtroPrestamo === "pendiente" ? "activo" : ""}
                        onClick={() => setFiltroPrestamo("pendiente")}
                      >
                        Pendientes
                      </button>

                      <button
                        className={filtroPrestamo === "devuelto" ? "activo" : ""}
                        onClick={() => setFiltroPrestamo("devuelto")}
                      >
                        Devueltos
                      </button>
                    </div>

                    {prestamosFiltrados.length === 0 ? (
                      <div className="perfil-vacio">
                        No hay préstamos para mostrar.
                      </div>
                    ) : (
                      <div className="perfil-tabla-contenedor">
                        <table className="perfil-tabla">
                          <thead>
                            <tr>
                              <th>Préstamo</th>
                              <th>Material</th>
                              <th>Cantidad</th>
                              <th>Fecha préstamo</th>
                              <th>Devolución</th>
                              <th>Estado</th>
                            </tr>
                          </thead>

                          <tbody>
                            {prestamosFiltrados.map((prestamo) => (
                              <tr key={`${prestamo.id_prestamo}-${prestamo.id_material}`}>
                                <td>#{prestamo.id_prestamo}</td>
                                <td>{prestamo.nombre_material}</td>
                                <td>{prestamo.cantidad}</td>
                                <td>{formatearFecha(prestamo.fecha_prestamo)}</td>
                                <td>{formatearFecha(prestamo.fecha_devolucion)}</td>
                                <td>
                                  <span
                                    className={`perfil-estado ${
                                      prestamo.estado === "devuelto"
                                        ? "devuelto"
                                        : "pendiente"
                                    }`}
                                  >
                                    <span></span>
                                    {prestamo.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                )}

                {/* SEGURIDAD */}
                {pestana === "seguridad" && (
                  <div className="perfil-seccion">

                    <div className="perfil-seccion-titulo">
                      <h2>Seguridad y acceso</h2>
                      <p>Administra la contraseña de tu cuenta.</p>
                    </div>

                    <div className="perfil-seguridad-card">
                      <div className="perfil-seguridad-icono">
                        <span>🔒</span>
                      </div>

                      <div>
                        <h3>Cambiar contraseña</h3>
                        <p>
                          Para proteger tu cuenta, verifica tu contraseña actual
                          antes de establecer una nueva.
                        </p>
                      </div>
                    </div>

                    <div className="perfil-formulario perfil-formulario-seguridad">

                      <div className="perfil-campo perfil-campo-completo">
                        <label>Contraseña actual</label>
                        <input
                          type="password"
                          value={contrasenaActual}
                          onChange={(e) => setContrasenaActual(e.target.value)}
                          autoComplete="current-password"
                          placeholder="Ingresa tu contraseña actual"
                        />
                      </div>

                      <div className="perfil-campo perfil-campo-completo">
                        <label>Nueva contraseña</label>
                        <input
                          type="password"
                          value={nuevaContrasena}
                          onChange={(e) => setNuevaContrasena(e.target.value)}
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                        />
                      </div>

                      <div className="perfil-campo perfil-campo-completo">
                        <label>Confirmar nueva contraseña</label>
                        <input
                          type="password"
                          value={confirmarContrasena}
                          onChange={(e) => setConfirmarContrasena(e.target.value)}
                          autoComplete="new-password"
                          placeholder="Repite la nueva contraseña"
                        />
                      </div>

                    </div>

                    <button
                      className="perfil-boton-guardar"
                      onClick={cambiarContrasena}
                      disabled={guardando}
                    >
                      {guardando ? "Actualizando..." : "Actualizar contraseña"}
                    </button>

                    <div className="perfil-sesion-info">
                      <span className="perfil-punto-activo"></span>
                      <div>
                        <strong>Sesión actual</strong>
                        <p>Tu cuenta tiene una sesión autenticada en STOCKIA.</p>
                      </div>
                    </div>

                  </div>
                )}

              </section>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Perfil;
