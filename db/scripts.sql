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
    imagen_material VARCHAR(255),
    cantidad_material INTEGER CHECK (cantidad_material >= 0)  NOT NULL,
    stock_minimo INTEGER CHECK (stock_minimo >= 0) NOT NULL,
    fecha_ingreso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_proveedor INTEGER REFERENCES proveedor(id_proveedor) NOT NULL,
    id_categoria INTEGER REFERENCES categoria(id_categoria) NOT NULL
);

CREATE TABLE prestamo_material (
    id_prestamo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    id_usuario INTEGER REFERENCES usuario(id_usuario) NOT NULL,
    fecha_prestamo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP,
    cantidad_prestada INTEGER CHECK (cantidad_prestada > 0) NOT NULL,
    cantidad_devuelta INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT chk_cantidad_devuelta
    CHECK (cantidad_devuelta >= 0 AND cantidad_devuelta <= cantidad_prestada)
);

CREATE TABLE movimiento_inventario (
    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_material INTEGER REFERENCES material(id_material) NOT NULL,
    tipo_movimiento VARCHAR(10) 
        CHECK (tipo_movimiento IN ('entrada', 'salida')) NOT NULL,
    cantidad_movimiento INTEGER
        CHECK (cantidad_movimiento > 0) NOT NULL,
    fecha_movimiento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INTEGER REFERENCES usuario(id_usuario) NOT NULL
);


