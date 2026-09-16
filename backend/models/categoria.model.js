const pool = require("../db/pool");

// Consultar categorías
const obtenerCategorias = async () => {
  const resultado = await pool.query(`
    SELECT
      id_categoria,
      nombre_categoria
    FROM categoria
    ORDER BY nombre_categoria
  `);

  return resultado.rows;
};

module.exports = {
  obtenerCategorias,
};