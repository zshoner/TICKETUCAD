<?php

    require_once __DIR__ . "/../php/conexion.php";

    try {
        if (!$conexion) {
            throw new Exception("No se pudo establecer la conexión.");
        }

        $tecnicos = [];
        $deptos = [];
        $estados = [];

        $sql_tec = "SELECT id, nombre FROM usuarios WHERE rol_id = 2 ORDER BY nombre ASC";
        $res_tec = mysqli_query($conexion, $sql_tec);
        if ($res_tec) {
            while ($row = mysqli_fetch_assoc($res_tec)) {
                $tecnicos[] = $row;
            }
            mysqli_free_result($res_tec);
        }

        $sql_dep = "SELECT id, nombre FROM departamentos ORDER BY nombre ASC";
        $res_dep = mysqli_query($conexion, $sql_dep);
        if ($res_dep) {
            while ($row = mysqli_fetch_assoc($res_dep)) {
                $deptos[] = $row;
            }
            mysqli_free_result($res_dep);
        }

        $sql_est = "SELECT nombre FROM estados_ticket ORDER BY id ASC";
        $res_est = mysqli_query($conexion, $sql_est);
        if ($res_est) {
            while ($row = mysqli_fetch_assoc($res_est)) {
                $estados[] = $row;
            }
            mysqli_free_result($res_est);
        }

        ob_clean();
        echo json_encode([
            'status' => 'success',
            'tecnicos' => $tecnicos,
            'departamentos' => $deptos,
            'estados' => $estados
        ]);

    } catch (Exception $e) {
        ob_clean();
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
    exit;
?>