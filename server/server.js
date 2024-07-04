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
    const { username } = req.query;
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.get('/transfer', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'transfer.html'));
});

app.post('/register', (req, res) => {
    const { "first-name": firstName, "second-name": secondName, "first-surname": firstSurname, "second-surname": secondSurname, email, username, password } = req.body;
    const insertUserQuery = `INSERT INTO usuarios (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, nombre_usuario, contrasena, saldo) VALUES (?, ?, ?, ?, ?, ?, ?, 1000)`;

    db.run(insertUserQuery, [firstName, secondName, firstSurname, secondSurname, email, username, password], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error al registrar el usuario.");
        } else {
            res.send("¡Registro exitoso!");
        }
    });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const loginQuery = `SELECT * FROM usuarios WHERE nombre_usuario = ? AND contrasena = ?`;

    db.get(loginQuery, [username, password], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error en el servidor.");
        } else if (row) {
            res.send("Inicio de sesión exitoso");
        } else {
            res.status(401).send("Credenciales incorrectas");
        }
    });
});

app.get('/saldo', (req, res) => {
    const { username } = req.query;
    const getSaldoQuery = `SELECT saldo FROM usuarios WHERE nombre_usuario = ?`;

    db.get(getSaldoQuery, [username], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error al obtener el saldo.");
        } else if (row) {
            res.json({ saldo: row.saldo });
        } else {
            res.status(404).send("Usuario no encontrado.");
        }
    });
});

app.post('/transfer', (req, res) => {
    const { username, destUsername, amount } = req.body;
    const amountFloat = parseFloat(amount);

    if (username === destUsername) {
        return res.status(400).json({ success: false, message: "No puedes transferirte dinero a ti mismo." });
    }

    if (isNaN(amountFloat) || amountFloat <= 0) {
        return res.status(400).json({ success: false, message: "El monto de la transferencia debe ser un número positivo." });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const getSenderSaldoQuery = `SELECT saldo FROM usuarios WHERE nombre_usuario = ?`;
        db.get(getSenderSaldoQuery, [username], (err, sender) => {
            if (err || !sender) {
                console.error(err ? err.message : "Usuario no encontrado.");
                db.run("ROLLBACK");
                return res.status(500).json({ success: false, message: "Error al obtener el saldo del remitente." });
            } else if (sender.saldo < amountFloat) {
                db.run("ROLLBACK");
                return res.status(400).json({ success: false, message: "Saldo insuficiente." });
            }

            const getReceiverSaldoQuery = `SELECT saldo FROM usuarios WHERE nombre_usuario = ?`;
            db.get(getReceiverSaldoQuery, [destUsername], (err, receiver) => {
                if (err || !receiver) {
                    console.error(err ? err.message : "Usuario destino no encontrado.");
                    db.run("ROLLBACK");
                    return res.status(500).json({ success: false, message: "Error al obtener el saldo del destinatario." });
                }

                const updateSenderSaldoQuery = `UPDATE usuarios SET saldo = saldo - ? WHERE nombre_usuario = ?`;
                db.run(updateSenderSaldoQuery, [amountFloat, username], function(err) {
                    if (err) {
                        console.error(err.message);
                        db.run("ROLLBACK");
                        return res.status(500).json({ success: false, message: "Error al actualizar el saldo del remitente." });
                    }

                    const updateReceiverSaldoQuery = `UPDATE usuarios SET saldo = saldo + ? WHERE nombre_usuario = ?`;
                    db.run(updateReceiverSaldoQuery, [amountFloat, destUsername], function(err) {
                        if (err) {
                            console.error(err.message);
                            db.run("ROLLBACK");
                            return res.status(500).json({ success: false, message: "Error al actualizar el saldo del destinatario." });
                        }

                        const insertTransferQuery = `INSERT INTO transferencias (remitente_id, destinatario_id, monto, fecha) VALUES (?, ?, ?, DATE('now'))`;
                        db.run(insertTransferQuery, [username, destUsername, amountFloat], function(err) {
                            if (err) {
                                console.error(err.message);
                                db.run("ROLLBACK");
                                return res.status(500).json({ success: false, message: "Error al registrar la transferencia." });
                            }

                            db.run("COMMIT", (err) => {
                                if (err) {
                                    console.error(err.message);
                                    return res.status(500).json({ success: false, message: "Error al finalizar la transacción." });
                                }

                                const getNewSenderSaldoQuery = `SELECT saldo FROM usuarios WHERE nombre_usuario = ?`;
                                db.get(getNewSenderSaldoQuery, [username], (err, sender) => {
                                    if (err || !sender) {
                                        console.error(err ? err.message : "Usuario no encontrado.");
                                        return res.status(500).json({ success: false, message: "Error al obtener el nuevo saldo del remitente." });
                                    }

                                    res.json({ success: true, newSaldo: sender.saldo });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.post('/crear-apartado', (req, res) => {
    const { nombre, monto, username } = req.body;
    const montoFloat = parseFloat(monto);

    const insertApartadoQuery = `
        INSERT INTO apartados (nombre, monto, fecha_creacion, usuario_id)
        VALUES (?, ?, DATE('now'), (SELECT id FROM usuarios WHERE nombre_usuario = ?))
    `;

    db.run(insertApartadoQuery, [nombre, montoFloat, username], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error al crear el apartado.");
        } else {
            res.send("¡Apartado creado correctamente!");
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
