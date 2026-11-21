import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoStockia from "../assets/Stockia Logo.png";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "../styles/login.css";

interface RespuestaRecuperacion {
  mensaje?: string;
}

function Login() {
  const navigate = useNavigate();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);
  const [docRecuperar, setDocRecuperar] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formulario = event.currentTarget;

    const documento = (
      formulario.elements.namedItem("documento") as HTMLInputElement
    ).value;

    const contrasena = (
      formulario.elements.namedItem("contrasena") as HTMLInputElement
    ).value;

    try {
      const respuesta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento,
          contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.mensaje);
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      if (datos.usuario.rol === "Coordinador") {
        navigate("/dashboard");
      } else {
        navigate("/productos");
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el servidor");
    }
  };

  const abrirModalRecuperacion = () => {
    setDocRecuperar("");
    setNuevaContrasena("");
    setConfirmarContrasena("");
    setModalRecuperarAbierto(true);
  };

  const cerrarModalRecuperacion = () => {
    if (!enviandoRecuperacion) {
      setModalRecuperarAbierto(false);
    }
  };

  const handleRecuperarContrasena = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (nuevaContrasena.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setEnviandoRecuperacion(true);
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/login/recuperar-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documento: docRecuperar.trim(),
            nuevaContrasena,
          }),
        }
      );

      const datos: RespuestaRecuperacion = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.mensaje || "No se pudo recuperar la contraseña.");
        return;
      }

      alert(
        datos.mensaje ||
          "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
      );
      setModalRecuperarAbierto(false);
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo conectar con el servidor para recuperar la contraseña."
      );
    } finally {
      setEnviandoRecuperacion(false);
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
              alt="SENA | Stockia"
              className="login-badge-logo"
            />
          </div>

          <h1>Inicio de sesión</h1>
          <p className="login-subtitle">
            Gestión de Inventario y Préstamos de Materiales
          </p>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="tipo-doc">Tipo de documento</label>

              <div className="login-input-wrapper">
                <select id="tipo-doc" name="tipo-doc" required defaultValue="">
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

      {modalRecuperarAbierto && (
        <div
          className="recuperar-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-recuperar"
        >
          <div className="recuperar-modal">
            <h2 id="titulo-recuperar">Recuperar contraseña</h2>
            <p className="recuperar-desc">
              Ingresa tu número de documento y define tu nueva contraseña.
            </p>

            <form onSubmit={handleRecuperarContrasena}>
              <div className="login-field">
                <label htmlFor="doc-recuperar">Número de documento</label>
                <div className="login-input-wrapper">
                  <input
                    id="doc-recuperar"
                    type="text"
                    value={docRecuperar}
                    onChange={(e) => setDocRecuperar(e.target.value)}
                    placeholder="Tu número de documento"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="nueva-contrasena">Nueva contraseña</label>
                <div className="login-input-wrapper">
                  <input
                    id="nueva-contrasena"
                    type="password"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
                <div className="login-input-wrapper">
                  <input
                    id="confirmar-contrasena"
                    type="password"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>
              </div>

              <div className="recuperar-acciones">
                <button
                  type="submit"
                  className="login-submit"
                  disabled={enviandoRecuperacion}
                >
                  {enviandoRecuperacion
                    ? "Guardando..."
                    : "Actualizar contraseña"}
                </button>

                <button
                  type="button"
                  className="recuperar-cancelar"
                  onClick={cerrarModalRecuperacion}
                  disabled={enviandoRecuperacion}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="login-footer">
        <span>Stockia · Sistema de Almacén Técnico SENA</span>
        <span>Acceso autorizado para administrativo e instructores</span>
      </footer>
    </div>
  );
}

export default Login;