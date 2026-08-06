import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <>
    <div className="login-page">
        <div className="wrapper">
            <form action="">
                <h1>Login</h1>

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
                    <input type="text" placeholder="Username" required />
                    <i className='bx bxs-user'></i>
                </div>

                <div className="input-box">
                    <input type="password" placeholder="Password" required />
                    <i className='bx bxs-lock-alt'></i>
                </div>
                <div className="forgot">
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" className="btn">Login</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="#">Register</a></p>
                </div>
            </form>
        </div>
    </div>
    </>
  );
}

export default Login;