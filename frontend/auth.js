document.getElementById("loginForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  // For simplicity, simulate a login by storing the username in localStorage.
  if(username && password) {
    localStorage.setItem("username", username);
    window.location.href = "index.html"; // Redirect to chat page after login.
  }
});

document.getElementById("registerForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  // Call backend to register user.
  fetch('http://localhost:8000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password })
  })
  .then(response => {
    if(response.ok) {
      localStorage.setItem("username", username);
      window.location.href = "index.html"; // Redirect to chat page after registration.
    } else {
      alert("Registration failed. Please try again.");
    }
  })
  .catch(error => {
    console.error("Registration error:", error);
    alert("An error occurred during registration.");
  });
});
