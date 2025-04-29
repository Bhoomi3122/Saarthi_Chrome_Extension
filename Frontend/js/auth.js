document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    // Registration Form
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.querySelector('input[name="name"]').value;
            const email = document.querySelector('input[name="email"]').value;
            const password = document.querySelector('input[name="password"]').value;
            const confirmPassword = document.querySelector('input[name="confirm-password"]').value;

            if (password !== confirmPassword) {
                showToast("Passwords don't match!");
                return;
            }

            const userData = { name, email, password };

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const result = await response.json();

                if (result.message) {
                    showToast(result.message);  // Show success message

                    // 🔥 Now automatically login the user after registration
                    // Save token and redirect to popup.html
                    const loginData = { email, password };
                    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(loginData)
                    });

                    const loginResult = await loginResponse.json();

                    // Save the token to localStorage after successful login
                    if (loginResponse.ok && loginResult.token) {
                        localStorage.setItem('authToken', loginResult.token);
                        // Redirect to popup.html
                        window.location.href = '../popup.html';
                    } else {
                        showToast('Login failed after registration. Please log in manually.');
                    }}}
            catch (error) {
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
                    localStorage.setItem('authToken', result.token);
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
