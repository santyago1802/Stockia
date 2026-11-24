
const pool = require("../db/pool");

// ==========================================
// BUSCAR USUARIO POR DOCUMENTO
// ==========================================
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

// ==========================================
// BUSCAR USUARIO POR CORREO
// ==========================================
const obtenerUsuarioPorCorreo = async (correo) => {
  const resultado = await pool.query(
    `
    SELECT
      id_usuario,
      nombre_usuario,
      apellido_usuario,
      correo_usuario
    FROM usuario
    WHERE LOWER(correo_usuario) = LOWER($1)
    `,
    [correo]
  );

  return resultado.rows[0];
};

// ==========================================
// INVALIDAR TOKENS ANTERIORES
// ==========================================
const invalidarTokensAnteriores = async (idUsuario) => {
  await pool.query(
    `
    UPDATE recuperacion_contrasena_token
    SET used_at = CURRENT_TIMESTAMP
    WHERE id_usuario = $1
      AND used_at IS NULL
    `,
    [idUsuario]
  );
};

// ==========================================
// CREAR TOKEN DE RECUPERACIÓN
// ==========================================
const crearTokenRecuperacion = async (
  idUsuario,
  tokenHash,
  fechaExpiracion
) => {
  const resultado = await pool.query(
    `
    INSERT INTO recuperacion_contrasena_token (
      id_usuario,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    RETURNING id
    `,
    [idUsuario, tokenHash, fechaExpiracion]
  );

  return resultado.rows[0];
};

// ==========================================
// BUSCAR TOKEN VÁLIDO
// ==========================================
const obtenerTokenValido = async (tokenHash) => {
  const resultado = await pool.query(
    `
    SELECT
      id,
      id_usuario,
      expires_at
    FROM recuperacion_contrasena_token
    WHERE token_hash = $1
      AND used_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    `,
    [tokenHash]
  );

  return resultado.rows[0];
};

// ==========================================
// ACTUALIZAR CONTRASEÑA Y CONSUMIR TOKEN
// ==========================================
const actualizarContrasenaConToken = async (
  idUsuario,
  tokenId,
  nuevaContrasenaHash
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Bloquear y volver a validar el token
    const token = await client.query(
      `
      SELECT id
      FROM recuperacion_contrasena_token
      WHERE id = $1
        AND id_usuario = $2
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      FOR UPDATE
      `,
      [tokenId, idUsuario]
    );

    if (token.rowCount === 0) {
      const error = new Error(
        "El enlace de recuperación no es válido o ha expirado"
      );
      error.status = 400;
      throw error;
    }

    // Actualizar contraseña
    const usuario = await client.query(
      `
      UPDATE usuario
      SET contrasena_hash = $1
      WHERE id_usuario = $2
      RETURNING id_usuario
      `,
      [nuevaContrasenaHash, idUsuario]
    );

    if (usuario.rowCount === 0) {
      throw new Error("No se encontró el usuario");
    }

    // Consumir token
    await client.query(
      `
      UPDATE recuperacion_contrasena_token
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [tokenId]
    );

    await client.query("COMMIT");

    return true;

  } catch (error) {
    // Intentar revertir la transacción sin ocultar el error original
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Error al revertir la transacción:",
        rollbackError
      );
    }

    throw error;

  } finally {
    client.release();
  }
};

// ==========================================
// INVALIDAR UN TOKEN ESPECÍFICO
// ==========================================
const invalidarTokenPorId = async (tokenId) => {
  await pool.query(
    `
    UPDATE recuperacion_contrasena_token
    SET used_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND used_at IS NULL
    `,
    [tokenId]
  );
};

module.exports = {
  obtenerUsuarioPorDocumento,
  obtenerUsuarioPorCorreo,
  invalidarTokensAnteriores,
  crearTokenRecuperacion,
  obtenerTokenValido,
  actualizarContrasenaConToken,
  invalidarTokenPorId,
};
