const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.run(`CREATE TABLE IF NOT EXISTS help_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    location TEXT,
    issue_type TEXT,
    urgency TEXT,
    issue TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/api/requests', (req, res) => {
    const { name, phone, whatsapp, location, issue_type, urgency, issue } = req.body;
    if (!name || !phone || !issue) return res.status(400).json({ error: 'আবশ্যক তথ্য দিন' });
    
    const sql = `INSERT INTO help_requests (name, phone, whatsapp, location, issue_type, urgency, issue) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, phone, whatsapp, location, issue_type, urgency, issue], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'অনুরোধ সফলভাবে জমা হয়েছে!' });
    });
});

app.get('/api/requests', (req, res) => {
    db.all(`SELECT * FROM help_requests ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
