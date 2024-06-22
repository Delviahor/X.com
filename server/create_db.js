const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos SQLite (o crearla si no existe)
let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear la tabla de usuarios
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        primer_nombre TEXT NOT NULL,
        segundo_nombre TEXT,
        primer_apellido TEXT NOT NULL,
        segundo_apellido TEXT,
        correo TEXT NOT NULL UNIQUE,
        nombre_usuario TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla de usuarios:', err.message);
        } else {
            console.log('Tabla de usuarios creada exitosamente.');
        }
    });
});

// Cerrar la conexión a la base de datos cuando hayas terminado
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la conexión a la base de datos:', err.message);
    } else {
        console.log('Conexión a la base de datos cerrada.');
    }
});
