document.addEventListener("DOMContentLoaded", function () {
    const linkForm = document.getElementById("linkForm");
    if (!linkForm) return;

    const linkNameInput = document.getElementById("linkName");
    const linkURLInput = document.getElementById("linkURL");
    const submitBtn = document.getElementById("submitBtn");

    // Handle new link creation
    linkForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const linkName = linkNameInput.value.trim();
        const linkURL = linkURLInput.value.trim();

        if (linkName === "" || linkURL === "") {
            showToast("Both fields are required!");
            return;
        }

        chrome.storage.local.get(["authToken","quickLinks"], async function (data) {
            const token = data.authToken; // Get token from localStorage
            let links = data.quickLinks || [];
            // Check if token is not available
            if (!token) {
                showToast("You must be logged in to save links.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/api/links", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,  // Send token here in the Authorization header
                    },
                    body: JSON.stringify({ name: linkName, url: linkURL }),
                });

                const result = await response.json();

                if (!response.ok) {
                    showToast(result.message || "Error saving link");
                    return;
                }

                // Add to localStorage
                links.push(result); // Assuming backend returns saved link object
                chrome.storage.local.set({ quickLinks: links }, function () {
                    showToast("Link saved successfully!", () => {
                        window.location.href = "links.html";
                    });
                });

            } catch (err) {
                console.error("Error posting link:", err.message);
                showToast("Network error, try again.");
            }
        });
    });

    // Toast function
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
                if (callback) callback();
            }, 300);
        }, 1000);
    }
});
