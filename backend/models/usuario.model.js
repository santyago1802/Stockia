const pool = require("../db/pool");

// Consultar usuarios
const obtenerUsuarios = async () => {
  const resultado = await pool.query(`
    SELECT
      id_usuario,
      nombre_usuario,
      apellido_usuario,
      rol
    FROM usuario
    ORDER BY id_usuario
  `);

  return resultado.rows;
};

module.exports = {
  obtenerUsuarios,
};