const sql = require("mssql/msnodesqlv8");
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
    console.log(`API server running on localhost:${3000}`);
})

const config = {
    connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-4GK2ERI;Database=StudentDB;Trusted_Connection=Yes"
};

sql.connect(config, function(err) {
    if (err) console.error(err);
    var request = new sql.Request();
    console.log("Connected using Windows Authentication!");
    
    request.query("SELECT * FROM STUDENTS", function(err, records) {
        if (err) console.log(err);
        else console.log(records);
    })
});

//  CREATE - Add a new student
app.post('/students', (req, res) => {
    const { S_NAME, S_SURNAME, S_MAIL } = Request.body;
    const query = `INSERT INTO STUDENTS VALUES ('${S_NAME}', '${S_SURNAME}', '${S_MAIL}')`;
    const request = new sql.Request();

    request.query(query, (err) => {
        if (err) res.status(500).send(err);
        else res.send('Student successfully added');
    })
})

//  READ - Get all data from the database
app.get("/students", (req, res) => {
    const request = new sql.Request();

    request.query("SELECT * FROM STUDENTS", (err, result) => {
        if (err) {
            console.log("Query failed: ", err);
            return res.status(500).send("Error querying DB");
        }
        console.log("Records returned from DB: ", result.recordset);
        res.send(result.recordset);
    });
});

//  UPDATE - Update student by ID
app.put("/student/:id", (req, res) => {
    const { id } = req.params;
    const { S_NAME, S_SURNAME, S_MAIL } =Request.body;
    const query = `UPDATE STUDENTS SET S_NAME='${S_NAME}', S_SURNAME='${S_SURNAME}', S_MAIL='${S_MAIL}' WHERE ID=${id}`;
    const request = new sql.Request();
    request.query(query, (err) => {
        if (err) res.status(500).send(err);
        else res.send("Student successfully added");
    });
});

//  DELETE - Delete student by ID
app.delete("/students/:id", (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM STUDENTS WHERE ID=${id}`;
    const request = new sql.Request();

    request.query(query, (err) => {
        if (err) res.status(500).send(err);
        else res.send("Student deleted successfully");
    });
});