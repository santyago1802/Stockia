const prestamoService = require("../services/prestamo.service");

// Registrar préstamo
const crearPrestamo = async (req, res) => {
  try {
    const { id_material, cantidad } = req.body;

    // El usuario se obtiene del JWT, no del frontend
    const id_usuario = req.usuario.id_usuario;

    // Validar material
    if (!Number.isInteger(Number(id_material)) || Number(id_material) <= 0) {
      return res.status(400).json({
        mensaje: "El material seleccionado no es válido",
      });
    }

    // Validar cantidad
    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0) {
      return res.status(400).json({
        mensaje: "La cantidad debe ser un número entero mayor que 0",
      });
    }

    const id_prestamo = await prestamoService.crearPrestamo(
      id_usuario,
      Number(id_material),
      Number(cantidad)
    );

    res.status(201).json({
      mensaje: "Préstamo registrado correctamente",
      id_prestamo,
    });
  } catch (error) {
    console.error("Error al registrar préstamo:", error);

    res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo registrar el préstamo",
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

    res.status(error.status || 500).json({
      mensaje: error.message || "No se pudieron consultar los préstamos",
    });
  }
};

// Devolver préstamo
const devolverPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    // Validar ID del préstamo
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "El ID del préstamo no es válido",
      });
    }

    await prestamoService.devolverPrestamo(
      Number(id),
      id_usuario
    );

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