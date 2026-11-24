
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import logoStockia from "../assets/Stockia Logo.png";
import "../styles/login.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function NuevaContraseña() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() || "";

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "exito" | "">("");

  const handleRestablecer = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (cargando) return;

    setMensaje("");
    setTipoMensaje("");

    if (!token) {
      setMensaje("El enlace de recuperación no contiene un token válido.");
      setTipoMensaje("error");
      return;
    }

    if (nuevaContrasena.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      setTipoMensaje("error");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje("Las contraseñas no coinciden.");
      setTipoMensaje("error");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/api/login/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            nuevaContrasena,
          }),
        }
      );

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setMensaje(
          datos.mensaje || "No se pudo actualizar la contraseña."
        );
        setTipoMensaje("error");
        return;
      }

      setMensaje(
        datos.mensaje ||
          "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
      );

      setTipoMensaje("exito");

      setNuevaContrasena("");
      setConfirmarContrasena("");

    } catch (error) {
      console.error("Error al restablecer contraseña:", error);

      setMensaje("No se pudo conectar con el servidor.");
      setTipoMensaje("error");

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">

      <header className="login-header">
        <div className="login-location">
          <span className="location-dot"></span>
          Sede CGMLTI
        </div>
      </header>

      <main className="login-main">
        <div className="login-card">

          <div className="login-badge">
            <img
              src={logoStockia}
              alt="Stockia"
              className="login-badge-logo"
            />
          </div>

          <h1>Nueva contraseña</h1>

          <p className="login-subtitle">
            Crea una nueva contraseña para recuperar el acceso a tu cuenta.
          </p>

          {!token ? (
            <>
              <p className="mensaje-recuperacion error" role="alert">
                El enlace no contiene un token de recuperación.
              </p>

              <button
                type="button"
                className="login-submit"
                onClick={() => navigate("/")}
              >
                Volver al inicio de sesión
              </button>
            </>
          ) : tipoMensaje === "exito" ? (
            <>
              <p className="mensaje-recuperacion exito" role="status">
                {mensaje}
              </p>

              <button
                type="button"
                className="login-submit"
                onClick={() => navigate("/")}
              >
                Ir al inicio de sesión
              </button>
            </>
          ) : (
            <form onSubmit={handleRestablecer}>

              <div className="login-field">
                <label htmlFor="nueva-contrasena">
                  Nueva contraseña
                </label>

                <div className="login-input-wrapper">
                  <input
                    id="nueva-contrasena"
                    type={mostrarContrasena ? "text" : "password"}
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                    autoComplete="new-password"
                    disabled={cargando}
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
                    disabled={cargando}
                  >
                    <i
                      className={
                        mostrarContrasena ? "bx bx-hide" : "bx bx-show"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="confirmar-contrasena">
                  Confirmar contraseña
                </label>

                <div className="login-input-wrapper">
                  <input
                    id="confirmar-contrasena"
                    type={mostrarConfirmacion ? "text" : "password"}
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
                    minLength={6}
                    required
                    autoComplete="new-password"
                    disabled={cargando}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      mostrarConfirmacion
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setMostrarConfirmacion(!mostrarConfirmacion)
                    }
                    disabled={cargando}
                  >
                    <i
                      className={
                        mostrarConfirmacion ? "bx bx-hide" : "bx bx-show"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              {mensaje && (
                <p
                  className={`mensaje-recuperacion ${tipoMensaje}`}
                  role="alert"
                >
                  {mensaje}
                </p>
              )}

              <div className="recuperar-acciones">
                <button
                  type="submit"
                  className="login-submit"
                  disabled={cargando}
                >
                  {cargando
                    ? "Actualizando..."
                    : "Actualizar contraseña"}
                </button>

                <button
                  type="button"
                  className="recuperar-cancelar"
                  onClick={() => navigate("/")}
                  disabled={cargando}
                >
                  Volver al inicio de sesión
                </button>
              </div>

            </form>
          )}
        </div>
      </main>

      <footer className="login-footer">
        <span>Stockia · Sistema de Almacén Técnico SENA</span>
        <span>
          Acceso autorizado para administrativo e instructores
        </span>
      </footer>

    </div>
  );
}

export default NuevaContraseña;
