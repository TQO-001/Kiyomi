const API_URL = "http://localhost:3000/students";

document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
});

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const S_NAME = document.getElementById("S_NAME").value;
    const S_SURNAME = document.getElementById("S_SURNAME").value;
    const S_MAIL = document.getElementById("S_MAIL").value;

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ S_NAME, S_SURNAME, S_MAIL })
    });

    e.target.reset();
    loadStudents();
});

async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        const tbody = document.getElementById("student-table-body");
        tbody.innerHTML = "";

        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.ID}</td>
                <td><input value="${student.S_NAME}"></td>
                <td><input value="${student.S_SURNAME}"></td>
                <td><input value="${student.S_MAIL}"></td>
                <td>
                    <button class="edit" onclick="updateStudent(${student.ID}, this)">Update</button>
                    <button class="delete" onclick="deleteStudent(${student.ID}, this)"></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching students: ", error);
    }
}

async function updateStudent(id, btn) {
    const row = btn.closest("tr");
    const S_NAME = row.children[1].children[0].value;
    const S_SURNAME = row.children[2].children[0].value;
    const S_MAIL = row.children[3].children[0].value;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ S_NAME, S_SURNAME, S_MAIL })
    });

    loadStudents();
}

async function deleteStudent(id) {
    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    loadStudents();
}