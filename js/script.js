document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      alert("Demo login successful! Opening dashboard.");
      window.location.href = "dashboard.html";
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", e => {
      e.preventDefault();
      const p = document.getElementById("password").value;
      const cp = document.getElementById("confirmPassword").value;
      if (p !== cp) {
        alert("Passwords do not match.");
        return;
      }
      alert("Demo account created! Please login.");
      window.location.href = "login.html";
    });
  }

  const summaryBtn = document.getElementById("summaryBtn");
  if (summaryBtn) {
    summaryBtn.addEventListener("click", () => {
      const input = document.getElementById("notesInput").value.trim();
      const output = document.getElementById("summaryOutput");
      if (!input) {
        output.innerHTML = "<p>Please enter some notes first.</p>";
        return;
      }
      const words = input.split(/\s+/).slice(0, 45).join(" ");
      output.innerHTML = `<p><strong>Demo Summary:</strong></p><p>${words}${input.split(/\s+/).length > 45 ? "..." : ""}</p><p class="note">This is a Phase 1 demo. Real AI summarization can be connected later.</p>`;
    });
  }

  const quizBtn = document.getElementById("quizBtn");
  if (quizBtn) {
    quizBtn.addEventListener("click", () => {
      const selected = document.querySelector('input[name="q1"]:checked');
      const result = document.getElementById("quizResult");
      if (!selected) {
        result.textContent = "Please select an answer.";
      } else if (selected.value === "25") {
        result.textContent = "✅ Correct! 5 × 5 = 25.";
      } else {
        result.textContent = "❌ Not quite. The correct answer is 25.";
      }
    });
  }

  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  if (sendBtn && chatInput) {
    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;
      const box = document.getElementById("chatBox");
      box.innerHTML += `<div class="message user">${escapeHtml(text)}</div>`;
      let answer = "That's a great study question! In Phase 1, this is a demo response. Real AI can be connected in the next phase.";
      if (/photosynthesis/i.test(text)) answer = "Photosynthesis is the process plants use to make food using sunlight, water and carbon dioxide.";
      else if (/math|calculate|equation/i.test(text)) answer = "For mathematics, try breaking the problem into smaller steps and checking your answer.";
      box.innerHTML += `<div class="message ai">${answer}</div>`;
      chatInput.value = "";
      box.scrollTop = box.scrollHeight;
    };
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });
  }

  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      const input = document.getElementById("taskInput");
      const task = input.value.trim();
      if (!task) return;
      const li = document.createElement("li");
      li.innerHTML = `<label><input type="checkbox"> ${escapeHtml(task)}</label>`;
      document.getElementById("taskList").appendChild(li);
      input.value = "";
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});