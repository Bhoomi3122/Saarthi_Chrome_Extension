// utils.js
export function showToast(message, duration = 3000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, duration);
}

export function getAuthToken() {
    return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get("authToken", (result) => {
                resolve(result.authToken);
            });
        } else {
            resolve(localStorage.getItem("authToken"));
        }
    });
}
