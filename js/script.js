document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // BACKEND URL
    // ==================================================

    const API_URL = "http://localhost:5000";


    // ==================================================
    // GET LOGGED-IN USER
    // ==================================================

    let currentUser = null;

    try {

        currentUser = JSON.parse(
            localStorage.getItem("user")
        );

    } catch (error) {

        console.error("Error reading user:", error);

    }


    // ==================================================
    // LOGIN
    // ==================================================

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();


            const email =
                document.getElementById("loginEmail").value.trim();

            const password =
                document.getElementById("loginPassword").value;


            try {

                const response = await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(data.message);


                    // Save logged-in user
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );


                    window.location.href =
                        "dashboard.html";

                } else {

                    alert(data.message);

                }


            } catch (error) {

                console.error(error);

                alert(
                    "Cannot connect to the server. Make sure your backend is running."
                );

            }

        });

    }


    // ==================================================
    // REGISTER
    // ==================================================

    const registerForm =
        document.getElementById("registerForm");


    if (registerForm) {

        registerForm.addEventListener("submit", async (e) => {

            e.preventDefault();


            const name =
                registerForm
                    .querySelector('input[name="name"]')
                    .value
                    .trim();


            const email =
                registerForm
                    .querySelector('input[name="email"]')
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            // Check passwords
            if (password !== confirmPassword) {

                alert("Passwords do not match.");

                return;
            }


            try {

                const response = await fetch(
                    `${API_URL}/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(data.message);

                    window.location.href =
                        "login.html";

                } else {

                    alert(data.message);

                }


            } catch (error) {

                console.error(error);

                alert(
                    "Cannot connect to the server. Make sure your backend is running."
                );

            }

        });

    }


    // ==================================================
    // NOTES VARIABLES
    // ==================================================

    const noteTitle =
        document.getElementById("noteTitle");

    const noteContent =
        document.getElementById("noteContent");

    const saveNoteBtn =
        document.getElementById("saveNoteBtn");

    const cancelEditBtn =
        document.getElementById("cancelEditBtn");

    const notesList =
        document.getElementById("notesList");

    const noteMessage =
        document.getElementById("noteMessage");


    // This stores the note ID while editing
    let editingNoteId = null;


    // ==================================================
    // LOAD NOTES
    // ==================================================

    async function loadNotes() {

        if (!notesList) {
            return;
        }


        // Check login
        if (!currentUser || !currentUser.id) {

            notesList.innerHTML =
                "<p>Please login first to view your notes.</p>";

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/notes?userId=${encodeURIComponent(currentUser.id)}`
            );


            const data =
                await response.json();


            if (!response.ok) {

                notesList.innerHTML =
                    `<p>${escapeHtml(data.message || "Unable to load notes.")}</p>`;

                return;
            }


            displayNotes(data);


        } catch (error) {

            console.error("Load notes error:", error);

            notesList.innerHTML =
                "<p>Cannot connect to the server.</p>";

        }

    }


    // ==================================================
    // DISPLAY NOTES
    // ==================================================

    function displayNotes(notes) {

        notesList.innerHTML = "";


        if (!notes || notes.length === 0) {

            notesList.innerHTML =
                "<p>No notes found. Create your first note! 📝</p>";

            return;
        }


        notes.forEach(note => {

            const noteCard =
                document.createElement("div");

            noteCard.className = "card";


            // Title
            const title =
                document.createElement("h3");

            title.textContent =
                note.title;


            // Content
            const content =
                document.createElement("p");

            content.textContent =
                note.content;


            // Date
            const date =
                document.createElement("small");


            if (note.createdAt) {

                date.textContent =
                    "Created: " +
                    new Date(note.createdAt)
                        .toLocaleString();

            }


            // Buttons container
            const buttonContainer =
                document.createElement("div");


            buttonContainer.style.marginTop =
                "15px";


            // Edit button
            const editButton =
                document.createElement("button");

            editButton.className =
                "btn secondary";

            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                () => editNote(note)
            );


            // Delete button
            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "btn";

            deleteButton.textContent =
                "Delete";


            deleteButton.style.marginLeft =
                "10px";


            deleteButton.addEventListener(
                "click",
                () => deleteNote(note._id)
            );


            // Add buttons
            buttonContainer.appendChild(
                editButton
            );

            buttonContainer.appendChild(
                deleteButton
            );


            // Add everything to card
            noteCard.appendChild(title);

            noteCard.appendChild(content);

            noteCard.appendChild(date);

            noteCard.appendChild(buttonContainer);


            notesList.appendChild(
                noteCard
            );

        });

    }


    // ==================================================
    // CREATE / UPDATE NOTE
    // ==================================================

    if (saveNoteBtn) {

        saveNoteBtn.addEventListener(
            "click",
            async () => {

                const title =
                    noteTitle.value.trim();

                const content =
                    noteContent.value.trim();


                // Validation
                if (!title || !content) {

                    showNoteMessage(
                        "Please enter both title and content.",
                        true
                    );

                    return;
                }


                if (!currentUser || !currentUser.id) {

                    showNoteMessage(
                        "Please login before saving notes.",
                        true
                    );

                    return;
                }


                // ==============================
                // UPDATE EXISTING NOTE
                // ==============================

                if (editingNoteId) {

                    await updateNote(
                        editingNoteId,
                        title,
                        content
                    );

                    return;
                }


                // ==============================
                // CREATE NEW NOTE
                // ==============================

                try {

                    const response = await fetch(
                        `${API_URL}/notes`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                userId: currentUser.id,
                                title: title,
                                content: content
                            })
                        }
                    );


                    const data =
                        await response.json();


                    if (response.ok) {

                        showNoteMessage(
                            "Note saved successfully! ✅",
                            false
                        );


                        // Clear inputs
                        noteTitle.value = "";

                        noteContent.value = "";


                        // Reload notes
                        await loadNotes();


                    } else {

                        showNoteMessage(
                            data.message ||
                            "Failed to save note.",
                            true
                        );

                    }


                } catch (error) {

                    console.error(
                        "Create note error:",
                        error
                    );


                    showNoteMessage(
                        "Cannot connect to the server.",
                        true
                    );

                }

            }
        );

    }


    // ==================================================
    // EDIT NOTE
    // ==================================================

    function editNote(note) {

        editingNoteId =
            note._id;


        noteTitle.value =
            note.title;

        noteContent.value =
            note.content;


        saveNoteBtn.textContent =
            "Update Note";


        cancelEditBtn.style.display =
            "inline-block";


        noteTitle.focus();


        showNoteMessage(
            "Editing note...",
            false
        );

    }


    // ==================================================
    // UPDATE NOTE
    // ==================================================

    async function updateNote(
        id,
        title,
        content
    ) {

        try {

            const response = await fetch(
                `${API_URL}/notes/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: title,
                        content: content
                    })
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                showNoteMessage(
                    "Note updated successfully! ✅",
                    false
                );


                // Reset form
                resetNoteForm();


                // Reload notes
                await loadNotes();


            } else {

                showNoteMessage(
                    data.message ||
                    "Failed to update note.",
                    true
                );

            }


        } catch (error) {

            console.error(
                "Update note error:",
                error
            );


            showNoteMessage(
                "Cannot connect to the server.",
                true
            );

        }

    }


    // ==================================================
    // DELETE NOTE
    // ==================================================

    async function deleteNote(id) {

        const confirmDelete =
            confirm(
                "Are you sure you want to delete this note?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/notes/${id}`,
                {
                    method: "DELETE"
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                showNoteMessage(
                    "Note deleted successfully! 🗑️",
                    false
                );


                // Reload notes
                await loadNotes();


            } else {

                showNoteMessage(
                    data.message ||
                    "Failed to delete note.",
                    true
                );

            }


        } catch (error) {

            console.error(
                "Delete note error:",
                error
            );


            showNoteMessage(
                "Cannot connect to the server.",
                true
            );

        }

    }


    // ==================================================
    // CANCEL EDIT
    // ==================================================

    if (cancelEditBtn) {

        cancelEditBtn.addEventListener(
            "click",
            () => {

                resetNoteForm();

                showNoteMessage(
                    "",
                    false
                );

            }
        );

    }


    // ==================================================
    // RESET NOTE FORM
    // ==================================================

    function resetNoteForm() {

        editingNoteId = null;


        noteTitle.value = "";

        noteContent.value = "";


        saveNoteBtn.textContent =
            "Save Note";


        cancelEditBtn.style.display =
            "none";

    }


    // ==================================================
    // NOTE MESSAGE
    // ==================================================

    function showNoteMessage(
        message,
        isError
    ) {

        if (!noteMessage) {
            return;
        }


        noteMessage.textContent =
            message;


        if (isError) {

            noteMessage.style.color =
                "red";

        } else {

            noteMessage.style.color =
                "green";

        }

    }


    // ==================================================
    // AI SUMMARY - PHASE 1 DEMO
    // ==================================================

    const summaryBtn =
        document.getElementById("summaryBtn");


    if (summaryBtn) {

        summaryBtn.addEventListener(
            "click",
            () => {

                const input =
                    document
                        .getElementById("notesInput")
                        .value
                        .trim();


                const output =
                    document.getElementById(
                        "summaryOutput"
                    );


                if (!input) {

                    output.innerHTML =
                        "<p>Please enter some notes first.</p>";

                    return;
                }


                const words =
                    input
                        .split(/\s+/)
                        .slice(0, 45)
                        .join(" ");


                const totalWords =
                    input.split(/\s+/).length;


                output.innerHTML = "";


                const heading =
                    document.createElement("p");

                heading.innerHTML =
                    "<strong>Demo Summary:</strong>";


                const summary =
                    document.createElement("p");

                summary.textContent =
                    words +
                    (
                        totalWords > 45
                            ? "..."
                            : ""
                    );


                const message =
                    document.createElement("p");

                message.className =
                    "note";

                message.textContent =
                    "This is currently a Phase 1 demo. Real AI summarization will be connected later.";


                output.appendChild(
                    heading
                );

                output.appendChild(
                    summary
                );

                output.appendChild(
                    message
                );

            }
        );

    }


    // ==================================================
    // QUIZ - PHASE 1 DEMO
    // ==================================================

    const quizBtn =
        document.getElementById("quizBtn");


    if (quizBtn) {

        quizBtn.addEventListener(
            "click",
            () => {

                const selected =
                    document.querySelector(
                        'input[name="q1"]:checked'
                    );


                const result =
                    document.getElementById(
                        "quizResult"
                    );


                if (!selected) {

                    result.textContent =
                        "Please select an answer.";

                } else if (
                    selected.value === "25"
                ) {

                    result.textContent =
                        "✅ Correct! 5 × 5 = 25.";

                } else {

                    result.textContent =
                        "❌ Not quite. The correct answer is 25.";

                }

            }
        );

    }


    // ==================================================
    // AI ASSISTANT - PHASE 1 DEMO
    // ==================================================

    const sendBtn =
        document.getElementById("sendBtn");


    const chatInput =
        document.getElementById("chatInput");


    if (sendBtn && chatInput) {

        const sendMessage = () => {

            const text =
                chatInput.value.trim();


            if (!text) {
                return;
            }


            const box =
                document.getElementById(
                    "chatBox"
                );


            // User message
            const userMessage =
                document.createElement("div");

            userMessage.className =
                "message user";

            userMessage.textContent =
                text;


            box.appendChild(
                userMessage
            );


            // Demo AI response
            let answer =
                "That's a great study question! In Phase 1, this is a demo response. Real AI can be connected later.";


            if (
                /photosynthesis/i.test(text)
            ) {

                answer =
                    "Photosynthesis is the process plants use to make food using sunlight, water and carbon dioxide.";

            } else if (
                /math|calculate|equation/i.test(text)
            ) {

                answer =
                    "For mathematics, try breaking the problem into smaller steps and checking your answer.";

            }


            const aiMessage =
                document.createElement("div");

            aiMessage.className =
                "message ai";

            aiMessage.textContent =
                answer;


            box.appendChild(
                aiMessage
            );


            chatInput.value = "";


            box.scrollTop =
                box.scrollHeight;

        };


        sendBtn.addEventListener(
            "click",
            sendMessage
        );


        chatInput.addEventListener(
            "keydown",
            (e) => {

                if (e.key === "Enter") {

                    sendMessage();

                }

            }
        );

    }


    // ==================================================
    // PLANNER - PHASE 1 DEMO
    // ==================================================

    const addTaskBtn =
        document.getElementById(
            "addTaskBtn"
        );


    if (addTaskBtn) {

        addTaskBtn.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "taskInput"
                    );


                const task =
                    input.value.trim();


                if (!task) {
                    return;
                }


                const li =
                    document.createElement(
                        "li"
                    );


                const label =
                    document.createElement(
                        "label"
                    );


                const checkbox =
                    document.createElement(
                        "input"
                    );


                checkbox.type =
                    "checkbox";


                label.appendChild(
                    checkbox
                );


                label.appendChild(
                    document.createTextNode(
                        " " + task
                    )
                );


                li.appendChild(
                    label
                );


                document
                    .getElementById(
                        "taskList"
                    )
                    .appendChild(li);


                input.value = "";

            }
        );

    }


    // ==================================================
    // ESCAPE HTML
    // ==================================================

    function escapeHtml(str) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            str;


        return div.innerHTML;

    }


    // ==================================================
    // LOAD NOTES WHEN NOTES PAGE OPENS
    // ==================================================

    if (notesList) {

        loadNotes();

    }

});