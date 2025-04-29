// Wait for the page to load
document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is already authenticated
    const { authToken } = await chrome.storage.local.get('authToken');
  
    if (authToken) {
      // User is logged in
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('dashboard-section').style.display = 'block';
    } else {
      // User is NOT logged in
      document.getElementById('login-section').style.display = 'block';
      document.getElementById('dashboard-section').style.display = 'none';
    }
  
    // Handle Login Form Submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
  
      if (email && password) {
        // 👉 Here you should ideally verify login (API call etc.)
        // For now let's simulate successful login:
        await chrome.storage.local.set({ authToken: 'dummy_auth_token' });
  
        // Refresh popup to show dashboard
        window.location.reload();
      } else {
        showToast('Please enter both email and password.');
      }
    });
  
    // Handle Logout Button Click
    const logoutButton = document.getElementById('auth-buttons');
    if (logoutButton) {
      logoutButton.addEventListener('click', async function () {
        await chrome.storage.local.remove('authToken');
        // Refresh popup to go back to login
        window.location.reload();
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