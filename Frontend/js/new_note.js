document.addEventListener("DOMContentLoaded", function () {
    const noteForm = document.getElementById("noteForm");
    
    // If noteForm is not present, do nothing
    if (!noteForm) return;

    const noteTitleInput = document.getElementById("noteTitle");
    const noteContentInput = document.getElementById("noteContent");
    const submitBtn = document.getElementById("submitBtn");

    // Handle new note creation
    noteForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const noteTitle = noteTitleInput.value.trim();
        const noteContent = noteContentInput.value.trim();
        
        if (noteTitle === "" || noteContent === "") {
            showToast("Both fields are required!");
            return;
        }
        console.log(noteTitle);
        console.log(noteContent);

        chrome.storage.local.get(["authToken"], async function (data) {
            const token = data.authToken; // Get token from Chrome storage
            // Check if token is not available
            if (!token) {
                showToast("You must be logged in to save notes.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/api/notes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title: noteTitle, description: noteContent }),
                });

                const data = await response.json(); // ✅ Parse the response JSON
                console.log(data);
                if (data && data._id && data.user) {
                    // The backend now returns the note with the _id
                    showToast("Note saved successfully.");
                    window.location.href = "notes.html";
                } else {
                    showToast("Failed to save note.");
                }
            } catch (err) {
                console.error("Error posting note:", err.message);
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
