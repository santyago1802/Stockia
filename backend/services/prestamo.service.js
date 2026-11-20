const prestamoModel = require("../models/prestamo.model");

// Registrar préstamo
const crearPrestamo = (
  id_usuario,
  id_material,
  cantidad
) => {
  return prestamoModel.crearPrestamo(
    id_usuario,
    id_material,
    cantidad
  );
};

// Consultar préstamos
const obtenerPrestamos = () => {
  return prestamoModel.obtenerPrestamos();
};

// Devolver préstamo
const devolverPrestamo = (id, id_usuario) => {
  return prestamoModel.devolverPrestamo(
    id,
    id_usuario
  );
};

module.exports = {
  crearPrestamo,
  obtenerPrestamos,
  devolverPrestamo,
};