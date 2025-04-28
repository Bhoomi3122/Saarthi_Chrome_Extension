document.addEventListener("DOMContentLoaded", function () {
    const notesList = document.getElementById("notesList");
    const noteForm = document.getElementById("noteForm");
    const noteTitle = document.getElementById("noteTitle");
    const noteContent = document.getElementById("noteContent");

    // Load Notes from Local Storage
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        if (notesList) {
            notesList.innerHTML = "";
            notes.forEach((note, index) => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="view-note.html?index=${index}">${note.title}</a>`;
                notesList.appendChild(li);
            });
        }
    }

    // Save a New Note
    if (noteForm) {
        noteForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const notes = JSON.parse(localStorage.getItem("notes")) || [];
            notes.push({ title: noteTitle.value, content: noteContent.value });
            localStorage.setItem("notes", JSON.stringify(notes));
            window.location.href = "index.html";
        });
    }

    // View Note
    const urlParams = new URLSearchParams(window.location.search);
    const noteIndex = urlParams.get("index");
    if (noteIndex !== null) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        if (notes[noteIndex]) {
            document.getElementById("noteTitle").innerText = notes[noteIndex].title;
            document.getElementById("noteContent").innerText = notes[noteIndex].content;
        }
    }

    // Add Note Button Redirect
    const addNoteBtn = document.getElementById("addNoteBtn");
    if (addNoteBtn) {
        addNoteBtn.addEventListener("click", function () {
            window.location.href = "new_note.html";
        });
    }

    // Load notes on home page
    loadNotes();
});
