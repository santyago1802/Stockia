
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import logoStockia from "../assets/Stockia Logo.png";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "../styles/login.css";

// ==========================================
// CONFIGURACIÓN DE API
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

// ==========================================
// INTERFACES
// ==========================================

interface RespuestaServidor {
  mensaje?: string;
  token?: string;
  usuario?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    rol: string;
  };
}

// ==========================================
// COMPONENTE LOGIN
// ==========================================

function Login() {
  const navigate = useNavigate();

  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estados para recuperar contraseña
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);
  const [correoRecuperar, setCorreoRecuperar] = useState("");
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "exito" | "">("");

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formulario = event.currentTarget;

    const documento = (
      formulario.elements.namedItem("documento") as HTMLInputElement
    ).value.trim();

    const contrasena = (
      formulario.elements.namedItem("contrasena") as HTMLInputElement
    ).value;

    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento,
          contrasena,
        }),
      });

      const datos: RespuestaServidor = await respuesta
        .json()
        .catch(() => ({}));

      if (!respuesta.ok) {
        alert(datos.mensaje || "No se pudo iniciar sesión.");
        return;
      }

      if (!datos.token || !datos.usuario) {
        alert("El servidor no devolvió los datos de autenticación.");
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      if (datos.usuario.rol === "Coordinador") {
        navigate("/dashboard");
      } else if (datos.usuario.rol === "Instructor") {
        navigate("/productos");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        alert("El rol del usuario no está autorizado.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==========================================
  // ABRIR MODAL DE RECUPERACIÓN
  // ==========================================

  const abrirModalRecuperacion = () => {
    setCorreoRecuperar("");
    setMensajeRecuperacion("");
    setTipoMensaje("");
    setModalRecuperarAbierto(true);
  };

  // ==========================================
  // CERRAR MODAL
  // ==========================================

  const cerrarModalRecuperacion = () => {
    if (!enviandoRecuperacion) {
      setModalRecuperarAbierto(false);
      setMensajeRecuperacion("");
      setTipoMensaje("");
    }
  };

  // ==========================================
  // SOLICITAR RECUPERACIÓN POR CORREO
  // ==========================================

  const handleRecuperarContrasena = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (enviandoRecuperacion) return;

    setMensajeRecuperacion("");
    setTipoMensaje("");

    const correo = correoRecuperar.trim();

    if (!correo) {
      setMensajeRecuperacion("Ingresa tu correo electrónico.");
      setTipoMensaje("error");
      return;
    }

    setEnviandoRecuperacion(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/login/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo,
          }),
        }
      );

      const datos: RespuestaServidor = await respuesta
        .json()
        .catch(() => ({}));

      if (!respuesta.ok) {
        setMensajeRecuperacion(
          datos.mensaje || "No se pudo procesar la solicitud."
        );

        setTipoMensaje("error");
        return;
      }

      setMensajeRecuperacion(
        datos.mensaje ||
          "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña."
      );

      setTipoMensaje("exito");
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);

      setMensajeRecuperacion(
        "No se pudo conectar con el servidor. Inténtalo nuevamente."
      );

      setTipoMensaje("error");
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  return (
    <div className="login-page">

      {/* ENCABEZADO */}
      <header className="login-header">
        <div className="login-location">
          <span className="location-dot"></span>
          Sede CGMLTI
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="login-main">
        <div className="login-card">

          {/* LOGO */}
          <div className="login-badge">
            <img
              src={logoStockia}
              alt="SENA | Stockia"
              className="login-badge-logo"
            />
          </div>

          <h1>Inicio de sesión</h1>

          <p className="login-subtitle">
            Gestión de Inventario y Préstamos de Materiales
          </p>

          {/* FORMULARIO DE LOGIN */}
          <form onSubmit={handleLogin}>

            {/* TIPO DE DOCUMENTO */}
            <div className="login-field">
              <label htmlFor="tipo-doc">Tipo de documento</label>

              <div className="login-input-wrapper">
                <select
                  id="tipo-doc"
                  name="tipo-doc"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Tipo de documento
                  </option>
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="PP">Pasaporte</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>
            </div>

            {/* DOCUMENTO */}
            <div className="login-field">
              <label htmlFor="documento">Número de documento</label>

              <div className="login-input-wrapper">
                <input
                  id="documento"
                  type="text"
                  name="documento"
                  placeholder="Número de documento"
                  required
                />

                <i className="bx bx-user"></i>
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div className="login-field">
              <label htmlFor="contrasena">Contraseña</label>

              <div className="login-input-wrapper">
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  name="contrasena"
                  placeholder="Contraseña"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  onClick={() =>
                    setMostrarContrasena(!mostrarContrasena)
                  }
                >
                  <i
                    className={
                      mostrarContrasena
                        ? "bx bx-hide"
                        : "bx bx-show"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* RECUPERAR CONTRASEÑA */}
            <div className="forgot">
              <button
                type="button"
                className="forgot-link-btn"
                onClick={abrirModalRecuperacion}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="login-submit">
              Entrar
            </button>
          </form>
        </div>
      </main>

      {/* MODAL DE RECUPERACIÓN */}
      {modalRecuperarAbierto && (
        <div
          className="recuperar-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-recuperar"
        >
          <div className="recuperar-modal">

            <h2 id="titulo-recuperar">
              Recuperar contraseña
            </h2>

            <p className="recuperar-desc">
              Ingresa el correo electrónico asociado a tu cuenta de Stockia.
              Te enviaremos un enlace para crear una nueva contraseña.
            </p>

            <form onSubmit={handleRecuperarContrasena}>

              <div className="login-field">
                <label htmlFor="correo-recuperar">
                  Correo electrónico
                </label>

                <div className="login-input-wrapper">
                  <input
                    id="correo-recuperar"
                    type="email"
                    value={correoRecuperar}
                    onChange={(e) =>
                      setCorreoRecuperar(e.target.value)
                    }
                    placeholder="usuario@correo.com"
                    autoComplete="email"
                    required
                    disabled={enviandoRecuperacion}
                  />

                  <i className="bx bx-envelope"></i>
                </div>
              </div>

              {/* MENSAJES */}
              {mensajeRecuperacion && (
                <p
                  className={`mensaje-recuperacion ${tipoMensaje}`}
                  role="status"
                  aria-live="polite"
                >
                  {mensajeRecuperacion}
                </p>
              )}

              {/* ACCIONES */}
              <div className="recuperar-acciones">

                <button
                  type="submit"
                  className="login-submit"
                  disabled={enviandoRecuperacion}
                >
                  {enviandoRecuperacion
                    ? "Enviando..."
                    : "Enviar enlace de recuperación"}
                </button>

                <button
                  type="button"
                  className="recuperar-cancelar"
                  onClick={cerrarModalRecuperacion}
                  disabled={enviandoRecuperacion}
                >
                  Volver al inicio de sesión
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIE DE PÁGINA */}
      <footer className="login-footer">
        <span>Stockia · Sistema de Almacén Técnico SENA</span>
        <span>Acceso autorizado para administrativo e instructores</span>
      </footer>

    </div>
  );
}

export default Login;
