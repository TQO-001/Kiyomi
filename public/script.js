const API_URL = "http://localhost:3000/students";

document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
});

document.getElementById("student-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    //  Use .trim() to remove any leading/trailing whitespace
    const S_NAME = document.getElementById("S_NAME").value.trim();
    const S_SURNAME = document.getElementById("S_SURNAME").value.trim();
    const S_EMAIL = document.getElementById("S_EMAIL").value.trim();

    //  Basic client-side validation for form submission
    if (!S_NAME || !S_SURNAME || !S_EMAIL) {
        alert("Please fill in all student details (Name, Surname, Email).");
        return; //  Stop the function if validation fails
    } 
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ S_NAME, S_SURNAME, S_EMAIL })
        });

        //  Always attempt to parse the response as JSON, even if it's an error.
        //  The server is now guaranteed to send JSON responses for errors and successes.
        const result = await response.json();

        if (!response.ok) { //  Check if the HTTP status code is NOT in the 200-299 range
            console.error("Error adding student (backend response): ", result);
            alert(`Error adding student: ${result.message || result.error || 'Unknown error'}`);
            return; //  Stop execution if there was a server-side error
        }

        console.log("Student added succesfully: ", result);
        alert(result.message); //   Display the success message from the server
        e.target.reset();   //  Clear the form fields
        loadStudents();     //  Reload the student list to show the new entry
    } catch (error) {
        //  This catch block handles network errors or issues with parsing JSON
        console.error("Error adding student (network or JSON parsing issue): ", error);
        alert("A network error occurred or the server's response was invalid. Please check your browser's console for details.");
    }
});

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) { //  Check if the HTTP status code is NOT in the 200-299 range
            const errorData = await response.json();    //  Attempt to parse error as JSON
            console.error("Error fetching students (backend response): ", errorData);
            alert(`Error loading students: ${errorData.message || errorData.error || 'Unknown error'}`);
            return; //  Stop execution if there was a server-side error
        }

        const students = await response.json(); //  Parse the successful JSON response

        const tbody = document.getElementById("student-table-body");
        tbody.innerHTML = "";   //  Clear existing rows in the table

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No Students Found. Add some!</td></tr>';
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.ID}</td>
                <td><input value="${student.S_NAME}" data-original="${student.S_NAME}" /></td>
                <td><input value="${student.S_SURNAME}" data-original="${student.S_SURNAME}" /></td>
                <td><input value="${student.S_EMAIL}" data-original="${student.S_EMAIL}" /></td>
                <td>
                    <button class="update" onclick="updateStudent(${student.ID}, this)">Update</button>
                    <button class="delete" onclick="deleteStudent(${student.ID}, this)">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        //  This catch block handles network errors or issues with parsing JSON
        console.error("Error fetching students (network or JSON parsing issue): ", error);
        alert("A network error occurred or the server's response was invalid. Please check your browser's console for details.");
    }
}

async function updateStudent(id, btn) {
    const row = btn.closest("tr");
    const S_NAME_input = row.children[1].children[0].value;
    const S_SURNAME_input = row.children[2].children[0].value;
    const S_EMAIL_input = row.children[3].children[0].value;

    const S_NAME = S_NAME_input.value.trim();
    const S_SURNAME = S_SURNAME_input.value.trim();
    const S_EMAIL = S_EMAIL_input.value.trim();

    //  Check if value have actually changed before sending update request
    if (S_NAME === S_NAME_input.dataset.original &&
        S_NAME === S_SURNAME_input.dataset.original &&
        S_NAME === S_EMAIL_input.dataset.original) {
        alert("No changes detected. Nothing to update.");
        return;
    }

    //  Client-side validation for update fields
    if (!S_NAME || !S_SURNAME || !S_EMAIL) {
        alert("All fields (s_NAME, SURNAME, S_EMAIL) are required for update.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ S_NAME, S_SURNAME, S_EMAIL })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`Error updating student ID ${id} (backend response):`, result);
            alert(`Error updating student: ${result.message || result.error || 'Unknown error'}`);
            return;
        }

        console.log("Student updated: ", result);
        alert(result.message);  
        loadStudents(); //  Reload table to reflect updated data
    } catch (error) {
        console.error(`Error updating student ID ${id} (network or JSON parsing issue): `, error);
        alert("A network error occurred or the server's response was invalid. Please check your browser's console for details.");
    }
}

async function deleteStudent(id) {
    if (!confirm(`Are you sure you want to delete student with ID ${id}? This action cannot be undone.`)) {
        return; //  User cancelled the deletion
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`Error deleting student ID ${id} (backend response):`, result);
            alert(`Error deleting student: ${result.message || result.error || 'Unknown error'}`);
            return;
        }

        console.log("Student deleted: ", result);
        alert(result.message);
        loadStudents(); //  Reload table to remove the deleted entry
    } catch (error) {
        console.error(`Error deleting student ID ${id} (network or JSON parsing issue): `, error);
        alert("A network error occurred or the server's response was invalid. Please check your browser's console for details.");
    }
}
