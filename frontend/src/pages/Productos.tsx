import Card from "../components/ui/Card";
import Navbar from "../components/layout/Navbar";

function Productos() {
    return (
        <div>
            <Navbar />
            <div className="products-section">
                <div className="card-grid">
                    <Card title="Monitor">
                        <img
                            src="https://compucentro.co/wp-content/uploads/D_NQ_NP_2X_849908-MLA91863387531_092025-F.png"
                            alt="Monitor"
                            className="card-img"
                            />

                            <div className="card-body">
                                <p className="card-text">
                                    Monitor para uso de oficina.
                                </p>
                                <button className="btn btn-primary">
                                    Solicitar
                                </button>
                            </div>
                    </Card>
                    </div>
                </div>
            </div>
    );
}

export default Productos;