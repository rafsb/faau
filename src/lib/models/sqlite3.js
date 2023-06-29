/*---------------------------------------------------------------------------------------------
 * iostore
 *--------------------------------------------------------------------------------------------*/

const
sqlite3 = require('sqlite3').verbose()
, db = new sqlite3.Database(`.${DB_NAME}_db`, e => e ? console.error(new Date(),`sqlite`, `initialization`, err.message) : VERBOSE > 3 && console.log(`Connected to the database ${DB_NAME}.`))
;;

// Create a table
db.run(`CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    salary REAL
)`);

// Insert data into the table
db.run(`INSERT INTO employees(id, name, age, salary) VALUES(?, ?, ?, ?)`, [1, 'John Doe', 25, 50000.00], function(err) {
  if (err) {
    return console.log(err.message);
  }
  console.log(`A row has been inserted with rowid ${this.lastID}`);
});

db.run(`INSERT INTO employees(id, name, age, salary) VALUES(?, ?, ?, ?)`, [2, 'Jane Doe', 30, 60000.00], function(err) {
  if (err) {
    return console.log(err.message);
  }
  console.log(`A row has been inserted with rowid ${this.lastID}`);
});

// Select data from the table
db.all(`SELECT * FROM employees`, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// Update data in the table
db.run(`UPDATE employees SET salary = ? WHERE id = ?`, [55000.00, 1], function(err) {
  if (err) {
    return console.log(err.message);
  }
  console.log(`Row(s) updated: ${this.changes}`);
});

// Delete data from the table
db.run(`DELETE FROM employees WHERE id = ?`, 2, function(err) {
  if (err) {
    return console.log(err.message);
  }
  console.log(`Row(s) deleted: ${this.changes}`);
});

// Close the database connection
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Closed the database connection.');
});