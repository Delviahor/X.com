const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Configurar body-parser para manejar solicitudes POST
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, '..', 'public')));

// Conectar a la base de datos SQLite
let db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Ruta para la página de inicio de sesión
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Ruta para la página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

// Ruta para la página principal después del inicio de sesión
app.get('/home', (req, res) => {
    const { username } = req.query;
    //res.send(`<h2>Bienvenido, ${username}!</h2>`); // Puedes renderizar aquí tu página principal con un mensaje de bienvenida
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

// Ruta para obtener el saldo del usuario
app.get('/saldo', (req, res) => {
    const { username } = req.query;

    // Consultar la base de datos para obtener el saldo del usuario
    const query = `SELECT saldo FROM usuarios WHERE nombre_usuario = ?`;

    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            res.status(500).json({ error: 'Error en el servidor' });
        } else if (row) {
            // Enviar el saldo como respuesta en formato JSON
            res.json({ saldo: row.saldo });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    });
});

// Manejar el envío del formulario de registro
app.post('/register', (req, res) => {
    const { 'first-name': firstName, 'second-name': secondName, 'first-surname': firstSurname, 'second-surname': secondSurname, email, username, password } = req.body;

    const query = `INSERT INTO usuarios (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, nombre_usuario, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [firstName, secondName, firstSurname, secondSurname, email, username, password], function(err) {
        if (err) {
            return console.error('Error al insertar datos en la tabla de usuarios:', err.message);
        }
        console.log('Nuevo usuario registrado con ID:', this.lastID);
        res.send('Registro exitoso');
    });
});

// Manejar el envío del formulario de inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Intentando iniciar sesión con:', username, password);
    const query = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND contrasena = ?`;

    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            res.status(500).send('Error en el servidor');
        } else if (row) {
            console.log('Usuario encontrado:', row);
            // Redirigir al usuario a la página principal de bienvenida si las credenciales son correctas
            //res.send('Inicio de sesión exitoso');
            res.send(row)
        } else {
            console.log('Nombre de usuario o contraseña incorrectos');
            res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
