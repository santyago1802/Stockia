\set QUIET on
-- create database de Stockia
CREATE TABLE categoria (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_categoria VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO categoria (nombre_categoria) 
VALUES
('Herramientas'),
('Material electrico'),
('Tornilleria'),
('Elementos de seguridad'),
('Material de mantenimiento');

CREATE TABLE proveedor (
    id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_proveedor VARCHAR(100) UNIQUE NOT NULL,
    telefono_proveedor VARCHAR(20) NOT NULL,
    correo_proveedor VARCHAR(100) UNIQUE NOT NULL
);

CREATE TYPE tipo_rol AS ENUM (
    'Coordinador', 
    'Instructor'
);

CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    apellido_usuario VARCHAR(100) NOT NULL,
    documento_usuario VARCHAR(20) UNIQUE NOT NULL,
    correo_usuario VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(100) NOT NULL,
    rol tipo_rol NOT NULL
);

CREATE TABLE material (
    id_material INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_material VARCHAR(100) UNIQUE NOT NULL,
    descripcion_material TEXT,
    id_categoria INTEGER REFERENCES categoria(id_categoria) NOT NULL
);
CREATE TABLE detalle_proveedor (
    id_detalle_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    id_proveedor INTEGER REFERENCES proveedor(id_proveedor) NOT NULL,
    fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stock_minimo INTEGER CHECK (stock_minimo >= 0) NOT NULL,
    cantidad INTEGER CHECK (cantidad >= 0) NOT NULL
);


CREATE TABLE prestamo (
    id_prestamo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuario(id_usuario) NOT NULL,
    fecha_prestamo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP,
    estado VARCHAR(10) CHECK (estado IN ('pendiente', 'devuelto')) NOT NULL
);

CREATE TABLE detalle_prestamo (
    id_prestamo INTEGER REFERENCES prestamo(id_prestamo) NOT NULL,
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    cantidad INTEGER CHECK (cantidad > 0) NOT NULL
);

CREATE TABLE movimiento (
    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_prestamo INTEGER REFERENCES prestamo(id_prestamo),
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    cantidad INTEGER
        CHECK (cantidad > 0) NOT NULL,
    observacion TEXT,
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INTEGER REFERENCES usuario(id_usuario) NOT NULL
);

CREATE TABLE tipo_movimiento (
    id_tipo_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo_movimiento VARCHAR(10) 
        CHECK (tipo_movimiento IN ('entrada', 'salida')) NOT NULL,
);

