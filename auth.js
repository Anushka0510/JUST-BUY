document.querySelector("#btn").addEventListener("click", async function () {
  const fullName = document.querySelector("#fullName").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;
  const messageEl = document.querySelector("#register-message");

  if (password !== confirmPassword) {
    messageEl.textContent = "Passwords do not match.";
    messageEl.style.color = "red";
    return;
  }

  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password })
  });

  const data = await response.json();

  if (response.ok) {
    messageEl.textContent = data.message + " Redirecting to login...";
    messageEl.style.color = "green";
    setTimeout(function () {
      window.location.href = "loginpage.html";
    }, 1500);
  } else {
    messageEl.textContent = data.error;
    messageEl.style.color = "red";
  }
});

const loginForm = document.querySelector("#login-form");

if (loginForm) {
  document.querySelector("#btn").addEventListener("click", async function () {
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const messageEl = document.querySelector("#login-message");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("fullName", data.fullName);
      messageEl.textContent = "Login successful! Redirecting...";
      messageEl.style.color = "green";
      setTimeout(function () {
        window.location.href = "index.html";
      }, 1000);
    } else {
      messageEl.textContent = data.error;
      messageEl.style.color = "red";
    }
  });
}