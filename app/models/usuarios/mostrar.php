<?php
require_once '../php/conexion.php';

try {
    $params        = $_POST;
    $limit         = intval($params['length']);
    $start         = intval($params['start']);
    $order_col_idx = intval($params['order'][0]['column']);
    $order_dir     = $params['order'][0]['dir'] === 'asc' ? 'ASC' : 'DESC';
    $query         = ($params['search']['value'] != "") ? '%' . mysqli_real_escape_string($conexion, $params['search']['value']) . '%' : '%';

    $columnas  = ['u.id', 'u.nombre', 'u.correo', 'r.nombre', 'u.estado', 'u.fecha_creacion'];
    $order_col = $columnas[$order_col_idx] ?? 'u.id';

    $sql = "SELECT SQL_CALC_FOUND_ROWS
                u.id, u.nombre, u.correo, u.usuario,
                r.nombre AS rol, r.id AS rol_id,
                u.estado, u.fecha_creacion
            FROM usuarios u
            LEFT JOIN roles r ON r.id = u.rol_id
            WHERE u.eliminado_en IS NULL
            AND (
                u.nombre  LIKE '$query'
                OR u.correo LIKE '$query'
                OR u.usuario LIKE '$query'
                OR r.nombre LIKE '$query'
            )
            ORDER BY $order_col $order_dir
            LIMIT $start, $limit";

    $resultado = mysqli_query($conexion, $sql);
    $data = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $data[] = $fila;
    }

    $conteo = mysqli_query($conexion, "SELECT FOUND_ROWS() as total");
    $total  = mysqli_fetch_assoc($conteo)['total'];

    $response = [
        'data'            => $data,
        'recordsTotal'    => intval($total),
        'recordsFiltered' => intval($total),
    ];

} catch (Exception $e) {
    $response = [
        'data'            => [],
        'recordsTotal'    => 0,
        'recordsFiltered' => 0,
        'error'           => $e->getMessage()
    ];
}

echo json_encode($response);
