-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-04-2026 a las 18:27:33
-- Versión del servidor: 8.0.45
-- Versión de PHP: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ucad_ticket`
--
CREATE DATABASE IF NOT EXISTS `ucad_ticket` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `ucad_ticket`;

DELIMITER $$
--
-- Procedimientos
--
DROP PROCEDURE IF EXISTS `sp_cambiar_estado_ticket`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cambiar_estado_ticket` (IN `p_ticket_id` INT, IN `p_estado_nuevo` INT, IN `p_usuario_id` INT, IN `p_ip` VARCHAR(45))   BEGIN
    DECLARE v_estado_anterior INT;

    SELECT estado_id INTO v_estado_anterior FROM tickets WHERE id = p_ticket_id;

    UPDATE tickets
    SET estado_id = p_estado_nuevo,
        fecha_actualizacion = NOW()
    WHERE id = p_ticket_id;

    CALL sp_registrar_accion(p_usuario_id, NULL, p_ip, 'UPDATE', 'tickets', 'estado_id', v_estado_anterior, p_estado_nuevo);
END$$

DROP PROCEDURE IF EXISTS `sp_crear_ticket`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_ticket` (IN `p_titulo` VARCHAR(255), IN `p_descripcion` TEXT, IN `p_usuario_id` INT, IN `p_estado_id` INT, IN `p_prioridad_id` INT, IN `p_categoria_id` INT, IN `p_departamento_id` INT, IN `p_ip` VARCHAR(45))   BEGIN
    DECLARE v_ticket_id INT;

    INSERT INTO tickets (titulo, descripcion, usuario_id, estado_id, prioridad_id, categoria_id, departamento_id)
    VALUES (p_titulo, p_descripcion, p_usuario_id, p_estado_id, p_prioridad_id, p_categoria_id, p_departamento_id);

    SET v_ticket_id = LAST_INSERT_ID();

    CALL sp_registrar_accion(p_usuario_id, NULL, p_ip, 'INSERT', 'tickets', 'id', NULL, v_ticket_id);
END$$

DROP PROCEDURE IF EXISTS `sp_crear_usuario`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_usuario` (IN `p_nombre` VARCHAR(100), IN `p_correo` VARCHAR(100), IN `p_usuario` VARCHAR(50), IN `p_hash` VARCHAR(255), IN `p_rol_id` INT, IN `p_departamento_id` INT, IN `p_ip` VARCHAR(45))   BEGIN
    DECLARE v_id INT;

    INSERT INTO usuarios (nombre, correo, usuario, contrasena_hash, rol_id, departamento_id)
    VALUES (p_nombre, p_correo, p_usuario, p_hash, p_rol_id, p_departamento_id);

    SET v_id = LAST_INSERT_ID();

    CALL sp_registrar_accion(v_id, p_usuario, p_ip, 'INSERT', 'usuarios', 'usuario', NULL, p_usuario);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_accion`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_accion` (IN `p_usuario_id` INT, IN `p_usuario_texto` VARCHAR(50), IN `p_ip` VARCHAR(45), IN `p_accion_nombre` VARCHAR(50), IN `p_tabla` VARCHAR(50), IN `p_campo` VARCHAR(100), IN `p_valor_anterior` TEXT, IN `p_valor_nuevo` TEXT)   BEGIN
    DECLARE v_accion_id INT;
    DECLARE v_bitacora_id INT;
    DECLARE v_json JSON;

    SELECT id INTO v_accion_id FROM tipos_accion WHERE nombre = p_accion_nombre LIMIT 1;

    INSERT INTO bitacora (usuario_id, usuario_texto, ip, accion_id, tabla_afectada)
    VALUES (p_usuario_id, p_usuario_texto, p_ip, v_accion_id, p_tabla);

    SET v_bitacora_id = LAST_INSERT_ID();

    SET v_json = JSON_OBJECT(
        'tabla', p_tabla,
        'campo', p_campo,
        'antes', p_valor_anterior,
        'despues', p_valor_nuevo
    );

    INSERT INTO detalle_bitacora (bitacora_id, campo, valor_anterior, valor_nuevo, cambios_json)
    VALUES (v_bitacora_id, p_campo, p_valor_anterior, p_valor_nuevo, v_json);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones_ticket`
--

DROP TABLE IF EXISTS `asignaciones_ticket`;
CREATE TABLE IF NOT EXISTS `asignaciones_ticket` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID de asignación',
  `ticket_id` int NOT NULL COMMENT 'ID del ticket',
  `tecnico_id` int NOT NULL COMMENT 'Usuario técnico asignado',
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de asignación',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Indica si la asignación está activa',
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `tecnico_id` (`tecnico_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Asignación de técnicos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora`
--

DROP TABLE IF EXISTS `bitacora`;
CREATE TABLE IF NOT EXISTS `bitacora` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID de bitácora',
  `usuario_id` int DEFAULT NULL COMMENT 'Usuario que ejecuta acción',
  `usuario_texto` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Usuario en texto',
  `ip` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'IP del cliente',
  `accion_id` int DEFAULT NULL COMMENT 'Tipo de acción',
  `tabla_afectada` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tabla afectada',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de acción',
  PRIMARY KEY (`id`),
  KEY `accion_id` (`accion_id`),
  KEY `idx_bitacora_usuario` (`usuario_id`),
  KEY `idx_bitacora_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bitácora del sistema';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID de categoría',
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre de categoría',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Categorías de tickets';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE IF NOT EXISTS `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del comentario',
  `ticket_id` int NOT NULL COMMENT 'Ticket asociado',
  `usuario_id` int NOT NULL COMMENT 'Usuario que comenta',
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Contenido del comentario',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_comentarios_ticket` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Comentarios de tickets';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
CREATE TABLE IF NOT EXISTS `departamentos` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del departamento',
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del departamento',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Departamentos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_bitacora`
--

DROP TABLE IF EXISTS `detalle_bitacora`;
CREATE TABLE IF NOT EXISTS `detalle_bitacora` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del detalle',
  `bitacora_id` int NOT NULL COMMENT 'Referencia a bitácora',
  `campo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Campo modificado',
  `valor_anterior` text COLLATE utf8mb4_general_ci COMMENT 'Valor anterior',
  `valor_nuevo` text COLLATE utf8mb4_general_ci COMMENT 'Valor nuevo',
  `cambios_json` json DEFAULT NULL COMMENT 'Snapshot del cambio',
  PRIMARY KEY (`id`),
  KEY `bitacora_id` (`bitacora_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Detalle de cambios';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_ticket`
--

DROP TABLE IF EXISTS `estados_ticket`;
CREATE TABLE IF NOT EXISTS `estados_ticket` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del estado',
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del estado',
  `es_final` tinyint(1) DEFAULT '0' COMMENT 'Indica si es estado final',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Estados del ticket';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_ticket`
--

DROP TABLE IF EXISTS `historial_ticket`;
CREATE TABLE IF NOT EXISTS `historial_ticket` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del historial',
  `ticket_id` int NOT NULL COMMENT 'Ticket afectado',
  `cambiado_por` int DEFAULT NULL COMMENT 'Usuario que realizó el cambio',
  `estado_anterior` int DEFAULT NULL COMMENT 'Estado anterior',
  `estado_nuevo` int DEFAULT NULL COMMENT 'Nuevo estado',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio',
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `cambiado_por` (`cambiado_por`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Historial de estados';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID de notificación',
  `usuario_id` int NOT NULL COMMENT 'Usuario destino',
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Mensaje',
  `leido` tinyint(1) DEFAULT '0' COMMENT 'Indica si fue leído',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha',
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_usuario` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Notificaciones';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

DROP TABLE IF EXISTS `permisos`;
CREATE TABLE IF NOT EXISTS `permisos` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del permiso',
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del permiso',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Permisos del sistema';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prioridades`
--

DROP TABLE IF EXISTS `prioridades`;
CREATE TABLE IF NOT EXISTS `prioridades` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID de prioridad',
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre de prioridad',
  `nivel` int NOT NULL COMMENT 'Nivel numérico de prioridad',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Prioridades';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del rol',
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del rol',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Roles del sistema';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
CREATE TABLE IF NOT EXISTS `rol_permiso` (
  `rol_id` int NOT NULL COMMENT 'ID del rol',
  `permiso_id` int NOT NULL COMMENT 'ID del permiso',
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `permiso_id` (`permiso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Relación roles-permisos';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sla_ticket`
--

DROP TABLE IF EXISTS `sla_ticket`;
CREATE TABLE IF NOT EXISTS `sla_ticket` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del SLA',
  `ticket_id` int NOT NULL COMMENT 'Ticket asociado',
  `fecha_limite_respuesta` datetime DEFAULT NULL COMMENT 'Tiempo límite de respuesta',
  `fecha_limite_resolucion` datetime DEFAULT NULL COMMENT 'Tiempo límite de resolución',
  `respondido_en` datetime DEFAULT NULL COMMENT 'Fecha real de respuesta',
  `resuelto_en` datetime DEFAULT NULL COMMENT 'Fecha real de resolución',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='SLA de tickets';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tickets`
--

DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del ticket',
  `titulo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Título del ticket',
  `descripcion` text COLLATE utf8mb4_general_ci COMMENT 'Descripción detallada',
  `usuario_id` int NOT NULL COMMENT 'Usuario que crea el ticket',
  `estado_id` int NOT NULL COMMENT 'Estado actual',
  `prioridad_id` int NOT NULL COMMENT 'Prioridad del ticket',
  `categoria_id` int DEFAULT NULL COMMENT 'Categoría del ticket',
  `departamento_id` int DEFAULT NULL COMMENT 'Departamento asociado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `fecha_actualizacion` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización',
  `eliminado_en` timestamp NULL DEFAULT NULL COMMENT 'Eliminación lógica',
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `departamento_id` (`departamento_id`),
  KEY `idx_ticket_usuario` (`usuario_id`),
  KEY `idx_ticket_estado` (`estado_id`),
  KEY `idx_ticket_prioridad` (`prioridad_id`),
  KEY `idx_ticket_fecha` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tickets';

--
-- Disparadores `tickets`
--
DROP TRIGGER IF EXISTS `trg_historial_estado`;
DELIMITER $$
CREATE TRIGGER `trg_historial_estado` AFTER UPDATE ON `tickets` FOR EACH ROW BEGIN
    IF OLD.estado_id <> NEW.estado_id THEN
        INSERT INTO historial_ticket(ticket_id, cambiado_por, estado_anterior, estado_nuevo)
        VALUES (NEW.id, NEW.usuario_id, OLD.estado_id, NEW.estado_id);
    END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_ticket_insert`;
DELIMITER $$
CREATE TRIGGER `trg_ticket_insert` AFTER INSERT ON `tickets` FOR EACH ROW BEGIN
    INSERT INTO bitacora(usuario_id, ip, accion_id, tabla_afectada)
    VALUES (NEW.usuario_id, 'AUTO', 1, 'tickets');
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_ticket_update`;
DELIMITER $$
CREATE TRIGGER `trg_ticket_update` AFTER UPDATE ON `tickets` FOR EACH ROW BEGIN
    INSERT INTO bitacora(usuario_id, ip, accion_id, tabla_afectada)
    VALUES (NEW.usuario_id, 'AUTO', 2, 'tickets');
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_accion`
--

DROP TABLE IF EXISTS `tipos_accion`;
CREATE TABLE IF NOT EXISTS `tipos_accion` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del tipo de acción',
  `nombre` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre de la acción',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tipos de acciones de bitácora';

--
-- Volcado de datos para la tabla `tipos_accion`
--

INSERT INTO `tipos_accion` (`id`, `nombre`) VALUES
(3, 'DELETE'),
(1, 'INSERT'),
(4, 'LOGIN'),
(6, 'LOGIN_FALLIDO'),
(5, 'LOGOUT'),
(2, 'UPDATE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID del usuario',
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre completo',
  `correo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Correo electrónico',
  `usuario` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre de usuario',
  `contrasena_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Contraseña hasheada (bcrypt/argon2)',
  `rol_id` int DEFAULT NULL COMMENT 'Rol del usuario',
  `departamento_id` int DEFAULT NULL COMMENT 'Departamento asociado',
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo' COMMENT 'Estado del usuario',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  `eliminado_en` timestamp NULL DEFAULT NULL COMMENT 'Fecha de eliminación lógica',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `rol_id` (`rol_id`),
  KEY `departamento_id` (`departamento_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Usuarios del sistema';

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_tickets_activos`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_tickets_activos`;
CREATE TABLE IF NOT EXISTS `vista_tickets_activos` (
`categoria_id` int
,`departamento_id` int
,`descripcion` text
,`eliminado_en` timestamp
,`estado_id` int
,`fecha_actualizacion` timestamp
,`fecha_creacion` timestamp
,`id` int
,`prioridad_id` int
,`titulo` varchar(255)
,`usuario_id` int
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_tickets_activos`
--
DROP TABLE IF EXISTS `vista_tickets_activos`;

DROP VIEW IF EXISTS `vista_tickets_activos`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_tickets_activos`  AS SELECT `tickets`.`id` AS `id`, `tickets`.`titulo` AS `titulo`, `tickets`.`descripcion` AS `descripcion`, `tickets`.`usuario_id` AS `usuario_id`, `tickets`.`estado_id` AS `estado_id`, `tickets`.`prioridad_id` AS `prioridad_id`, `tickets`.`categoria_id` AS `categoria_id`, `tickets`.`departamento_id` AS `departamento_id`, `tickets`.`fecha_creacion` AS `fecha_creacion`, `tickets`.`fecha_actualizacion` AS `fecha_actualizacion`, `tickets`.`eliminado_en` AS `eliminado_en` FROM `tickets` WHERE (`tickets`.`eliminado_en` is null)  ;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignaciones_ticket`
--
ALTER TABLE `asignaciones_ticket`
  ADD CONSTRAINT `asignaciones_ticket_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `asignaciones_ticket_ibfk_2` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `bitacora_ibfk_2` FOREIGN KEY (`accion_id`) REFERENCES `tipos_accion` (`id`);

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `detalle_bitacora`
--
ALTER TABLE `detalle_bitacora`
  ADD CONSTRAINT `detalle_bitacora_ibfk_1` FOREIGN KEY (`bitacora_id`) REFERENCES `bitacora` (`id`);

--
-- Filtros para la tabla `historial_ticket`
--
ALTER TABLE `historial_ticket`
  ADD CONSTRAINT `historial_ticket_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `historial_ticket_ibfk_2` FOREIGN KEY (`cambiado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD CONSTRAINT `rol_permiso_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `rol_permiso_ibfk_2` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`);

--
-- Filtros para la tabla `sla_ticket`
--
ALTER TABLE `sla_ticket`
  ADD CONSTRAINT `sla_ticket_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`);

--
-- Filtros para la tabla `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`estado_id`) REFERENCES `estados_ticket` (`id`),
  ADD CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`prioridad_id`) REFERENCES `prioridades` (`id`),
  ADD CONSTRAINT `tickets_ibfk_4` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  ADD CONSTRAINT `tickets_ibfk_5` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
