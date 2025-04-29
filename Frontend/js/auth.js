document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // Registration Form
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
          e.preventDefault();
    
          const name = document.querySelector('input[name="name"]').value.trim();
          const email = document.querySelector('input[name="email"]').value.trim();
          const password = document.querySelector('input[name="password"]').value.trim();
          const confirmPassword = document.querySelector('input[name="confirm-password"]').value.trim();
    
          if (password !== confirmPassword) {
            showToast("Passwords don't match!");
            return;
          }
    
          const userData = { name, email, password };
    
          try {
            // 👉 Register the user
            const response = await fetch('http://localhost:5000/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(userData)
            });
    
            const result = await response.json();
    
            if (response.ok && result.message) {
              showToast(result.message); // e.g., "Registration successful!"
    
              // 👉 Automatically login after successful registration
              const loginData = { email, password };
              const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
              });
    
              const loginResult = await loginResponse.json();
    
              if (loginResponse.ok && loginResult.token) {
                // ✅ Save token to chrome local storage
                await chrome.storage.local.set({ authToken: loginResult.token });
    
                // 👉 Redirect to popup.html (to trigger token check and show dashboard)
                window.location.href = '../popup.html';
              } else {
                showToast('Login failed after registration. Please log in manually.');
              }
            } else {
              showToast(result.error || 'Registration failed');
            }
          } catch (error) {
            console.error("Registration failed:", error);
            showToast("An error occurred while registering. Please try again.");
          }
        });
      }

    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.querySelector('input[name="email"]').value;
            const password = document.querySelector('input[name="password"]').value;
            if (!email || !password) {
                showToast("Enter email and password.");
                return;
              }
            const loginData = { email, password };

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok && result.token) {
                    showToast('Logged in successfully!');
                    await chrome.storage.local.set({ authToken: result.token });
                    window.location.reload();
                } else if (result.error) {
                    showToast(result.error);
                }
            } catch (error) {
                console.error("Login failed:", error);
                showToast("An error occurred while logging in. Please try again.");
            }
        });
    }
});
function showToast(message, callback = null) {
    const toast = document.createElement("div");
    toast.classList.add("toast-message");
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
            if (callback) callback(); // Redirect after toast disappears
        }, 300);
    }, 1000);
}
