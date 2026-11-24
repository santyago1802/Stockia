
const nodemailer = require("nodemailer");

// ==========================================
// VALIDAR CONFIGURACIÓN SMTP
// ==========================================
const variablesRequeridas = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM",
];

const variablesFaltantes = variablesRequeridas.filter(
  (variable) => !process.env[variable]
);

if (variablesFaltantes.length > 0) {
  throw new Error(
    `Faltan variables SMTP en el archivo .env: ${variablesFaltantes.join(", ")}`
  );
}

// ==========================================
// CONFIGURACIÓN DEL TRANSPORTE DE GMAIL
// ==========================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================================
// ESCAPAR TEXTO PARA HTML
// ==========================================
const escaparHTML = (texto) => {
  return String(texto || "").replace(/[&<>"']/g, (caracter) => {
    const caracteres = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return caracteres[caracter];
  });
};

// ==========================================
// VERIFICAR CONEXIÓN SMTP
// ==========================================
const verificarConexionCorreo = async () => {
  try {
    await transporter.verify();
    console.log("Servidor SMTP conectado correctamente");
    return true;
  } catch (error) {
    console.error("Error al conectar con SMTP:", error.message);
    throw error;
  }
};

// ==========================================
// ENVIAR CORREO DE RECUPERACIÓN
// ==========================================
const enviarCorreoRecuperacion = async (
  correoDestino,
  nombreUsuario,
  enlaceRecuperacion
) => {
  const nombreSeguro = escaparHTML(nombreUsuario);
  const enlaceSeguro = escaparHTML(enlaceRecuperacion);

  const resultado = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: correoDestino,
    subject: "Recuperación de contraseña - Stockia",

    text: `
Hola ${nombreUsuario},

Recibimos una solicitud para restablecer tu contraseña de Stockia.

Para crear una nueva contraseña, ingresa al siguiente enlace:

${enlaceRecuperacion}

Este enlace vence en 15 minutos y solo puede utilizarse una vez.

Si no solicitaste este cambio, puedes ignorar este mensaje.

Equipo Stockia
    `,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; color: #222;">

        <h2 style="color: #198754;">
          Recuperación de contraseña
        </h2>

        <p>Hola <strong>${nombreSeguro}</strong>,</p>

        <p>
          Recibimos una solicitud para restablecer tu contraseña de Stockia.
        </p>

        <p>
          Haz clic en el siguiente botón para crear una nueva contraseña:
        </p>

        <a
          href="${enlaceSeguro}"
          style="display: inline-block; padding: 12px 22px; background-color: #198754; color: white; text-decoration: none; border-radius: 6px;"
        >
          Restablecer contraseña
        </a>

        <p style="margin-top: 25px;">
          Este enlace vence en <strong>15 minutos</strong> y solo puede utilizarse una vez.
        </p>

        <p>
          Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>

        <hr>

        <p style="color: #777;">
          Equipo Stockia
        </p>

      </div>
    `,
  });

  console.log("Correo de recuperación enviado:", resultado.messageId);

  return resultado;
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================
module.exports = {
  enviarCorreoRecuperacion,
  verificarConexionCorreo,
};
