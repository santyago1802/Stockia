import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Navbar from "../components/layout/Navbar";

interface Material {
  id_material: number;
  nombre_material: string;
  descripcion_material: string;
  stock_actual: number;
  stock_minimo: number;
}

function Productos() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  //Guardamos los materiales
  //materiales será la lista que recibimos desde PostgreSQL.
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1); //Cantidad: guarda cuántas unidades quiere solicitar
  const [materialSeleccionado, setMaterialSeleccionado] = //materialSeleccionado: guarda que producto escogio
  useState<Material | null>(null); 

  useEffect(() => {//la consulta se ejecute cuando se carga la página.
    const obtenerMateriales = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/materiales"
        );

        const datos = await respuesta.json();

        setMateriales(datos);
      } catch (error) {
        console.error("Error al obtener materiales:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerMateriales();
  }, []);

const solicitarMaterial = async () => {
  if (!materialSeleccionado) {
    return;
  }

  const usuarioGuardado = localStorage.getItem("usuario"); //Lee el usuario que guardamos durante el Login

  if (!usuarioGuardado) {
    alert("Debes iniciar sesión");
    return;
  }

  const usuario = JSON.parse(usuarioGuardado);

  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/prestamos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_material: materialSeleccionado.id_material,
          cantidad: cantidad,
        }),
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.mensaje);
      return;
    }

    alert("Préstamo registrado correctamente");

    setMaterialSeleccionado(null);
    setCantidad(1);

    // Actualizar nuevamente los materiales
    const materialesActualizados = await fetch(
      "http://localhost:3000/api/materiales"
    );

    const nuevosDatos = await materialesActualizados.json();

    setMateriales(nuevosDatos);
  } catch (error) {
    console.error(error);
    alert("No se pudo registrar el préstamo");
  }
};
  if (cargando) {
    return <p>Cargando materiales...</p>;
  }

  return (
    <div>
      <Navbar />

      <div className="products-section">
        {materialSeleccionado && ( 
            //Solo muestra este formulario si el usuario seleccionó un material
  <div className="solicitud-box">
    <h2>Solicitar</h2>

    <p>
      <strong>{materialSeleccionado.nombre_material}</strong>
    </p>

    <p>
      Stock disponible: {materialSeleccionado.stock_actual}
    </p>

    <label>
      Cantidad:
      <input
        type="number"
        min="1"
        max={materialSeleccionado.stock_actual} //evita que 
        //desde la interfaz intentemos solicitar más de lo disponible
        value={cantidad}
        onChange={(event) =>
          setCantidad(Number(event.target.value))
        }
      />
    </label>

    <button
      className="btn btn-primary"
      onClick={solicitarMaterial}
    >
      Confirmar préstamo
    </button>

    <button
      className="btn"
      onClick={() => {
        setMaterialSeleccionado(null);
        setCantidad(1);
      }}
    >
      Cancelar
    </button>
  </div>
)}
        <div className="card-grid">

          {materiales.map((material) => ( //map recorre los 30 materiales
            <Card
              key={material.id_material}
              title={material.nombre_material}
            >
              <div className="card-body">

                <p className="card-text">
                  {material.descripcion_material}
                </p>

                <p className="card-text">
                  <strong>Stock actual:</strong>{" "}
                  {material.stock_actual} 
                </p> 

                <p className="card-text">
                  <strong>Stock mínimo:</strong>{" "}
                  {material.stock_minimo}
                </p>

                {material.stock_actual <= material.stock_minimo && (
                    ////Si el stock actual es menor o igual al stock mínimo  
                  <p className="card-text">
                    ⚠️ Stock bajo
                  </p>
                )}

                <button
                className="btn btn-primary"
                onClick={() => setMaterialSeleccionado(material)}
                //Cuando hacemos clic
                //guardamos el material que seleccionamos
                >
                Solicitar
                </button>

              </div>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
}

export default Productos;