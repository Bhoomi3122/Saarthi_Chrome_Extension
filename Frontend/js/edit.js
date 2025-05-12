document.addEventListener("DOMContentLoaded", () => {
    // Get the link data stored for editing
    chrome.storage.local.get("editingLink", function (data) {
        const link = data.editingLink; // Fetch the link data from localStorage
        if (link) {
            // Prefill form fields with the existing link details
            document.getElementById("linkName").value = link.name || "";
            document.getElementById("linkURL").value = link.url || "";
            // Store the link ID in the form's submit handler
            console.log(link._id)
            form.dataset.id = link._id;
            console.log(form.dataset.id)
        } else {
        showToast("No link data found.");
            // Redirect to the links page if no link is found in storage
            window.location.href = "links.html";
        }
    });

    // Handle form submission to update the link
    const form = document.getElementById("editForm");
    form.addEventListener("submit", function (e) {
        e.preventDefault();  // Prevent the default form submission

        const linkName = document.getElementById("linkName").value;
        const linkURL = document.getElementById("linkURL").value;
        const linkId = this.dataset.id; // Get the link ID from the form data
        console.log(linkId);
        // Check if the fields are not empty
        if (!linkName || !linkURL) {
            showToast("Please fill in all the fields.");
            return;
        }

        // Get the token from local storage (for authentication)
        chrome.storage.local.get("authToken", (authData) => {
            const token = authData.authToken;

            if (!token) {
                showToast("You need to be logged in to edit a link.");
                return;
            }

            console.log("Submitting data to the backend...");
            console.log("Link Name:", linkName, "Link URL:", linkURL);

            // Send PUT request to update the link details
            fetch(`http://localhost:5000/api/links/${linkId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: linkName,
                    url: linkURL,
                }),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Update local storage with the new link details
                    chrome.storage.local.get("quickLinks", (data) => {
                        const links = data.quickLinks || [];
                        const linkIndex = links.findIndex(link => link._id === linkId);
                        if (linkIndex !== -1) {
                            links[linkIndex] = { _id: linkId, name: linkName, url: linkURL }; // Update the link details
                            chrome.storage.local.set({ quickLinks: links }, function () {
                                showToast("Link updated successfully.");
                                // Redirect back to the links page
                                window.location.href = "links.html";
                            });
                        }
                    });
                } else {
                    console.error("Backend failed to update the link:", data);
                    showToast("Failed to update link.");
                }
            })
            .catch((error) => {
                console.error("Error updating link:", error);
                showToast("Error updating link.");
            });
        });
    });
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