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
    contentSecurityPolicy: false, // Allows flexible frontend asset loading
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

    // Agent Complaints Table (For VIP Accountability)
    db.run(`CREATE TABLE IF NOT EXISTS agent_complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        complainant_phone TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT DEFAULT 'Under Review',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// --- API Endpoints: Help Requests ---

// POST: Submit a new help request securely
app.post('/api/requests', (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
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
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- Global 404 Fallback Handler ---
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// --- Server Listener ---
app.listen(PORT, () => {
    console.log(`🌟 Probashi Help Iraq Master Server is running live on port ${PORT}`);
});
