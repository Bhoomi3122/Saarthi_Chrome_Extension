document.addEventListener("DOMContentLoaded", function () {
    const linkForm = document.getElementById("linkForm");
    if (!linkForm) return;

    const linkNameInput = document.getElementById("linkName");
    const linkURLInput = document.getElementById("linkURL");
    const submitBtn = document.getElementById("submitBtn");

    let isEditMode = false;
    let editIndex = null;

    // Check if editing mode is active
    chrome.storage.local.get("editingLink", function (data) {
        if (data.editingLink) {
            isEditMode = true;
            editIndex = data.editingLink.index;
            linkNameInput.value = data.editingLink.name;
            linkURLInput.value = data.editingLink.url;
            submitBtn.innerText = "Update"; // Change button text
        }
    });

    // Handle form submission
    linkForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Stop form from refreshing

        const linkName = linkNameInput.value.trim();
        const linkURL = linkURLInput.value.trim();

        if (linkName === "" || linkURL === "") {
            showToast("Both fields are required!");
            return;
        }

        chrome.storage.local.get("quickLinks", function (data) {
            let links = data.quickLinks || [];

            if (isEditMode && editIndex !== null) {
                // Update existing link
                links[editIndex] = { name: linkName, url: linkURL };
            } else {
                // Add new link
                links.push({ name: linkName, url: linkURL });
            }

            chrome.storage.local.set({ quickLinks: links, editingLink: null }, function () {
                showToast(isEditMode ? "Link updated successfully!" : "Link saved successfully!", () => {
                    window.location.href = "links.html"; // Redirect to links page
                });
            });
        });
    });

    // Show Toast Notification
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
});
