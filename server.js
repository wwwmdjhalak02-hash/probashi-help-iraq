/**
 * =================================================================
 * Probashi Help Iraq - Enterprise Master Server & API Gateway
 * VIP-Quality Node.js, Express & SQLite Backend System
 * =================================================================
 */

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Enterprise-Grade Security & Middleware ---
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// --- High-Performance Database Initialization ---
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('🚀 Connected to SQLite database with elite master performance.');
    }
});

// --- Master Database Tables Setup ---
db.serialize(() => {
    // Help Requests Table
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

    // Notices Table for Notice Board
    db.run(`CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Passport Status Table
    db.run(`CREATE TABLE IF NOT EXISTS passports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicant_name TEXT NOT NULL,
        passport_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL,
        updated_date TEXT NOT NULL
    )`);
});

// --- API Endpoints: Help Requests ---

// POST: Submit a new help request
app.post('/api/requests', (req, res) => {
    const { name, phone, whatsapp, location, issue_type, urgency, issue } = req.body;
    
    if (!name || !phone || !issue) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'দয়া করে নাম, ফোন নম্বর এবং আপনার সমস্যার বিবরণ আবশ্যকভাবে পূরণ করুন।' 
        });
    }
    
    const sql = `INSERT INTO help_requests (name, phone, whatsapp, location, issue_type, urgency, issue) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, phone, whatsapp || '', location || '', issue_type || 'General', urgency || 'Normal', issue], function(err) {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.status(201).json({ 
            status: 'success', 
            message: 'আপনার সাহায্যের আবেদনটি সফলভাবে সিস্টেমে সংরক্ষিত হয়েছে!',
            requestId: this.lastID 
        });
    });
});

// GET: Fetch all help requests for Admin panel
app.get('/api/requests', (req, res) => {
    db.all(`SELECT * FROM help_requests ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.status(200).json({ status: 'success', data: rows });
    });
});

// PUT: Update request status from Admin panel
app.put('/api/requests/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    db.run(`UPDATE help_requests SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        res.status(200).json({ status: 'success', message: 'আবেদনের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।' });
    });
});

// --- API Endpoints: Notices ---
app.get('/api/notices', (req, res) => {
    db.all(`SELECT * FROM notices ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.status(200).json({ status: 'success', data: rows });
    });
});

// --- API Endpoints: Passport Status Lookup ---
app.get('/api/passport/:number', (req, res) => {
    const passNum = req.params.number;
    db.get(`SELECT * FROM passports WHERE passport_number = ?`, [passNum], (err, row) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        if (!row) return res.status(404).json({ status: 'error', message: 'পাসপোর্ট সংক্রান্ত কোনো তথ্য পাওয়া যায়নি।' });
        res.status(200).json({ status: 'success', data: row });
    });
});

// --- System Health Check Route ---
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        system: 'Probashi Help Iraq Master Core',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// --- Frontend HTML Routing ---
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'home.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'gallery.html')));
app.get('/notice', (req, res) => res.sendFile(path.join(__dirname, 'notice.html')));
app.get('/passport', (req, res) => res.sendFile(path.join(__dirname, 'passport-status.html')));
app.get('/partner', (req, res) => res.sendFile(path.join(__dirname, 'partner.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'home.html')));

// --- Global 404 Fallback Handler ---
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'home.html'));
});

// --- Server Listener ---
app.listen(PORT, () => {
    console.log(`🌟 Probashi Help Iraq Master Server is running live on port ${PORT}`);
});
