const usuarioService = require("../services/usuario.service");

// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
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

module.exports = {
  obtenerUsuarios,
  crearUsuario,
};