document.addEventListener("DOMContentLoaded", async function () {
    const linkList = document.querySelector(".link-list");
    const addLinkBtn = document.getElementById("addLinkBtn");

    addLinkBtn.addEventListener("click", function () {
        window.location.href = "new_link.html";
    });

    // Fetch token from chrome.storage
    const authToken = await new Promise(resolve => {
        chrome.storage.local.get("authToken", (data) => {
            resolve(data.authToken);
        });
    });

    if (!authToken) {
        alert("You need to be logged in.");
        return;
    }

    // Fetch and Display links from backend
    async function loadLinks() {
        try {
            const response = await fetch("http://localhost:5000/api/links", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            if (data && data.links && data.links.length > 0) {
                displayLinks(data.links);
            } else {
                linkList.innerHTML = "<p>Create new links to appear here.</p>";
            }
        } catch (error) {
            console.error("Error fetching links from backend:", error);
            linkList.innerHTML = "<p>Error loading links. Please try again.</p>";
        }
    }

    // Display cards
    function displayLinks(links) {
        linkList.innerHTML = "";
        links.forEach((link) => createLinkCard(link));
    }

    // Create a link card
    function createLinkCard(link) {
        const { _id, name, url } = link;

        const card = document.createElement("div");
        card.classList.add("link-card");

        card.innerHTML = `
            <div class="card-header">
                <span class="link-name">${name}</span>
                <button class="chevron-btn" data-id="${_id}">
                    <i class="bi bi-chevron-down"></i>
                </button>
            </div>
            <div class="card-details" id="details-${_id}">
                <p class="link-url">${url}</p>
                <div class="actions">
                    <button class="action-btn copy-btn" data-url="${url}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <button class="action-btn edit-btn" data-id="${_id}" data-name="${name}" data-url="${url}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${_id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        linkList.appendChild(card);
    }

    // Chevron toggle
    linkList.addEventListener("click", (e) => {
        const chevronBtn = e.target.closest(".chevron-btn");
        if (chevronBtn) {
            const id = chevronBtn.dataset.id;
            const detailsElement = document.getElementById(`details-${id}`);
            const icon = chevronBtn.querySelector("i");

            if (detailsElement.classList.contains("show")) {
                detailsElement.style.height = `${detailsElement.scrollHeight}px`;
                requestAnimationFrame(() => (detailsElement.style.height = "0"));
                detailsElement.classList.remove("show");
                icon.classList.replace("bi-chevron-up", "bi-chevron-down");
            } else {
                detailsElement.style.height = "0";
                detailsElement.classList.add("show");
                requestAnimationFrame(() => (detailsElement.style.height = `${detailsElement.scrollHeight}px`));
                icon.classList.replace("bi-chevron-down", "bi-chevron-up");

                detailsElement.addEventListener("transitionend", () => {
                    if (detailsElement.classList.contains("show")) {
                        detailsElement.style.height = "auto";
                    }
                }, { once: true });
            }
        }
    });

    // Copy to clipboard
    linkList.addEventListener("click", (e) => {
        const copyBtn = e.target.closest(".copy-btn");
        if (copyBtn) {
            const url = copyBtn.dataset.url;
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copied!`;
                showToast("Link copied!");

                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`;
                }, 1500);
            });
        }
    });

    // Delete link
    linkList.addEventListener("click", async (e) => {
        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;

            try {
                const response = await fetch(`http://localhost:5000/api/links/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                    },
                });
                const resData = await response.json();
                if (response.ok) {
                    showToast("Link deleted.");
                    loadLinks();
                } else {
                    console.warn(resData);
                    showToast("Failed to delete link.");
                }
            } catch (error) {
                console.error("Delete error:", error);
                showToast("Error deleting link.");
            }
        }
    });

    // Edit link
    linkList.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            const _id = editBtn.dataset.id;
            const name = editBtn.dataset.name;
            const url = editBtn.dataset.url;

            chrome.storage.local.set({ editingLink: { _id, name, url } }, function () {
                window.location.href = "../html/edit.html";
            });
        }
    });

    loadLinks();
});

function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast-message");
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        document.body.removeChild(toast);
    }, 3000);
}
