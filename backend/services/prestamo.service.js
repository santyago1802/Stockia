const prestamoModel = require("../models/prestamo.model");

// Registrar préstamo
const crearPrestamo = async (
  id_usuario,
  id_material,
  cantidad
) => {
  return await prestamoModel.crearPrestamo(
    id_usuario,
    id_material,
    cantidad
  );
};

// Consultar préstamos
const obtenerPrestamos = async () => {
  return await prestamoModel.obtenerPrestamos();
};

// Devolver préstamo
const devolverPrestamo = async (id) => {
  return await prestamoModel.devolverPrestamo(id);
};

module.exports = {
  crearPrestamo,
  obtenerPrestamos,
  devolverPrestamo,
};