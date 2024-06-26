const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

let db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.get('/saldo', (req, res) => {
    const { username } = req.query;
    const query = `SELECT saldo FROM usuarios WHERE nombre_usuario = ?`;
    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            res.status(500).send({ error: 'Error en el servidor' });
        } else if (row) {
            res.send({ saldo: row.saldo });
        } else {
            res.status(404).send({ error: 'Usuario no encontrado' });
        }
    });
});

app.post('/register', (req, res) => {
    const { 'first-name': firstName, 'second-name': secondName, 'first-surname': firstSurname, 'second-surname': secondSurname, email, username, password } = req.body;

    const query = `INSERT INTO usuarios (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, nombre_usuario, contrasena, saldo) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;

    db.run(query, [firstName, secondName, firstSurname, secondSurname, email, username, password], function(err) {
        if (err) {
            return console.error('Error al insertar datos en la tabla de usuarios:', err.message);
        }
        console.log('Nuevo usuario registrado con ID:', this.lastID);
        res.send('Registro exitoso');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND contrasena = ?`;

    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            res.status(500).send('Error en el servidor');
        } else if (row) {
            res.send('Inicio de sesión exitoso');
        } else {
            res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
    });
});

app.post('/transfer', (req, res) => {
    const { username, destUsername, amount } = req.body;
    const amountNumber = parseFloat(amount);

    if (amountNumber <= 0) {
        res.send({ success: false, message: 'El monto debe ser mayor a cero' });
        return;
    }

    db.serialize(() => {
        db.get(`SELECT saldo FROM usuarios WHERE nombre_usuario = ?`, [username], (err, row) => {
            if (err) {
                console.error('Error al consultar la base de datos:', err.message);
                res.status(500).send({ success: false, message: 'Error en el servidor' });
                return;
            }

            if (!row || row.saldo < amountNumber) {
                res.send({ success: false, message: 'Saldo insuficiente' });
                return;
            }

            db.run(`UPDATE usuarios SET saldo = saldo - ? WHERE nombre_usuario = ?`, [amountNumber, username], (err) => {
                if (err) {
                    console.error('Error al actualizar el saldo del remitente:', err.message);
                    res.status(500).send({ success: false, message: 'Error en el servidor' });
                    return;
                }

                db.run(`UPDATE usuarios SET saldo = saldo + ? WHERE nombre_usuario = ?`, [amountNumber, destUsername], (err) => {
                    if (err) {
                        console.error('Error al actualizar el saldo del destinatario:', err.message);
                        res.status(500).send({ success: false, message: 'Error en el servidor' });
                        return;
                    }

                    db.get(`SELECT saldo FROM usuarios WHERE nombre_usuario = ?`, [username], (err, row) => {
                        if (err) {
                            console.error('Error al consultar el saldo actualizado:', err.message);
                            res.status(500).send({ success: false, message: 'Error en el servidor' });
                            return;
                        }

                        res.send({ success: true, newSaldo: row.saldo });
                    });
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
