document.addEventListener("DOMContentLoaded", async function () { 
    const noteList = document.getElementById("notesList");
    const addNoteBtn = document.getElementById("addNoteBtn");

    // Check if the addNoteBtn exists before adding event listener
    if (addNoteBtn) {
        addNoteBtn.addEventListener("click", function () {
            window.location.href = "new_note.html";
        });
    }

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

    // Fetch and Display notes from backend
    async function loadNotes() {
        try {
            const response = await fetch("http://localhost:5000/api/notes", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            if (data && data.notes && data.notes.length > 0) {
                displayNotes(data.notes);
            } else {
                noteList.innerHTML = "<p>Create new notes to appear here.</p>";
            }
        } catch (error) {
            console.error("Error fetching notes from backend:", error);
            noteList.innerHTML = "<p>Error loading notes. Please try again.</p>";
        }
    }

    // Display notes cards
    function displayNotes(notes) {
        noteList.innerHTML = "";
        notes.forEach((note) => createNoteCard(note));
    }

    // Create a note card
    function createNoteCard(note) {
        const { _id, title, description } = note;

        const card = document.createElement("div");
        card.classList.add("note-card");

        card.innerHTML = `
            <div class="card-header">
                <span class="note-title">${title}</span>
                <button class="chevron-btn" data-id="${_id}">
                    <i class="bi bi-chevron-down"></i>
                </button>
            </div>
            <div class="card-details" id="details-${_id}">
                <p class="note-content">${description}</p>
                <div class="actions">
                    <button class="action-btn copy-btn" data-content="${description}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                    <button class="action-btn edit-btn" data-id="${_id}" data-title="${title}" data-content="${description}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${_id}">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        noteList.appendChild(card);
    }

    // Chevron toggle
    if (noteList) {
    noteList.addEventListener("click", (e) => {
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
}

    // Copy to clipboard
     if (noteList) {
    noteList.addEventListener("click", (e) => {
        const copyBtn = e.target.closest(".copy-btn");
        if (copyBtn) {
            const content = copyBtn.dataset.content;
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copied!`;
                showToast("Note copied!");

                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="bi bi-clipboard"></i> Copy`;
                }, 1500);
            });
        }
    });
}

    // Delete note
     if (noteList) {
    noteList.addEventListener("click", async (e) => {
        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;

            try {
                const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                    },
                });
                const resData = await response.json();
                if (response.ok) {
                    showToast("Note deleted.");
                    loadNotes();
                } else {
                    console.warn(resData);
                    showToast("Failed to delete note.");
                }
            } catch (error) {
                console.error("Delete error:", error);
                showToast("Error deleting note.");
            }
        }
    });
}

    // Edit note
     if (noteList) {noteList.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            const _id = editBtn.dataset.id;
            const title = editBtn.dataset.title;
            const content = editBtn.dataset.content;

            chrome.storage.local.set({ editingNote: { _id, title, content } }, function () {
                window.location.href = "../html/edit_note.html";
            });
        }
    });
}

    loadNotes();
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
