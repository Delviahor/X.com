// Manejar el evento de envío del formulario de inicio de sesión
document.getElementById('login-form')?.addEventListener('submit', function(event) {
  // Evitar que el formulario se envíe automáticamente
  event.preventDefault();
  // Obtener los valores de los campos de usuario y contraseña
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Simulación de una validación de inicio de sesión
  if(username === "admin" && password === "password") {
    // Mostrar mensaje de éxito si las credenciales son correctas
    alert("Login successful!");
  } else {
    // Mostrar mensaje de error si las credenciales son incorrectas
    alert("Invalid username or password.");
  }
});

// Manejar el evento de clic del botón de registro
document.getElementById('register-button')?.addEventListener('click', function() {
  // Redirigir a la página de registro
  window.location.href = '/register';
});

// Manejar el evento de envío del formulario de registro
document.getElementById('register-form')?.addEventListener('submit', function(event) {
  // Evitar que el formulario se envíe automáticamente
  event.preventDefault();
  // Obtener los valores de los campos del formulario de registro
  const firstName = document.getElementById('first-name').value;
  const secondName = document.getElementById('second-name').value;
  const firstSurname = document.getElementById('first-surname').value;
  const secondSurname = document.getElementById('second-surname').value;

  // Mostrar mensaje de éxito al registrarse (aquí podrías agregar lógica para enviar los datos al servidor)
  alert('Registration successful!');
});

// Manejar los checkboxes para "No tengo"

// Segundo nombre
document.getElementById('no-second-name')?.addEventListener('change', function(event) {
  // Habilitar o deshabilitar el campo de segundo nombre según el estado del checkbox
  document.getElementById('second-name').disabled = event.target.checked;
});

// Segundo apellido
document.getElementById('no-second-surname')?.addEventListener('change', function(event) {
  // Habilitar o deshabilitar el campo de segundo apellido según el estado del checkbox
  document.getElementById('second-surname').disabled = event.target.checked;
});
