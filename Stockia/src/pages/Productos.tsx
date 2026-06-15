

function Productos() {
    return (
        <div>
            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid navbar-container">
                    <a className="navbar-brand">Stockia</a>
                    <form className="d-flex" role="search">
                    <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
                    <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
            </nav>
            <div>
                <h1>Productos</h1>
                <p>Bienvenido a la página de productos.</p>
            </div>

            <div className="products-section">
                <div className="card-grid">
                    <div className="card">
                        <img src="https://compucentro.co/wp-content/uploads/D_NQ_NP_2X_849908-MLA91863387531_092025-F.png" alt="imagen de material" className="card-img"/>
                        <div className="card-body">
                            <h6 className="card-title">Card Title</h6>
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            <button className="btn btn-primary">Solicitar</button>
                        </div>
                    </div>

                    <div className="card">
                        <img src="https://compucentro.co/wp-content/uploads/D_NQ_NP_2X_849908-MLA91863387531_092025-F.png" alt="imagen de material" className="card-img"/>
                        <div className="card-body">
                            <h6 className="card-title">Card Title</h6>
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            <button className="btn btn-primary">Solicitar</button>
                        </div>
                    </div>

                    <div className="card">
                        <img src="https://compucentro.co/wp-content/uploads/D_NQ_NP_2X_849908-MLA91863387531_092025-F.png" alt="imagen de material" className="card-img"/>
                        <div className="card-body">
                            <h6 className="card-title">Card Title</h6>
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                            <button className="btn btn-primary">Solicitar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Productos;