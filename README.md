# Ticket UCAD

## Configuración requerida (Apache/XAMPP)

Para que las rutas amigables funcionen correctamente, debes modificar el archivo `httpd.conf` de Apache:

1. Abre `C:/xampp/apache/conf/httpd.conf`
2. Busca el bloque `<Directory "C:/xampp/htdocs">`
3. Asegúrate de que diga `AllowOverride All`

```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

4. Reinicia Apache desde el panel de XAMPP.

Sin este paso, la ruta `localhost/TICKET_UCAD/inicio-sesion` dará error 404.
