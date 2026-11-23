
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/usuarios.css";

interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  documento_usuario: string;
  correo_usuario: string;
  rol: string;
}

interface FormularioUsuario {
  nombre_usuario: string;
  apellido_usuario: string;
  documento_usuario: string;
  correo_usuario: string;
  contrasena: string;
  rol: string;
}

function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const [formulario, setFormulario] = useState<FormularioUsuario>({
    nombre_usuario: "",
    apellido_usuario: "",
    documento_usuario: "",
    correo_usuario: "",
    contrasena: "",
    rol: "Instructor",
  });

  // Obtener usuarios
  const obtenerUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/usuarios",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudieron consultar los usuarios"
        );
      }

      setUsuarios(datos);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "Error al consultar usuarios"
      );

      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Manejar cambios del formulario
  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  // Cancelar registro
  const cancelarRegistro = () => {
    setMostrarFormulario(false);
    setMensaje("");
    setTipoMensaje("");

    setFormulario({
      nombre_usuario: "",
      apellido_usuario: "",
      documento_usuario: "",
      correo_usuario: "",
      contrasena: "",
      rol: "Instructor",
    });
  };

  // Crear usuario
  const crearUsuario = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    try {
      setGuardando(true);

      const token = localStorage.getItem("token");

      const respuesta = await fetch(
        "http://localhost:3000/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formulario),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo crear el usuario"
        );
      }

      setMensaje("Usuario creado correctamente.");
      setTipoMensaje("exito");

      setFormulario({
        nombre_usuario: "",
        apellido_usuario: "",
        documento_usuario: "",
        correo_usuario: "",
        contrasena: "",
        rol: "Instructor",
      });

      await obtenerUsuarios();

      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al crear usuario:", error);

      setMensaje(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el usuario"
      );

      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  // Separar usuarios por rol y ordenar alfabéticamente
  const coordinadores = usuarios
    .filter((usuario) => usuario.rol === "Coordinador")
    .sort((a, b) =>
      a.nombre_usuario.localeCompare(b.nombre_usuario)
    );

  const instructores = usuarios
    .filter((usuario) => usuario.rol === "Instructor")
    .sort((a, b) =>
      a.nombre_usuario.localeCompare(b.nombre_usuario)
    );

  return (
    <div className="pagina-con-footer">
      <Navbar />

      <main className="users-section">
        <h1>Gestión de usuarios</h1>

        {/* BOTÓN PARA REGISTRAR USUARIOS */}
        <div className="users-actions">
          <button
            type="button"
            className="btn-registrar-usuario"
            onClick={() => {
              setMensaje("");
              setTipoMensaje("");
              setMostrarFormulario(true);
            }}
          >
            + Registrar usuario
          </button>
        </div>

        {/* MENSAJES */}
        {mensaje && (
          <p className={`mensaje-usuario ${tipoMensaje}`}>
            {mensaje}
          </p>
        )}

        {/* FORMULARIO DE REGISTRO */}
        {mostrarFormulario && (
          <section className="users-form-section">
            <h2>Registrar nuevo usuario</h2>

            <form
              onSubmit={crearUsuario}
              className="users-form"
              autoComplete="off"
            >
              <div className="users-form-group">
                <label htmlFor="nombre_usuario">
                  Nombre
                </label>

                <input
                  type="text"
                  id="nombre_usuario"
                  name="nombre_usuario"
                  value={formulario.nombre_usuario}
                  onChange={manejarCambio}
                  placeholder="Ingrese el nombre"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="apellido_usuario">
                  Apellido
                </label>

                <input
                  type="text"
                  id="apellido_usuario"
                  name="apellido_usuario"
                  value={formulario.apellido_usuario}
                  onChange={manejarCambio}
                  placeholder="Ingrese el apellido"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="documento_usuario">
                  Documento
                </label>

                <input
                  type="text"
                  id="documento_usuario"
                  name="documento_usuario"
                  value={formulario.documento_usuario}
                  onChange={manejarCambio}
                  placeholder="Ingrese el documento"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="correo_usuario">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  id="correo_usuario"
                  name="correo_usuario"
                  value={formulario.correo_usuario}
                  onChange={manejarCambio}
                  placeholder="Ingrese el correo"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="contrasena">
                  Contraseña
                </label>

                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={formulario.contrasena}
                  onChange={manejarCambio}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <div className="users-form-group">
                <label htmlFor="rol">
                  Rol del usuario
                </label>

                <select
                  id="rol"
                  name="rol"
                  value={formulario.rol}
                  onChange={manejarCambio}
                  required
                >
                  <option value="Instructor">
                    Instructor
                  </option>

                  <option value="Coordinador">
                    Coordinador
                  </option>
                </select>
              </div>

              <div className="users-form-buttons">
                <button
                  type="submit"
                  disabled={guardando}
                >
                  {guardando
                    ? "Registrando..."
                    : "Crear usuario"}
                </button>

                <button
                  type="button"
                  className="btn-cancelar-usuario"
                  onClick={cancelarRegistro}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* USUARIOS SEPARADOS POR ROL */}
        <section className="users-table-section">
          <h2>Usuarios registrados</h2>

          {cargando ? (
            <p>Cargando usuarios...</p>
          ) : (
            <>
              {/* SECCIÓN DE COORDINADORES */}
              <div className="grupo-usuarios">
                <h3>
                  Coordinadores ({coordinadores.length})
                </h3>

                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Documento</th>
                      <th>Correo</th>
                      <th>Rol</th>
                    </tr>
                  </thead>

                  <tbody>
                    {coordinadores.length > 0 ? (
                      coordinadores.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                          <td>{usuario.nombre_usuario}</td>
                          <td>{usuario.apellido_usuario}</td>
                          <td>{usuario.documento_usuario}</td>
                          <td>{usuario.correo_usuario}</td>
                          <td>{usuario.rol}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          No hay coordinadores registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* SECCIÓN DE INSTRUCTORES */}
              <div className="grupo-usuarios">
                <h3>
                  Instructores ({instructores.length})
                </h3>

                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Documento</th>
                      <th>Correo</th>
                      <th>Rol</th>
                    </tr>
                  </thead>

                  <tbody>
                    {instructores.length > 0 ? (
                      instructores.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                          <td>{usuario.nombre_usuario}</td>
                          <td>{usuario.apellido_usuario}</td>
                          <td>{usuario.documento_usuario}</td>
                          <td>{usuario.correo_usuario}</td>
                          <td>{usuario.rol}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          No hay instructores registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Users;
