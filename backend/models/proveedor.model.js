const pool = require("../db/pool");

// Consultar proveedores
const obtenerProveedores = async () => {
  const resultado = await pool.query(`
    SELECT
      id_proveedor,
      nombre_proveedor
    FROM proveedor
    ORDER BY nombre_proveedor
  `);

  return resultado.rows;
};

module.exports = {
  obtenerProveedores,
};