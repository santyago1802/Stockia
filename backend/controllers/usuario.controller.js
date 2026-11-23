
const usuarioService = require("../services/usuario.service");

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();
    return res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    return res.status(500).json({
      mensaje: "No se pudieron consultar los usuarios",
    });
  }
};

// Crear usuario
const crearUsuario = async (req, res) => {
  try {
    const {
      nombre_usuario,
      apellido_usuario,
      documento_usuario,
      correo_usuario,
      contrasena,
      rol,
    } = req.body;

    if (
      !nombre_usuario ||
      !apellido_usuario ||
      !documento_usuario ||
      !correo_usuario ||
      !contrasena ||
      !rol
    ) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    if (!["Coordinador", "Instructor"].includes(rol)) {
      return res.status(400).json({
        mensaje: "El rol seleccionado no es válido",
      });
    }

    if (contrasena.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener mínimo 8 caracteres",
      });
    }

    const usuario = await usuarioService.crearUsuario(req.body);

    return res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje: "El documento o correo electrónico ya está registrado",
      });
    }

    return res.status(500).json({
      mensaje: "No se pudo crear el usuario",
    });
  }
};

// Consultar perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const usuario = await usuarioService.obtenerPerfil(id_usuario);

    return res.json({
      mensaje: "Perfil consultado correctamente",
      usuario,
    });
  } catch (error) {
    console.error("Error al consultar perfil:", error);

    return res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo consultar el perfil",
    });
  }
};

// Actualizar datos personales
const actualizarPerfil = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const usuario = await usuarioService.actualizarPerfil(
      id_usuario,
      req.body
    );

    return res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        mensaje: "El correo electrónico ya está registrado",
      });
    }

    return res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo actualizar el perfil",
    });
  }
};

// Cambiar contraseña
const cambiarContrasena = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const { contrasenaActual, nuevaContrasena } = req.body;

    const resultado = await usuarioService.cambiarContrasena(
      id_usuario,
      contrasenaActual,
      nuevaContrasena
    );

    return res.json(resultado);
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);

    return res.status(error.status || 500).json({
      mensaje: error.message || "No se pudo cambiar la contraseña",
    });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
};
