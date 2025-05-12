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
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: linkName, url: linkURL }),
                });
            
                const data = await response.json(); // ✅ Parse the response JSON
                console.log(data);
                if (data && data._id && data.user) {
                    chrome.storage.local.get("quickLinks", function (result) {
                        const quickLinks = result.quickLinks || [];
                        quickLinks.push({ _id: data._id,
                            name: data.name,
                            url: data.url,
                            user: data.user,}); // ✅ Now data includes the _id from backend
                        chrome.storage.local.set({ quickLinks }, function () {
                            showToast("Link saved successfully.");
                            window.location.href = "links.html";
                        });
                    });
                } else {
                    showToast("Failed to save link.");
                }
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
