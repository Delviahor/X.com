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
      body: JSON.stringify({ nombreApartado, montoApartado, username})
  })
  .then(response => response.text())
  .then(data => {
    if (data.success) {
      alert("¡Apartado exitoso!");
      window.location.href = `/home?username=${encodeURIComponent(username)}`;
    } else {
      alert("Se creo el Apartado.");
    }
  })
  .catch(error => console.error('Error:', error));
});
