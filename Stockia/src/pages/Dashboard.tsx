import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import Card from "../components/ui/Card";

function Dashboard() {
  return (
    <div>
      <Navbar />

      <div className="container">
        <Sidebar />

        <main>
          <h1>Dashboard</h1>

          <Card title="Ventas Totales">
            <p>$15,000</p>
          </Card>

          <Card title="Usuarios Activos">
            <p>250</p>
          </Card>

          <Card title="Pedidos">
            <p>1,200</p>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;