
const pool = require("../db/pool");

// Consultar todos los usuarios
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

// Consultar perfil por ID del usuario autenticado
const obtenerPerfilPorId = async (id_usuario) => {
  const resultado = await pool.query(
    `SELECT
      id_usuario,
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      correo_usuario,
      rol
    FROM usuario
    WHERE id_usuario = $1`,
    [id_usuario]
  );

  return resultado.rows[0];
};

// Actualizar nombre, apellido y correo del perfil
const actualizarPerfil = async (id_usuario, datos) => {
  const {
    nombre_usuario,
    apellido_usuario,
    correo_usuario,
  } = datos;

  const resultado = await pool.query(
    `UPDATE usuario
     SET
       nombre_usuario = $1,
       apellido_usuario = $2,
       correo_usuario = $3
     WHERE id_usuario = $4
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
      correo_usuario,
      id_usuario,
    ]
  );

  return resultado.rows[0];
};

// Consultar hash de contraseña para verificar la contraseña actual
const obtenerContrasenaHashPorId = async (id_usuario) => {
  const resultado = await pool.query(
    `SELECT contrasena_hash
     FROM usuario
     WHERE id_usuario = $1`,
    [id_usuario]
  );

  return resultado.rows[0];
};

// Actualizar contraseña del usuario autenticado
const actualizarContrasenaPorId = async (
  id_usuario,
  nuevaContrasenaHash
) => {
  const resultado = await pool.query(
    `UPDATE usuario
     SET contrasena_hash = $1
     WHERE id_usuario = $2
     RETURNING id_usuario`,
    [nuevaContrasenaHash, id_usuario]
  );

  return resultado.rows[0];
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  obtenerPerfilPorId,
  actualizarPerfil,
  obtenerContrasenaHashPorId,
  actualizarContrasenaPorId,
};
