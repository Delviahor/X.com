// Manejar el evento de envío del formulario de inicio de sesión
document.getElementById('login-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Enviar las credenciales al servidor utilizando fetch
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
    return response.json(); // Esperamos recibir un objeto JSON con la respuesta del servidor
  })
  .then(data => {
    // Verificar la respuesta del servidor
    if (data === 'Inicio de sesión exitoso') {
      alert("Login successful!");
      // Redireccionar o realizar otra acción después del inicio de sesión exitoso
      window.location.href = `/home?username=${encodeURIComponent(username)}`; // Redirigir a la página principal con el nombre de usuario
    } else {
        throw new Error('Credenciales incorrectas');
    }
  })
  .catch(error => {
    if (error.message === 'Credenciales incorrectas') {
      // Mostrar mensaje de error de credenciales en la página HTML
      const errorMessage = document.createElement('p');
      errorMessage.textContent = "Nombre de usuario o contraseña incorrectos.";
      document.body.appendChild(errorMessage);
    } else {
      // Mostrar mensaje de error de servidor en la página HTML
      const errorMessage = document.createElement('p');
      errorMessage.textContent = "Nombre de usuario o contraseña incorrectos. (2)";
      document.body.appendChild(errorMessage);
      console.error('Error:', error);
    }
  });
});


// Manejar el evento de clic del botón de registro
document.getElementById('register-button')?.addEventListener('click', function() {
  window.location.href = 'register.html';
});

// Manejar el evento de envío del formulario de registro
document.getElementById('register-form')?.addEventListener('submit', function(event) {
  event.preventDefault();

  // Validación de campos de nombres y apellidos
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

// Manejar los checkboxes para "No tengo"
// Segundo nombre
document.getElementById('no-second-name')?.addEventListener('change', function(event) {
  document.getElementById('second-name').disabled = event.target.checked;
});

// Segundo apellido
document.getElementById('no-second-surname')?.addEventListener('change', function(event) {
  document.getElementById('second-surname').disabled = event.target.checked;
});

// Esperar a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Obtener parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');

  // Verificar si se encontró el nombre de usuario en los parámetros de la URL
  if (username) {
    // Insertar el nombre de usuario en el elemento con id 'username-placeholder'
    const usernamePlaceholder = document.getElementById('username-placeholder');
    if (usernamePlaceholder) {
        usernamePlaceholder.textContent = username;
    }

    // Obtener saldo del usuario utilizando fetch
    fetch(`/saldo?username=${encodeURIComponent(username)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Esperamos recibir un objeto JSON con el saldo
      })
      .then(data => {
        // Mostrar el saldo en la página
        const saldoElement = document.getElementById('saldo');
        if (saldoElement) {
          saldoElement.textContent = `Saldo actual: $${data.saldo}`;
        }
      })
      .catch(error => {
        console.error('Error al obtener saldo:', error);
        // Mostrar mensaje de error en la página
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Error al obtener saldo del usuario. Por favor, inténtalo de nuevo más tarde.";
        document.body.appendChild(errorMessage);
      });
}
});