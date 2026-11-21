
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoStockia from "../assets/Stockia Logo.png";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "../styles/login.css";



function Login() {
  const navigate = useNavigate();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

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
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="login-submit">
              Entrar
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <span>Stockia · Sistema de Almacén Técnico SENA</span>
        <span>Acceso autorizado para administrativo e instructores</span>
      </footer>
    </div>
  );
}

export default Login;
