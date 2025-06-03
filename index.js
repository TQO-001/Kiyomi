const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());    //  Essential for parsing JSON request bodies
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

//  Connecting to SQLite database (it will create file if it doesn't exist)
const db = new sqlite3.Database("./student.db", (err) => {
    if (err) {
        console.error("Database connection error: ", err.message);
        return; //  Stop if database connection fails
    }
    console.log("Connected to the SQLite database.");

    //  Create STUDENTS table if it doesn't exist
    //  Added UNIQUE constraint to S_EMAIL for better data integrity
    db.run(`
        CREATE TABLE IF NOT EXISTS STUDENTS(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            S_NAME TEXT NOT NULL,
            S_SURNAME TEXT NOT NULL,
            S_EMAIL TEXT NOT NULL UNIQUE
        )
        `, (createErr) => {
            if (createErr) {
                console.error("Error creating table:"), createErr.message ;
            } else {
                console.log("STUDENTS table checked/created.");
                // Optional: Insert some dummy data if the table is empty for easy testing
                db.get("SELECT COUNT(*) AS count FROM STUDENTS", (countErr, result) => {
                    if (countErr) {
                        console.error("Error checking student count:", countErr.message);
                        return;
                    }
                    if (result.count === 0) {
                        db.run(`INSERT INTO STUDENTS (S_NAME, S_SURNAME, S_EMAIL) VALUES (?, ?, ?)`,
                            ["John", "Doe", "john.doe@example.com"], (insertErr) => {
                                if (insertErr) console.error("Error inserting sample data 1: ", insertErr.message);
                                else console.log("Sample data 1 inserted.");
                            });
                        db.run(`INSERT INTO STUDENTS (S_NAME, S_SURNAME, S_EMAIL) VALUES (?, ?, ?)`,
                            ["Jane", "Smith", "jane.smith@example.com"], (insertErr) => {
                                if (insertErr) console.error("Error inserting sample data 1: ", insertErr.message);
                                else console.log("Sample data 2 inserted.");
                            });
                    }
            });
        }
    });
});
           
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});

//  CREATE - Add student
app.post("/students", (req, res) => {
    //  console.log("Recieved POST request to /students. req.body:", req.body); // Uncomment for debugging req.body

    const { S_NAME, S_SURNAME, S_EMAIL } = req.body;

    //  Server-side validation
    if (!S_NAME || !S_SURNAME || !S_EMAIL) {
        return res.status(400).json({
            error: "Bad Request",
            message: "All fields (s_NAME, SURNAME, S_EMAIL) are required."
        });
    }

    const query = `INSERT INTO STUDENTS (S_NAME, S_SURNAME, S_EMAIL) VALUES (?, ?, ?)`;
    db.run(query, [S_NAME, S_SURNAME, S_EMAIL], function (err) {
        if (err) {
            console.error("Error adding student:", err.message);
            // Check for unique constraint violation (e.g., if S_EMAIL is not unique)
            if (err.message.includes("SQLITE_CONSTRAINT")) {
                return res.status(409).json({ //    409 Conflict status
                    error: "Constraint Violation",
                    message: "An entry with this email already exists. Please use a unique email."
                });
            }
            return res.status(500) .json({ error: "Failed to add student", message: err.message }); // Send JSON error
        }
        // Send a 201 Created status and JSON response
        res.status(201).json({
            message: "Student successfully added!",
            id: this.lastID, // SQLite provides the ID of the last inserted row
            student: { S_NAME, S_SURNAME, S_EMAIL }
        });
    });
});

//  READ - Get all students
app.get("/students", (req, res) => {
    const query = `SELECT * FROM STUDENTS`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching students: ", err.message);
            return res.status(500).json({ error: "Failed to fetch students", message: err.message });   //  Send JSON error
        }
        res.json(rows); //  Already sends JSON
    });
});

//  UPDATE - Update student by ID
app.put("/students/:id", (req, res) => {
    const { id } = req.params;
    //  console.log(`Recieved PUT request for ID ${id}. req.body:` req.body);   //  Uncomment for debugging req.body

    const { S_NAME, S_SURNAME, S_EMAIL } = req.body;

    //  Server-side validation for update
    if (!S_NAME || !S_SURNAME || !S_EMAIL) {
        return res.status(400).json({
            error: "Bad Request",
            message: "All fields (s_NAME, SURNAME, S_EMAIL) are required for update."
        });
    }

    const query = `UPDATE STUDENTS SET S_NAME = ?, S_SURNAME = ?, S_EMAIL = ? WHERE ID = ?`;
    db.run(query, [S_NAME, S_SURNAME, S_EMAIL], function (err) {
        if (err) {
            console.error("Error updating student:", err.message);
            if (err.message.includes("SQLITE_CONSTRAINT")) {
                return res.status(409).json({ //    409 Conflict status
                    error: "Constraint Violation",
                    message: "Email already exists. Please use a unique email."
                });
            }
            return res.status(500) .json({ error: "Failed to add student", message: err.message }); // Send JSON error
        }
        if (this.changes === 0) {   //  Check if any rows were affected (0 means ID not found)
            return res.status(404).json({ message: `Student with ID ${id} not found.` });
        }
        res.json({ message: "Student successfully updated!" }); //  Send JSON success
    });
});

//  DELETE - Delete student by ID
app.delete("/student/:id", (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM STUDENTS WHERE ID = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Error deleting student: ", err.message);
            return res.status(500).json({ error: "Failed to delete student", message: err.message });   //  Send JSON error
        }
        if (this.changes === 0) {   //  Check if any rows were affected (0 means ID not found)
            return res.status(404).json({ message: `Student with ID ${id} not found.` });
        }
        res.json({ message: "Student deleted successfully" });   //  Send JSON success
    });
});