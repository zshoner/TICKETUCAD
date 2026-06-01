<?php

/**
 * Crea notificaciones en BD para el agente asignado y los administradores.
 */
function crearNotificacionesNuevoTicket(PDO $pdo, int $ticketId, string $titulo, ?int $agenteId): void
{
    $mensaje = 'Nuevo ticket #' . $ticketId . ': ' . $titulo;
    $destinatarios = [];

    if ($agenteId) {
        $destinatarios[] = $agenteId;
    }

    $stmtAdmins = $pdo->query("
        SELECT u.id
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.rol_id
        WHERE u.estado = 'activo'
          AND u.eliminado_en IS NULL
          AND (
            LOWER(r.nombre) LIKE '%admin%'
            OR LOWER(r.nombre) IN ('super admin', 'superadmin', 'administrador')
          )
    ");

    while ($row = $stmtAdmins->fetch(PDO::FETCH_ASSOC)) {
        $destinatarios[] = (int) $row['id'];
    }

    $destinatarios = array_values(array_unique(array_filter($destinatarios)));

    if (empty($destinatarios)) {
        return;
    }

    $stmt = $pdo->prepare('INSERT INTO notificaciones (usuario_id, mensaje, leido) VALUES (?, ?, 0)');

    foreach ($destinatarios as $usuarioId) {
        $stmt->execute([$usuarioId, $mensaje]);
    }
}
