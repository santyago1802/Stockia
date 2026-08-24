import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoStockia from "../assets/LOGO-Stockia.png";


function Login() {
const navigate = useNavigate();

const handleLogin = (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();
navigate("/productos");
};

return (
    <>
    <div className="login-page">
        <div className="wrapper">
            <form onSubmit={handleLogin}>
                <img src={logoStockia} alt="Logo Stockia" className="logo" />
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
                    <input type="text" placeholder="Usuario" required />
                    <i className='bx bxs-user'></i>
                </div>

                <div className="input-box">
                    <input type="password" placeholder="Contraseña" required />
                    <i className='bx bxs-lock-alt'></i>
                </div>
                <div className="forgot">
                    <a href="#">Olvidate tu contraseña?</a>
                </div>
                <button type="submit" className="btn">Entrar</button>

            </form>
        </div>
    </div>
    </>
  );
}

export default Login;