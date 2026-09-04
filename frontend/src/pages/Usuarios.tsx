import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";

interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  rol: string;
}

function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/usuarios"
        );

        const datos = await respuesta.json();

        setUsuarios(datos);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuarios();
  }, []);

  if (cargando) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div>
      <Navbar />

      <main className="users-section">
        <h1>Usuarios</h1>

        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Rol</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>{usuario.nombre_usuario}</td>
                <td>{usuario.apellido_usuario}</td>
                <td>{usuario.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default Users;