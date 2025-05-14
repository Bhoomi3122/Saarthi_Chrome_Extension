document.addEventListener("DOMContentLoaded", () => {
    // Get the note data stored for editing
    chrome.storage.local.get("editingNote", function (data) {
        const note = data.editingNote; // Fetch the note data from localStorage
        if (note) {
            // Prefill form fields with the existing note details
            document.getElementById("noteTitle").value = note.title || "";
            document.getElementById("noteContent").value = note.content || "";
            // Store the note ID in the form's submit handler
            console.log(note._id);
            form.dataset.id = note._id;
            console.log(form.dataset.id);
        } else {
            showToast("No note data found.");
            // Redirect to the notes page if no note is found in storage
            window.location.href = "notes.html";
        }
    });

    // Handle form submission to update the note
    const form = document.getElementById("editForm");
    form.addEventListener("submit", function (e) {
        e.preventDefault();  // Prevent the default form submission

        const noteTitle = document.getElementById("noteTitle").value;
        const noteContent = document.getElementById("noteContent").value;
        const noteId = this.dataset.id; // Get the note ID from the form data
        console.log(noteId);

        // Check if the fields are not empty
        if (!noteTitle || !noteContent) {
            showToast("Please fill in all the fields.");
            return;
        }

        // Get the token from local storage (for authentication)
        chrome.storage.local.get("authToken", (authData) => {
            const token = authData.authToken;

            if (!token) {
                showToast("You need to be logged in to edit a note.");
                return;
            }

            console.log("Submitting data to the backend...");
            console.log("Note Title:", noteTitle, "Note Content:", noteContent);

            // Send PUT request to update the note details
            fetch(`http://localhost:5000/api/notes/${noteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: noteTitle,
                    description: noteContent,
                }),
            })
            .then((response) => response.json())
            .then((data) => {
    if (data.success) {
        showToast("Note updated successfully.", () => {
            // Redirect to the notes page after a successful update
            window.location.href = "../html/notes.html";
        });
    } else {
        console.error("Backend failed to update the note:", data);
        showToast("Failed to update note.");
    }
})
            .catch((error) => {
                console.error("Error updating note:", error);
                showToast("Error updating note.");
            });
        });
    });
});

// Toast function to display success/error messages
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
