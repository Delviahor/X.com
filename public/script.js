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
      return response.json();
  })
  .then(data => {
      if (data.message === 'Inicio de sesión exitoso') {
          alert("¡Inicio de sesión exitoso!");
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
          errorMessage.textContent = "Error en el servidor.";
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
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');

  if (username) {
      const usernamePlaceholder = document.getElementById('username-placeholder');
      if (usernamePlaceholder) {
          usernamePlaceholder.textContent = username;
      }

      fetch(`/home?username=${encodeURIComponent(username)}`)
          .then(response => response.text())
          .then(html => {
              document.body.innerHTML = html;
          })
          .catch(error => {
              console.error('Error:', error);
              const errorMessage = document.createElement('p');
              errorMessage.textContent = "Error al cargar la página de inicio.";
              document.body.appendChild(errorMessage);
          });
  }
});
