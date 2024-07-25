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
    const {nombreApartado, montoApartado, username} = req.body;
    const montoFloat = parseFloat(montoApartado);

    if (isNaN(montoFloat) || montoFloat <= 0) {
        return res.status(400).json({ success: false, message: "El monto del apartado debe ser un número positivo mayor que cero." });
    }

    db.serialize(() => {
        // db.run("BEGIN TRANSACTION");

        const obtenerSaldoQuery = `SELECT saldo, id FROM usuarios WHERE nombre_usuario = ?`;
        db.get(obtenerSaldoQuery, [username], (err, usuario) => {
            if (err) {
                console.error("Error al obtener el saldo del usuario:", err.message);
                db.run("ROLLBACK");
                return res.status(500).json({ success: false, message: "Error al obtener el saldo del usuario." });
            }
            
            if (!usuario) {
                console.error("Usuario no encontrado");
                db.run("ROLLBACK");
                return res.status(404).json({ success: false, message: "Usuario no encontrado." });
            }

            if (usuario.saldo < montoFloat) {
                console.error("Saldo insuficiente para crear el apartado.");
                db.run("ROLLBACK");
                return res.status(400).json({ success: false, message: "Saldo insuficiente para crear el apartado." });
            }

            const userId = usuario.id;
            const checkApartadoQuery = `SELECT * FROM apartados WHERE usuario_id = ? AND nombre = ?`;
            db.get(checkApartadoQuery, [userId, nombreApartado], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ success: false, message: 'Error al verificar el nombre del apartado.' });
                }
                if (row) {
                    return res.status(400).json({ success: false, message: 'El nombre del apartado ya existe.' });
                }

                db.run("BEGIN TRANSACTION", (err) => {
                    if (err) {
                        console.error("Error al iniciar la transacción:", err.message);
                        return res.status(500).json({ success: false, message: "Error al iniciar la transacción." });
                    }

                    const insertApartadoQuery = `
                        INSERT INTO apartados (nombre, monto, fecha_creacion, usuario_id)
                        VALUES (?, ?, DATE('now'), ?)
                    `;
                    db.run(insertApartadoQuery, [nombreApartado, montoFloat, userId], function(err) {
                        if (err) {
                            console.error("Error al crear el apartado:", err.message);
                            db.run("ROLLBACK");
                            return res.status(500).json({ success: false, message: "Error al crear el apartado." });
                        }

                        const actualizarSaldoQuery = `
                            UPDATE usuarios
                            SET saldo = saldo - ?
                            WHERE nombre_usuario = ?
                        `;
                        db.run(actualizarSaldoQuery, [montoFloat, username], function(err) {
                            if (err) {
                                console.error("Error al actualizar el saldo del usuario:", err.message);
                                db.run("ROLLBACK");
                                return res.status(500).json({ success: false, message: "Error al actualizar el saldo del usuario." });
                            }

                            db.run("COMMIT", (err) => {
                                if (err) {
                                    console.error("Error al finalizar la transacción:", err.message);
                                    return res.status(500).json({ success: false, message: "Error al finalizar la transacción." });
                                }

                                res.json({ success: true, message: "¡Apartado creado correctamente!" });
                            });
                        });
                    });
                });
            });
        });
    });  // Aquí cierra db.serialize
});  // Y aquí cierra app.post



app.get('/obtener-apartados', (req, res) => {
    const username = req.query.username;

    const selectApartadosQuery = `
        SELECT nombre, monto, fecha_creacion
        FROM apartados
        WHERE usuario_id = (SELECT id FROM usuarios WHERE nombre_usuario = ?)
    `;

    db.all(selectApartadosQuery, [username], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: "Error al obtener los apartados." });
        }
        res.json({ success: true, apartados: rows });
    });
});

// Ruta para editar un apartado
const multer = require('multer');

const upload = multer();

app.post('/editar-apartado', upload.none(), (req, res) => {
  const { ApartadoId, nombreApartado, fechaCreacion, nuevoMonto, username } = req.body;
  const montoFloat = parseFloat(nuevoMonto);

  // ... (resto del código sigue igual)
  
    if (isNaN(montoFloat) || montoFloat <= 0) {
      return res.status(400).json({ success: false, message: "El monto debe ser un número positivo mayor que cero." });
    }
  
    const getUsuarioIdQuery = 'SELECT id FROM usuarios WHERE nombre_usuario = ?';
    db.get(getUsuarioIdQuery, [username], (err, row) => {
      if (err || !row) {
        console.error(err ? err.message : "Usuario no encontrado.");
        return res.status(500).json({ success: false, message: "Error al encontrar el usuario." });
      }
      //const apartadoId = req.params.id;
      const usuarioId = row.id;
      const getApartadoQuery = 'SELECT * FROM apartados WHERE id = ? AND usuario_id = ?';
      console.log(`Buscando apartado con ID ${ApartadoId} y usuario_id ${usuarioId}, de concepto ${nombreApartado} y fecha ${fechaCreacion}`);
      db.get(getApartadoQuery, [ApartadoId, usuarioId], (err, row) => {
        if (err || !row) {
          console.error(err ? err.message : "Apartado no encontrado.");
          //return res.status(404).json({ success: false, message: "Apartado no encontrado." });
        }
  
        const updateApartadoQuery = `
          UPDATE apartados
          SET nombre = ?, monto = ?
          WHERE fecha_creacion = ?
          AND usuario_id = ?
        `;
        db.run(updateApartadoQuery, [nombreApartado, montoFloat, fechaCreacion, usuarioId], function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: "Error al actualizar el apartado." });
          }
  
          res.json({ success: true, message: "¡Apartado actualizado correctamente!" });
        });
      });
    });
  });

// Ruta para eliminar un apartado
app.post('/eliminar-apartado', (req, res) => {
    const { id, username } = req.body;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const getMontoQuery = `SELECT monto FROM apartados WHERE id = ?`;
        db.get(getMontoQuery, [id], (err, row) => {
            if (err || !row) {
                console.error(err ? err.message : "Apartado no encontrado.");
                db.run("ROLLBACK");
                return res.status(500).json({ success: false, message: "Error al obtener el monto del apartado." });
            }

            const montoFloat = row.monto;

            const deleteApartadoQuery = `DELETE FROM apartados WHERE id = ? AND usuario_id = (SELECT id FROM usuarios WHERE nombre_usuario = ?)`;
            db.run(deleteApartadoQuery, [id, username], function(err) {
                if (err) {
                    console.error(err.message);
                    db.run("ROLLBACK");
                    return res.status(500).json({ success: false, message: "Error al eliminar el apartado." });
                }

                const updateSaldoQuery = `UPDATE usuarios SET saldo = saldo + ? WHERE nombre_usuario = ?`;
                db.run(updateSaldoQuery, [montoFloat, username], function(err) {
                    if (err) {
                        console.error(err.message);
                        db.run("ROLLBACK");
                        return res.status(500).json({ success: false, message: "Error al actualizar el saldo del usuario." });
                    }

                    db.run("COMMIT", (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ success: false, message: "Error al finalizar la transacción." });
                        }

                        res.json({ success: true, message: "¡Apartado eliminado correctamente!" });
                    });
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
