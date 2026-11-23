const pool = require("../db/pool");

// Consultar usuarios
const obtenerUsuarios = async () => {
  const resultado = await pool.query(`
    SELECT
      id_usuario,
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      correo_usuario,
      rol
    FROM usuario
    ORDER BY id_usuario
  `);

  return resultado.rows;
};

// Crear usuario
const crearUsuario = async (usuario) => {
  const {
    nombre_usuario,
    apellido_usuario,
    documento_usuario,
    correo_usuario,
    contrasena_hash,
    rol,
  } = usuario;

  const resultado = await pool.query(
    `INSERT INTO usuario (
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      correo_usuario,
      contrasena_hash,
      rol
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id_usuario,
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      correo_usuario,
      rol`,
    [
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      correo_usuario,
      contrasena_hash,
      rol,
    ]
  );

  return resultado.rows[0];
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
};