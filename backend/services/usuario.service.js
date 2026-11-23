
const bcrypt = require("bcrypt");
const usuarioModel = require("../models/usuario.model");

// Obtener todos los usuarios
const obtenerUsuarios = () => {
  return usuarioModel.obtenerUsuarios();
};

// Crear usuario
const crearUsuario = async (datosUsuario) => {
  const contrasena_hash = await bcrypt.hash(
    datosUsuario.contrasena,
    10
  );

  const usuario = {
    nombre_usuario: datosUsuario.nombre_usuario.trim(),
    apellido_usuario: datosUsuario.apellido_usuario.trim(),
    documento_usuario: datosUsuario.documento_usuario.trim(),
    correo_usuario: datosUsuario.correo_usuario.trim().toLowerCase(),
    contrasena_hash,
    rol: datosUsuario.rol,
  };

  return usuarioModel.crearUsuario(usuario);
};

// Consultar perfil
const obtenerPerfil = async (id_usuario) => {
  const usuario = await usuarioModel.obtenerPerfilPorId(id_usuario);

  if (!usuario) {
    const error = new Error("No se encontró el perfil del usuario");
    error.status = 404;
    throw error;
  }

  return usuario;
};

// Actualizar datos personales
const actualizarPerfil = async (id_usuario, datos) => {
  const nombre_usuario = String(datos.nombre_usuario || "").trim();
  const apellido_usuario = String(datos.apellido_usuario || "").trim();
  const correo_usuario = String(datos.correo_usuario || "")
    .trim()
    .toLowerCase();

  if (!nombre_usuario || !apellido_usuario || !correo_usuario) {
    const error = new Error("Nombre, apellido y correo son obligatorios");
    error.status = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_usuario)) {
    const error = new Error("El correo electrónico no es válido");
    error.status = 400;
    throw error;
  }

  const usuario = await usuarioModel.actualizarPerfil(id_usuario, {
    nombre_usuario,
    apellido_usuario,
    correo_usuario,
  });

  if (!usuario) {
    const error = new Error("No se encontró el perfil del usuario");
    error.status = 404;
    throw error;
  }

  return usuario;
};

// Cambiar contraseña verificando la contraseña actual
const cambiarContrasena = async (
  id_usuario,
  contrasenaActual,
  nuevaContrasena
) => {
  if (!contrasenaActual || !nuevaContrasena) {
    const error = new Error(
      "La contraseña actual y la nueva contraseña son obligatorias"
    );
    error.status = 400;
    throw error;
  }

  if (nuevaContrasena.length < 8) {
    const error = new Error(
      "La nueva contraseña debe tener al menos 8 caracteres"
    );
    error.status = 400;
    throw error;
  }

  const usuario = await usuarioModel.obtenerContrasenaHashPorId(id_usuario);

  if (!usuario) {
    const error = new Error("No se encontró el usuario");
    error.status = 404;
    throw error;
  }

  const contrasenaCorrecta = await bcrypt.compare(
    contrasenaActual,
    usuario.contrasena_hash
  );

  if (!contrasenaCorrecta) {
    const error = new Error("La contraseña actual es incorrecta");
    error.status = 400;
    throw error;
  }

  const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, 10);

  const actualizado = await usuarioModel.actualizarContrasenaPorId(
    id_usuario,
    nuevaContrasenaHash
  );

  if (!actualizado) {
    const error = new Error("No se pudo actualizar la contraseña");
    error.status = 500;
    throw error;
  }

  return {
    mensaje: "Contraseña actualizada correctamente",
  };
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
};
