document.addEventListener("DOMContentLoaded", function () {
    const linkList = document.querySelector(".link-list");
    const addLinkBtn = document.getElementById("addLinkBtn");

    // Redirect to add new link page
    addLinkBtn.addEventListener("click", function () {
        window.location.href = "new_link.html";
    });

    // Function to load links from Chrome storage
    function loadLinks() {
        chrome.storage.local.get("quickLinks", function (data) {
            const links = data.quickLinks || [];
            linkList.innerHTML = ""; // Clear existing links

            links.forEach((link, index) => createLinkCard(link.name, link.url, index));
        });
    }

    // Function to create a link card
    function createLinkCard(name, url, index) {
        const card = document.createElement("div");
        card.classList.add("link-card");

        card.innerHTML = `
            <div class="card-header">
                <span class="link-name">${name}</span>
                <button class="chevron-btn" data-index="${index}">
                    <i class="bi bi-chevron-down"></i>
                </button>
            </div>
            <div class="card-details" id="details-${index}">
                <p class="link-url">${url}</p>
                <div class="actions">
                    <button class="action-btn copy-btn" data-url="${url}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <button class="action-btn edit-btn" data-index="${index}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-index="${index}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        linkList.appendChild(card);
    }

    // Expand/Collapse Effect
    linkList.addEventListener("click", (e) => {
        const chevronBtn = e.target.closest(".chevron-btn");
        if (chevronBtn) {
            const index = chevronBtn.dataset.index;
            const detailsElement = document.getElementById(`details-${index}`);
            const icon = chevronBtn.querySelector("i"); // Get the icon inside button

            if (detailsElement.classList.contains("show")) {
                detailsElement.style.height = `${detailsElement.scrollHeight}px`;
                requestAnimationFrame(() => {
                    detailsElement.style.height = "0";
                });
                detailsElement.classList.remove("show");
                icon.classList.replace("bi-chevron-up", "bi-chevron-down"); // ✅ Correct way to toggle icon
            } else {
                detailsElement.style.height = "0";
                detailsElement.classList.add("show");
                requestAnimationFrame(() => {
                    detailsElement.style.height = `${detailsElement.scrollHeight}px`;
                });
                icon.classList.replace("bi-chevron-down", "bi-chevron-up"); // ✅ Correct way to toggle icon

                detailsElement.addEventListener(
                    "transitionend",
                    () => {
                        if (detailsElement.classList.contains("show")) {
                            detailsElement.style.height = "auto";
                        }
                    },
                    { once: true }
                );
            }
        }
    });

    // Copy URL to Clipboard
    linkList.addEventListener("click", (e) => {
        const copyBtn = e.target.closest(".copy-btn");
        if (copyBtn) {
            const url = copyBtn.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copied!`; // ✅ Change text to "Copied!"

                showToast("Link copied!"); // ✅ Show toast message

                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`; // ✅ Restore text after 1.5s
                }, 1500);
            });
        }
    });


    // Delete Link
    linkList.addEventListener("click", (e) => {
        if (e.target.closest(".delete-btn")) {
            const index = e.target.closest(".delete-btn").dataset.index;
            chrome.storage.local.get("quickLinks", (data) => {
                let links = data.quickLinks || [];
                links.splice(index, 1); // Remove the link
                chrome.storage.local.set({ quickLinks: links }, loadLinks); // Update storage and reload
            });
        }
    });

    // Edit Link Logic
    linkList.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            const index = editBtn.dataset.index;

            // Retrieve the link details
            chrome.storage.local.get("quickLinks", function (data) {
                let links = data.quickLinks || [];
                let linkToEdit = links[index];

                if (linkToEdit) {
                    // Store link temporarily in storage with its index
                    chrome.storage.local.set(
                        { editingLink: { ...linkToEdit, index } },
                        function () {
                            // Redirect to new_link.html for editing
                            window.location.href = "new_link.html?edit=true";
                        }
                    );
                }
            });
        }
    });

    // Load links on page load
    loadLinks();
});
