// Manejar el evento de envío del formulario de inicio de sesión
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
      alert("Login successful!");
      window.location.href = `/home?username=${encodeURIComponent(username)}`;
    } else {
        throw new Error('Credenciales incorrectas');
    }
  })
  .catch(error => {
    if (error.message === 'Credenciales incorrectas') {
      const errorMessage = document.createElement('p');
      errorMessage.textContent = "Nombre de usuario o contraseña incorrectos.";
      document.body.appendChild(errorMessage);
    } else {
      const errorMessage = document.createElement('p');
      errorMessage.textContent = "Nombre de usuario o contraseña incorrectos. (2)";
      document.body.appendChild(errorMessage);
      console.error('Error:', error);
    }
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

      fetch(`/get-saldo?username=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('saldo-placeholder').textContent = data.saldo.toFixed(2);
        })
        .catch(error => console.error('Error:', error));
  }
});

document.getElementById('transfer-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
  const usernameOrigen = new URLSearchParams(window.location.search).get('username');
  const usernameDestino = document.getElementById('dest-username').value;
  const monto = document.getElementById('amount').value;

  fetch('/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `usernameOrigen=${encodeURIComponent(usernameOrigen)}&usernameDestino=${encodeURIComponent(usernameDestino)}&monto=${encodeURIComponent(monto)}`
  })
  .then(response => response.text())
  .then(data => {
    alert(data);
    if (data === 'Transferencia exitosa') {
      location.reload();
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error al realizar la transferencia');
  });
});
