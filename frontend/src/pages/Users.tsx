import Navbar from "../components/layout/Navbar";

import Sidebar from "../components/layout/Sidebar";



function Users() {
  return (
    <div>
      <Navbar />

      <div className="container">
        <Sidebar />

        <main>
          <h1>Usuarios</h1>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
              </tr>
            </thead>

            <tbody>
             
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}

export default Users;