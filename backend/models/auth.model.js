const pool = require("../db/pool");

// Buscar usuario por documento
const obtenerUsuarioPorDocumento = async (documento) => {
  const resultado = await pool.query(
    `
    SELECT
      id_usuario,
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      contrasena_hash,
      rol
    FROM usuario
    WHERE documento_usuario = $1
    `,
    [documento]
  );

  return resultado.rows[0];
};

module.exports = {
  obtenerUsuarioPorDocumento,
};