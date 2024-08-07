document.getElementById('login-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    if (data === 'Inicio de sesión exitoso') {
      alert("¡Inicio de sesión exitoso!");
      window.location.href = `/home?username=${encodeURIComponent(username)}`;
    } else {
        throw new Error('Credenciales incorrectas');
    }
  })
  .catch(error => {
    const errorMessage = document.createElement('p');
    if (error.message === 'Credenciales incorrectas') {
      errorMessage.textContent = "Nombre de usuario o contraseña incorrectos.";
    } else {
      errorMessage.textContent = "Error en el servidor.";
    }
    document.body.appendChild(errorMessage);
    console.error('Error:', error);
  });
});

document.getElementById('register-button')?.addEventListener('click', function() {
  window.location.href = 'register.html';
});

document.getElementById('register-form')?.addEventListener('submit', function(event) {
  event.preventDefault();

  const firstName = document.getElementById('first-name').value;
  const secondName = document.getElementById('second-name').value;
  const firstSurname = document.getElementById('first-surname').value;
  const secondSurname = document.getElementById('second-surname').value;

  const regexUppercase = /[A-Z]/;

  if (regexUppercase.test(firstName) || regexUppercase.test(secondName) || regexUppercase.test(firstSurname) || regexUppercase.test(secondSurname)) {
    alert('Los campos de nombres y apellidos deben estar en minúsculas.');
    return;
  }

  const formData = new FormData(this);
  fetch('/register', {
      method: 'POST',
      body: new URLSearchParams(formData)
  }).then(response => response.text())
    .then(data => {
        alert(data);
        window.location.href = '/';
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('no-second-name')?.addEventListener('change', function(event) {
  document.getElementById('second-name').disabled = event.target.checked;
});

document.getElementById('no-second-surname')?.addEventListener('change', function(event) {
  document.getElementById('second-surname').disabled = event.target.checked;
});

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');

  if (username) {
      const usernamePlaceholder = document.getElementById('username-placeholder');
      if (usernamePlaceholder) {
          usernamePlaceholder.textContent = username;
      }

      fetch(`/saldo?username=${encodeURIComponent(username)}`)
      .then(response => response.json())
      .then(data => {
          const saldoPlaceholder = document.getElementById('saldo-placeholder');
          if (saldoPlaceholder) {
              saldoPlaceholder.textContent = data.saldo;
          }
      })
      .catch(error => console.error('Error:', error));
  }

  document.getElementById('transfer-button')?.addEventListener('click', function() {
      window.location.href = `/transfer.html?username=${encodeURIComponent(username)}`;
  });

  document.getElementById('apartados-button')?.addEventListener('click', function() {
        window.open(`/apartados.html?username=${encodeURIComponent(username)}`, '_blank');
  });

  document.getElementById('historial-button')?.addEventListener('click', function() {
    window.location.href = `/historial.html?username=${encodeURIComponent(username)}`;
  });
  
});

document.getElementById('transfer-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
  const username = new URLSearchParams(window.location.search).get('username');
  const destUsername = document.getElementById('dest-username').value;
  const amount = document.getElementById('amount').value;

  if (!username) {
    alert("Nombre de usuario no encontrado en la URL");
    return;
  }

  fetch('/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, destUsername, amount })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("¡Transferencia exitosa!");
      window.location.href = `/home?username=${encodeURIComponent(username)}`;
    } else {
      alert("Error en la transferencia: " + data.message);
    }
  })
  .catch(error => console.error('Error:', error));
});

document.getElementById('back-button')?.addEventListener('click', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  window.location.href = `/home?username=${encodeURIComponent(username)}`;
});

document.addEventListener('DOMContentLoaded', function() {
  const username = new URLSearchParams(window.location.search).get('username');
  document.getElementById('username-placeholder').textContent = username;

  fetch(`/saldo?username=${encodeURIComponent(username)}`)
      .then(response => response.json())
      .then(data => {
          document.getElementById('saldo-placeholder').textContent = data.saldo;
      })
      .catch(error => console.error('Error:', error));

  document.getElementById('transfer-button')?.addEventListener('click', function() {
      window.location.href = `/transfer?username=${encodeURIComponent(username)}`;
  });
});

document.getElementById('crear-apartado-form')?.addEventListener('submit', function(event) {
  event.preventDefault();

  const username = new URLSearchParams(window.location.search).get('username');
  const nombreApartado = document.getElementById('nombre-apartado').value;
  const montoApartado = document.getElementById('monto-apartado').value;

  fetch('/crear-apartado', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombreApartado, montoApartado, username })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
        alert(data.message);
        // Actualizar la tabla de apartados
        const apartadosList = document.getElementById('apartados-list');
        const noApartadosMessage = apartadosList.querySelector('td[colspan="3"]');

        if (noApartadosMessage) {
            noApartadosMessage.remove();
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nombreApartado}</td>
            <td>${montoApartado}</td>
            <td>${new Date().toISOString().split('T')[0]}</td>
        `;
        apartadosList.appendChild(row);
    } else {
        alert(data.message);
    }
})
.catch(error => {
    console.error('Error:', error);
    alert("Error al crear apartado.");
});
});

document.addEventListener('DOMContentLoaded', function() {
  const username = new URLSearchParams(window.location.search).get('username');

  if (!username) {
      alert("Nombre de usuario no encontrado en la URL");
      return;
  }

  // Configura el evento del botón de volver
  document.getElementById('back-button')?.addEventListener('click', function() {
      window.location.href = `/home?username=${encodeURIComponent(username)}`;
  });

  // Función para obtener y mostrar el historial de transferencias
  function loadHistorial() {
      fetch(`/historial?username=${encodeURIComponent(username)}`)
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  const historialTable = document.querySelector('#historial-table tbody');
                  historialTable.innerHTML = ''; // Limpiar la tabla antes de llenarla

                  if (data.data.length === 0) {
                      const noDataRow = document.createElement('tr');
                      noDataRow.innerHTML = `<td colspan="4">No hay transferencias.</td>`;
                      historialTable.appendChild(noDataRow);
                  } else {
                      data.data.forEach(transaccion => {
                          const row = document.createElement('tr');
                          row.innerHTML = `
                              <td>${transaccion.remitente_id}</td>
                              <td>${transaccion.destinatario_id}</td>
                              <td>${transaccion.monto}</td>
                              <td>${transaccion.fecha}</td>
                          `;
                          historialTable.appendChild(row);
                      });
                  }
              } else {
                  alert("Error al cargar el historial de transferencias.");
              }
          })
          .catch(error => console.error('Error:', error));
  }

  loadHistorial();
});