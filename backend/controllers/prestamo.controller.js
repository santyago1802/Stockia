const prestamoService = require("../services/prestamo.service");

// Registrar préstamo
const crearPrestamo = async (req, res) => {
  try {
    const {
      id_usuario,
      id_material,
      cantidad,
    } = req.body;

    if (!id_usuario || !id_material || !cantidad) {
      return res.status(400).json({
        mensaje: "Usuario, material y cantidad son obligatorios",
      });
    }

    const id_prestamo = await prestamoService.crearPrestamo(
      id_usuario,
      id_material,
      cantidad
    );

    res.status(201).json({
      mensaje: "Préstamo registrado correctamente",
      id_prestamo,
    });
  } catch (error) {
    console.error("Error al registrar préstamo:", error);

    res.status(500).json({
      mensaje: error.message,
    });
  }
};

// Consultar préstamos
const obtenerPrestamos = async (req, res) => {
  try {
    const prestamos = await prestamoService.obtenerPrestamos();

    res.json(prestamos);
  } catch (error) {
    console.error("Error al obtener préstamos:", error);

    res.status(500).json({
      mensaje: "No se pudieron consultar los préstamos",
    });
  }
};

// Devolver préstamo
const devolverPrestamo = async (req, res) => {
  try {
    const { id } = req.params;

    await prestamoService.devolverPrestamo(id);

    res.json({
      mensaje: "Préstamo devuelto correctamente",
    });
  } catch (error) {
    console.error("Error al devolver préstamo:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "Error al devolver el préstamo",
    });
  }
};

module.exports = {
  crearPrestamo,
  obtenerPrestamos,
  devolverPrestamo,
};