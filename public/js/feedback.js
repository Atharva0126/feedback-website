// Toggle Add Feedback Form
function toggleFeedbackForm() {
    const form = document.getElementById("feedback-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

// Toggle Edit Feedback Form
function toggleEditForm() {
    const form = document.getElementById("edit-feedback-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

// Prepare Edit Feedback Form
function prepareEditForm(id, content) {
    document.getElementById("edit-feedback-id").value = id;
    document.getElementById("edit-feedback-text").value = content;

    // Show edit form
    document.getElementById("edit-feedback-form").style.display = "block";

    // Hide add feedback form
    document.getElementById("feedback-form").style.display = "none";
}




