// Manejar el evento de envío del formulario de inicio de sesión
document.getElementById('login-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (username === "admin" && password === "password") {
      alert("Login successful!");
  } else {
      alert("Invalid username or password.");
  }
});

// Manejar el evento de clic del botón de registro
document.getElementById('register-button')?.addEventListener('click', function() {
  window.location.href = 'register.html';
});

// Manejar el evento de envío del formulario de registro
document.getElementById('register-form')?.addEventListener('submit', function(event) {
  event.preventDefault();
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
