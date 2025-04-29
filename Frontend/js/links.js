document.addEventListener("DOMContentLoaded", function () {
    const linkList = document.querySelector(".link-list");
    const addLinkBtn = document.getElementById("addLinkBtn");

    // Redirect to add new link page
    addLinkBtn.addEventListener("click", function () {
        window.location.href = "new_link.html";
    });

    // Function to load links from Chrome storage or fetch from the backend
    function loadLinks() {
        chrome.storage.local.get("quickLinks", function (data) {
            let links = data.quickLinks || [];

            // If no links in localStorage, fetch from the backend
            if (links.length === 0) {
                fetchLinksFromBackend();
            } else {
                displayLinks(links);
            }
        });
    }
    const authToken = chrome.storage.local.get("authToken");  // Get token from localStorage
    
    if (!authToken) {
                                alert("You need to be logged in to edit a link.");
                                return;
                    }
    // Function to fetch links from the backend
    function fetchLinksFromBackend() {
        fetch("http://localhost:5000/api/links", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`, 
                // You can include the token here if needed
            }
        })
        .then((response) => response.json())
        .then((data) => {
            if (data && data.links) {
                // Store the links in chrome storage if fetched from the backend
                chrome.storage.local.set({ quickLinks: data.links }, function () {
                    displayLinks(data.links);
                });
            } else {
                // If no links are found, display message to create new links
                linkList.innerHTML = "<p>Create new links to appear here.</p>";
            }
        })
        .catch((error) => {
            console.error("Error fetching links from backend:", error);
            linkList.innerHTML = "<p>Error loading links. Please try again.</p>";
        });
    }

    // Function to display links in the DOM
    function displayLinks(links) {
        linkList.innerHTML = ""; // Clear existing links
        if (links.length === 0) {
            linkList.innerHTML = "<p>Create new links to appear here.</p>";
            return;
        }

        links.forEach((link, index) => createLinkCard(link.name, link.url, index));
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
            const icon = chevronBtn.querySelector("i");

            if (detailsElement.classList.contains("show")) {
                detailsElement.style.height = `${detailsElement.scrollHeight}px`;
                requestAnimationFrame(() => {
                    detailsElement.style.height = "0";
                });
                detailsElement.classList.remove("show");
                icon.classList.replace("bi-chevron-up", "bi-chevron-down");
            } else {
                detailsElement.style.height = "0";
                detailsElement.classList.add("show");
                requestAnimationFrame(() => {
                    detailsElement.style.height = `${detailsElement.scrollHeight}px`;
                });
                icon.classList.replace("bi-chevron-down", "bi-chevron-up");

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
                copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copied!`;

                showToast("Link copied!");

                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`;
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
                const linkToDelete = links[index];
    
                if (linkToDelete) {
                    chrome.storage.local.get("authToken", (authData) => {
                        const token = authData.authToken;
    
                        if (!token) {
                            alert("You need to be logged in to delete a link.");
                            return;
                        }
    
                        fetch(`http://localhost:5000/api/links/${linkToDelete._id}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        })
                        .then(async (response) => {
                            const resData = await response.json();
    
                            if (response.ok && resData.message === "Link deleted successfully") {
                                // Delete from localStorage only if backend deletion was successful
                                links.splice(index, 1);
                                chrome.storage.local.set({ quickLinks: links }, function () {
                                    showToast("Link deleted from both backend and localStorage.");
                                    loadLinks();
                                });
                            } else if (response.status === 404 && resData.error === "Link not found or unauthorized") {
                                // Backend says link not found, but check localStorage
                                if (links[index]) {
                                    links.splice(index, 1);
                                    chrome.storage.local.set({ quickLinks: links }, function () {
                                        showToast("Link not found in backend, but deleted from localStorage.");
                                        loadLinks();
                                    });
                                } else {
                                    showToast("Link not found in backend or localStorage.");
                                }
                            } else {
                                console.warn("Unexpected response:", resData);
                                showToast("Unexpected error while deleting the link.");
                            }
                        })
                        .catch((error) => {
                            console.error("Error deleting link from backend:", error);
                            showToast("Error deleting link.");
                        });
                    });
                }
            });
        }
    });
    
    
    
    // Edit Link Logic
    linkList.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            const index = editBtn.dataset.index;
    
            chrome.storage.local.get("quickLinks", function (data) {
                let links = data.quickLinks || [];
                let linkToEdit = links[index];
    
                if (linkToEdit) {
                    chrome.storage.local.set(
                        { editingLink: { ...linkToEdit, index } },
                        function () {
                            // Send PUT request to backend to update the link
                            const authToken = chrome.storage.local.get("authToken");  // Get token from localStorage
    
                            if (!authToken) {
                                alert("You need to be logged in to edit a link.");
                                return;
                            }
    
                            fetch(`/api/links/${index}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`,  // Attach token as Bearer token
                                },
                                body: JSON.stringify({
                                    name: linkToEdit.name,
                                    url: linkToEdit.url,
                                }),
                            })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.success) {
                                    window.location.href = "new_link.html?edit=true";  // Redirect to edit page
                                } else {
                                    alert("Failed to update link.");
                                }
                            })
                            .catch((error) => {
                                console.error("Error updating link:", error);
                                alert("Error updating link.");
                            });
                        }
                    );
                }
            });
        }
    });
    
    // Load links on page load
    loadLinks();
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
