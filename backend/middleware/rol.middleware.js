const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
      });
    }

    if (req.usuario.rol !== rolPermitido) {
      return res.status(403).json({
        mensaje: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};

module.exports = verificarRol;