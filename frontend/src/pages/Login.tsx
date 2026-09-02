import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoStockia from "../assets/Stockia Logo.jpeg";


function Login() {
const navigate = useNavigate();

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
    //async permite que el login espere la respuesta del backend
    const respuesta = await fetch("http://localhost:3000/api/login", {
        //envía la petición al backend.
      method: "POST",
      //indica que estamos enviando información.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documento,
        contrasena,
        //envía las credenciales.
      }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.mensaje);
      return;
    }

    localStorage.setItem("token", datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));

    navigate("/productos"); //lleva al usuario a la página de productos
  } catch (error) {
    console.error(error);
    alert("No se pudo conectar con el servidor");
  }
};

return (
    <div className="login-page">
        <div className="wrapper">
            <form onSubmit={handleLogin}>
                <img 
                src={logoStockia} 
                alt="Logo Stockia" 
                className="logo" 
                />
                <h1>Inicio de sesión</h1>
            <div className="input-box">
                <select id="tipo-doc" name="tipo-doc" required>
                    <option value="">Tipo de documento</option>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PP">Pasaporte</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="NIT">NIT</option>
                </select>
            </div>
            
            <div className="input-box">
                <input
                    type="text"
                    name="documento"
                    placeholder="Documento"
                    required
                />
            <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
                <input
                    type="password"
                    name="contrasena"
                    placeholder="Contraseña"
                    required
                />
                <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="forgot">
                <a href="#">Olvidate tu contraseña?</a>
            </div>

            <button type="submit" className="btn">
                Entrar
            </button>
        </form>
    </div>
    </div>
  );
}

export default Login;