
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
const obtenerPrestamos = (
  id_usuario,
  rol
) => {
  return prestamoModel.obtenerPrestamos(
    id_usuario,
    rol
  );
};

// Consultar historial de préstamos de un usuario
const obtenerHistorialPorUsuario = (id_usuario) => {
  return prestamoModel.obtenerHistorialPorUsuario(
    id_usuario
  );
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
  obtenerHistorialPorUsuario,
  devolverPrestamo,
};
