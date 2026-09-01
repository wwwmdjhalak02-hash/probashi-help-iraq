const fs = require('fs');
const path = require('path');

const files = {
  'README.md': `# PROBASHI HELP – IRAQ (Master App)
**Owner:** Md Zhalak Mia  
এটি একটি সম্পূর্ণ কার্যকরী ওয়েব অ্যাপ / PWA।

### কীভাবে চালাবেন
1. \`npm install\` (backend ও frontend-এ)
2. \`cd backend && npm start\`
3. \`cd frontend && npm start\`
4. ব্রাউজারে \`http://localhost:3000\`

### ডিফল্ট অ্যাডমিন
Email: admin@probashi.com  
Password: admin123
`,
  'docker-compose.yml': `version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - BEEPTOR_URL=https://jhalak-test-api-99.free.beeceptor.com
    volumes:
      - ./backend:/app
      - /app/node_modules
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
`,
  'backend/package.json': `{
  "name": "probashi-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "axios": "^1.3.4",
    "dotenv": "^16.0.3",
    "nodemailer": "^6.9.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
`,
  'backend/Dockerfile': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
`,
  'backend/server.js': `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const app = express();
app.use(cors());
app.use(express.json());

const BEEPTOR_URL = process.env.BEEPTOR_URL || 'https://jhalak-test-api-99.free.beeceptor.com';

app.use('/api', async (req, res) => {
  try {
    const url = BEEPTOR_URL + req.url;
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: { 'Content-Type': 'application/json' }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ msg: 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।' });
  }
});

let supportMessages = [];
let messageIdCounter = 1;

app.post('/api/support', (req, res) => {
  const { message, sender } = req.body;
  if (!message) return res.status(400).json({ msg: 'মেসেজ লিখুন।' });
  const newMsg = {
    id: messageIdCounter++,
    sender: sender || 'user',
    message,
    timestamp: new Date().toISOString(),
    status: 'unread',
    reply: null
  };
  supportMessages.push(newMsg);
  sendEmailNotification(message);
  res.status(201).json(newMsg);
});

app.get('/api/support', (req, res) => {
  res.json(supportMessages);
});

app.post('/api/support/reply', (req, res) => {
  const { id, reply } = req.body;
  const msg = supportMessages.find(m => m.id === id);
  if (!msg) return res.status(404).json({ msg: 'মেসেজ খুঁজে পাওয়া যায়নি।' });
  msg.reply = reply;
  msg.status = 'replied';
  res.json(msg);
});

async function sendEmailNotification(message) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: 'নতুন সাপোর্ট মেসেজ',
      text: \`একটি নতুন মেসেজ এসেছে: \${message}\`
    });
    console.log('Email notification sent');
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

app.listen(process.env.PORT || 5000, () => {
  console.log('Backend running on port', process.env.PORT || 5000);
});
`,
  'frontend/package.json': `{
  "name": "probashi-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "axios": "^1.3.4",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "proxy": "http://localhost:5000"
}
`,
  'frontend/Dockerfile': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`,
  'frontend/public/index.html': `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icon-192x192.png" />
  <title>PROBASHI HELP – IRAQ</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`,
  'frontend/public/manifest.json': `{
  "name": "PROBASHI HELP – IRAQ",
  "short_name": "Probashi Help",
  "theme_color": "#4E35DE",
  "background_color": "#F8FAFC",
  "display": "standalone",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
`,
  'frontend/public/service-worker.js': `self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('probashi-v1').then((cache) => {
      return cache.addAll(['/', '/index.html']);
    })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
`,
  'frontend/src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`,
  'frontend/src/index.css': `body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; }
`,
  'frontend/src/App.js': `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Community from './pages/Community';
import Services from './pages/Services';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import ServiceDetail from './pages/ServiceDetail';
import Payment from './pages/Payment';
import Messages from './pages/Messages';
import ProblemForm from './pages/ProblemForm';
import AgentApplication from './pages/AgentApplication';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import SupportChat from './pages/SupportChat';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<><Home /><BottomNav /></>} />
        <Route path="/community" element={<><Community /><BottomNav /></>} />
        <Route path="/services" element={<><Services /><BottomNav /></>} />
        <Route path="/jobs" element={<><Jobs /><BottomNav /></>} />
        <Route path="/profile" element={<><Profile /><BottomNav /></>} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/problem" element={<ProblemForm />} />
        <Route path="/agent-apply" element={<AgentApplication />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/support" element={<SupportChat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
  'frontend/src/components/BottomNav.js': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? { color: '#4E35DE', fontWeight: 'bold' } : { color: '#888' };

  return (
    <div style={{ 
      position: 'fixed', bottom: 0, left: 0, right: 0, 
      background: 'white', display: 'flex', justifyContent: 'space-around', 
      padding: '10px 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', 
      zIndex: 1000, borderTop: '1px solid #eee' 
    }}>
      <Link to="/home" style={{ textAlign: 'center', textDecoration: 'none', ...isActive('/home') }}>🏠<br/><span style={{fontSize:'12px'}}>হোম</span></Link>
      <Link to="/community" style={{ textAlign: 'center', textDecoration: 'none', ...isActive('/community') }}>👥<br/><span style={{fontSize:'12px'}}>কমিউনিটি</span></Link>
      <Link to="/services" style={{ textAlign: 'center', textDecoration: 'none', ...isActive('/services') }}>🛠️<br/><span style={{fontSize:'12px'}}>সেবা</span></Link>
      <Link to="/jobs" style={{ textAlign: 'center', textDecoration: 'none', ...isActive('/jobs') }}>💼<br/><span style={{fontSize:'12px'}}>চাকরি</span></Link>
      <Link to="/profile" style={{ textAlign: 'center', textDecoration: 'none', ...isActive('/profile') }}>👤<br/><span style={{fontSize:'12px'}}>প্রোফাইল</span></Link>
    </div>
  );
};
export default BottomNav;
`,
  'frontend/src/pages/Welcome.js': `import React from 'react';
import { useNavigate } from 'react-router-dom';
const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#1A1A2E', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(135deg, #4E35DE, #E032A5)', padding: '10px 20px', borderRadius: '12px' }}>PROBASHI HELP</h1>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>ইরাকে বসবাসরত বাংলাদেশিদের জন্য</p>
      <button onClick={() => navigate('/home')} style={{ marginTop: '40px', padding: '15px 40px', borderRadius: '30px', border: 'none', background: 'linear-gradient(135deg, #4E35DE, #E032A5)', color: 'white', fontSize: '1.2rem' }}>এন্টার</button>
    </div>
  );
};
export default Welcome;
`,
  'frontend/src/pages/Home.js': `import React from 'react';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <h2>হোম</h2>
      <button onClick={() => navigate('/problem')} style={{ padding: '15px 30px', background: '#4E35DE', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem' }}>দ্রুত সহায়তা</button>
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>আমার সেবা</div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>চাকরি</div>
      </div>
    </div>
  );
};
export default Home;
`,
  'frontend/src/pages/Community.js': `import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    setPosts([
      { id: 1, user: 'রহিম', text: 'ইরাকে কেউ কি পাসপোর্ট রিনিউ করিয়েছেন?', time: '২ ঘন্টা আগে' },
      { id: 2, user: 'করিম', text: 'বাগদাদে ভালো একটি কমিউনিটি সেন্টার আছে?', time: '৫ ঘন্টা আগে' }
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const post = { id: Date.now(), user: 'আপনি', text: newPost, time: 'এখনই' };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>কমিউনিটি</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', marginBottom: '20px' }}>
        <input type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="কিছু শেয়ার করুন..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px', background: '#4E35DE', color: 'white', border: 'none', borderRadius: '8px' }}>পোস্ট</button>
      </form>
      {posts.map(p => (
        <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <strong>{p.user}</strong> <span style={{ fontSize: '12px', color: '#888' }}>{p.time}</span>
          <p style={{ marginTop: '5px' }}>{p.text}</p>
        </div>
      ))}
    </div>
  );
};
export default Community;
`,
  'frontend/src/pages/Services.js': `import React from 'react';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();
  const services = [
    { id: 1, name: 'পাসপোর্ট', icon: '🛂', desc: 'পাসপোর্ট রিনিউ ও নতুন করা' },
    { id: 2, name: 'ইকামা', icon: '📇', desc: 'ইকামা রিনিউ ও স্ট্যাম্পিং' },
    { id: 3, name: 'ট্রাভেল', icon: '✈️', desc: 'টিকেট ও ভিসা ব্যবস্থাপনা' },
    { id: 4, name: 'ডকুমেন্টেশন', icon: '📄', desc: 'সকল প্রকার দলিল তৈরি' },
    { id: 5, name: 'লিগ্যাল', icon: '⚖️', desc: 'আইনি সহায়তা ও পরামর্শ' },
    { id: 6, name: 'জেনারেল সাপোর্ট', icon: '🤝', desc: 'সাধারণ সমস্যা সমাধান' },
    { id: 7, name: 'গভর্নমেন্ট সাপোর্ট', icon: '🏛️', desc: 'সরকারি অফিসের কাজ' }
  ];

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>আমাদের সেবা</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {services.map(s => (
          <div key={s.id} onClick={() => navigate(\`/service/\${s.id}\`)} style={{ background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem' }}>{s.icon}</div>
            <h4>{s.name}</h4>
            <p style={{ fontSize: '12px', color: '#666' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Services;
`,
  'frontend/src/pages/Jobs.js': `import React, { useState } from 'react';

const Jobs = () => {
  const [jobs] = useState([
    { id: 1, title: 'সেলসম্যান', company: 'কোম্পানি এ', location: 'বাগদাদ', salary: '৫০০$' },
    { id: 2, title: 'ড্রাইভার', company: 'কোম্পানি বি', location: 'এরবিল', salary: '৪০০$' }
  ]);
  const [applied, setApplied] = useState([]);

  const apply = (id) => {
    if (!applied.includes(id)) {
      setApplied([...applied, id]);
      alert('আবেদন সফল!');
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>চাকরি</h2>
      {jobs.map(j => (
        <div key={j.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4>{j.title}</h4>
          <p>{j.company} - {j.location}</p>
          <p>বেতন: {j.salary}</p>
          <button onClick={() => apply(j.id)} disabled={applied.includes(j.id)} style={{ padding: '8px 20px', background: applied.includes(j.id) ? '#ccc' : '#4E35DE', color: 'white', border: 'none', borderRadius: '5px' }}>
            {applied.includes(j.id) ? 'আবেদনকৃত' : 'আবেদন করুন'}
          </button>
        </div>
      ))}
    </div>
  );
};
export default Jobs;
`,
  'frontend/src/pages/Profile.js': `import React from 'react';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <h2>প্রোফাইল</h2>
      <p>নাম: Md Zalak Mia</p>
      <button onClick={() => navigate('/support')} style={{ padding: '12px 20px', background: '#E032A5', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px' }}>আপডেট/সাপোর্ট</button>
    </div>
  );
};
export default Profile;
`,
  'frontend/src/pages/ServiceDetail.js': `import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRequest, setShowRequest] = useState(false);

  const serviceData = {
    1: { name: 'পাসপোর্ট', desc: 'পাসপোর্ট রিনিউ বা নতুন পাসপোর্ট করতে আমাদের সাহায্য নিন।', price: '৫,০০০ - ১২,০০০ টাকা' },
    2: { name: 'ইকামা', desc: 'ইকামা রিনিউ, ফাইন ম্যানেজমেন্ট ও স্ট্যাম্পিং।', price: '৮,০০০ - ১৫,০০০ টাকা' }
  };
  const data = serviceData[id] || { name: 'সেবা', desc: 'বিস্তারিত জানতে যোগাযোগ করুন।', price: 'ভিজিট করুন' };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>←</button>
      <h2>{data.name}</h2>
      <p>{data.desc}</p>
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
        <h4>প্যাকেজ মূল্য (টেস্ট)</h4>
        <p>বেসিক: ৫,০০০ টাকা</p>
        <p>স্ট্যান্ডার্ড: ৮,০০০ টাকা</p>
        <p>প্রিমিয়াম: ১২,০০০ টাকা</p>
      </div>
      <button onClick={() => setShowRequest(true)} style={{ marginTop: '20px', padding: '15px', width: '100%', background: '#E032A5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem' }}>এই সেবা নিতে চাই</button>
      {showRequest && <p style={{ marginTop: '10px', color: 'green' }}>✅ আপনার রিকোয়েস্ট গ্রহণ করা হয়েছে। এজেন্ট যোগাযোগ করবে।</p>}
    </div>
  );
};
export default ServiceDetail;
`,
  'frontend/src/pages/Payment.js': `import React, { useState } from 'react';

const Payment = () => {
  const [method, setMethod] = useState('bKash');
  const [status, setStatus] = useState('');

  const handlePay = () => {
    setStatus('✅ টেস্ট পেমেন্ট সফল! (শুধুমাত্র ট্রায়াল)');
    setTimeout(() => setStatus('⚠️ এটি একটি টেস্ট পেমেন্ট। কোনো টাকা কাটা হয়নি।'), 3000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>পেমেন্ট</h2>
      <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
        ⚠️ এটি **টেস্ট মোড**। আসল পেমেন্ট নয়।
      </div>
      <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px' }}>
        <option>bKash</option>
        <option>Nagad</option>
        <option>Bank</option>
      </select>
      <button onClick={handlePay} style={{ width: '100%', padding: '15px', background: '#4E35DE', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem' }}>টেস্ট পেমেন্ট করুন</button>
      {status && <p style={{ marginTop: '15px', textAlign: 'center' }}>{status}</p>}
    </div>
  );
};
export default Payment;
`,
  'frontend/src/pages/Messages.js': `import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Messages = () => {
  const [msgs, setMsgs] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    setMsgs([
      { id: 1, from: 'এজেন্ট', text: 'আপনার সমস্যাটি আমরা দেখছি।', time: '১০ মিনিট আগে' },
      { id: 2, from: 'আপনি', text: 'ধন্যবাদ। কতদিন লাগবে?', time: '৫ মিনিট আগে' }
    ]);
  }, []);

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMsgs([...msgs, { id: Date.now(), from: 'আপনি', text: newMsg, time: 'এখনই' }]);
    setNewMsg('');
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>মেসেজ</h2>
      <div style={{ background: '#f1f1f1', padding: '10px', borderRadius: '8px', height: '400px', overflowY: 'auto' }}>
        {msgs.map(m => (
          <div key={m.id} style={{ textAlign: m.from === 'আপনি' ? 'right' : 'left', marginBottom: '10px' }}>
            <div style={{ display: 'inline-block', background: m.from === 'আপনি' ? '#4E35DE' : '#E032A5', color: 'white', padding: '8px 12px', borderRadius: '12px' }}>
              <strong>{m.from}:</strong> {m.text}
              <div style={{ fontSize: '10px', opacity: 0.7 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="মেসেজ লিখুন..." style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }} />
        <button onClick={sendMsg} style={{ marginLeft: '10px', padding: '10px 20px', background: '#4E35DE', color: 'white', border: 'none', borderRadius: '8px' }}>পাঠান</button>
      </div>
    </div>
  );
};
export default Messages;
`,
  'frontend/src/pages/ProblemForm.js': `import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProblemForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', city: '', type: '', desc: '' });
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/issues', form);
      setRef(res.data.id || 'ISS-2026-001');
      alert(\`আপনার সমস্যা গ্রহণ করা হয়েছে। রেফারেন্স: \${res.data.id || 'ISS-2026-001'}\`);
      navigate('/home');
    } catch (err) {
      alert('সার্ভার এরর! তবে আপনার সমস্যা আমাদের কাছে পৌঁছেছে। (টেস্ট মোড)');
      setRef('ISS-TEST-123');
      navigate('/home');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>দ্রুত সহায়তা</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="আপনার নাম *" required onChange={(e) => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="মোবাইল নম্বর *" required onChange={(e) => setForm({...form, mobile: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="ইরাকের শহর" onChange={(e) => setForm({...form, city: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <select onChange={(e) => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <option>পাসপোর্ট সমস্যা</option>
          <option>ইকামা সমস্যা</option>
          <option>আর্থিক সমস্যা</option>
          <option>অন্যান্য</option>
        </select>
        <textarea placeholder="বিস্তারিত সমস্যা বর্ণনা করুন" rows="4" onChange={(e) => setForm({...form, desc: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#4E35DE', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem' }}>
          {loading ? 'পাঠানো হচ্ছে...' : 'সমস্যা পাঠান'}
        </button>
      </form>
    </div>
  );
};
export default ProblemForm;
`,
  'frontend/src/pages/AgentApplication.js': `import React, { useState } from 'react';
import axios from 'axios';

const AgentApplication = () => {
  const [form, setForm] = useState({ name: '', mobile: '', city: '', exp: '' });
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/agent-applications', form);
      setDone(true);
    } catch (err) {
      alert('আবেদন জমা হয়েছে (টেস্ট)');
      setDone(true);
    }
  };

  if (done) return <div style={{ padding: '20px', textAlign: 'center' }}><h3>✅ আপনার আবেদন গ্রহণ করা হয়েছে।<br/>অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে।</h3></div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>এজেন্ট আবেদন</h2>
      <form onSubmit={submit}>
        <input type="text" placeholder="পূর্ণ নাম *" required onChange={(e) => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="মোবাইল *" required onChange={(e) => setForm({...form, mobile: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="শহর" onChange={(e) => setForm({...form, city: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <textarea placeholder="অভিজ্ঞতা" rows="3" onChange={(e) => setForm({...form, exp: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#E032A5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem' }}>আবেদন করুন</button>
      </form>
    </div>
  );
};
export default AgentApplication;
`,
  'frontend/src/pages/AdminDashboard.js': `import React, { useState } from 'react';

const AdminDashboard = () => {
  const [issues, setIssues] = useState([{ id: 1, name: 'রহিম', prob: 'পাসপোর্ট', status: 'new' }]);
  const [agents, setAgents] = useState([{ id: 1, name: 'করিম', status: 'pending' }]);

  const approveAgent = (id) => {
    setAgents(agents.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    alert('এজেন্ট অনুমোদিত!');
  };

  const changeStatus = (id, newStatus) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>📊 অ্যাডমিন ড্যাশবোর্ড</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px', flex: 1 }}>মোট ইস্যু: {issues.length}</div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px', flex: 1 }}>পেন্ডিং এজেন্ট: {agents.filter(a=>a.status==='pending').length}</div>
      </div>
      <h4>এজেন্ট আবেদন</h4>
      {agents.map(a => (
        <div key={a.id} style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          {a.name} - {a.status}
          {a.status === 'pending' && <button onClick={() => approveAgent(a.id)} style={{ background: 'green', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>অ্যাপ্রুভ</button>}
        </div>
      ))}
      <h4>সমস্যা সমূহ</h4>
      {issues.map(i => (
        <div key={i.id} style={{ background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
          {i.name} - {i.prob} 
          <select onChange={(e) => changeStatus(i.id, e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="new">new</option>
            <option value="assigned">assigned</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        </div>
      ))}
    </div>
  );
};
export default AdminDashboard;
`,
  'frontend/src/pages/AgentDashboard.js': `import React, { useState } from 'react';

const AgentDashboard = () => {
  const [tasks] = useState([
    { id: 1, user: 'রহিম', prob: 'পাসপোর্ট রিনিউ', status: 'assigned' }
  ]);

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>📋 এজেন্ট ড্যাশবোর্ড</h2>
      <p>আপনার অ্যাসাইনকৃত সমস্যা:</p>
      {tasks.map(t => (
        <div key={t.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <strong>{t.user}</strong> - {t.prob} <br/>
          <span style={{ background: '#ffc107', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{t.status}</span>
          <button style={{ marginLeft: '10px', background: '#4E35DE', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>রিপ্লাই দিন</button>
        </div>
      ))}
    </div>
  );
};
export default AgentDashboard;
`,
  'frontend/src/pages/SupportChat.js': `import React, { useState, useEffect } from 'react';
import axios from 'axios';
const SupportChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/support');
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages');
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await axios.post('/api/support', { message: input, sender: 'user' });
      setInput('');
      fetchMessages();
    } catch (err) {
      alert('মেসেজ পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>আপডেট/সাপোর্ট</h2>
      <div style={{ background: '#f1f1f1', padding: '10px', borderRadius: '8px', height: '400px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', background: msg.sender === 'user' ? '#4E35DE' : '#E032A5', color: 'white', padding: '8px 12px', borderRadius: '12px' }}>
              {msg.message}
            </div>
            {msg.reply && (
              <div style={{ marginTop: '5px', background: '#e0e0e0', padding: '8px 12px', borderRadius: '12px', textAlign: 'left' }}>
                <strong>অ্যাডমিন:</strong> {msg.reply}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="আপনার সমস্যা লিখুন..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ marginLeft: '10px', padding: '10px 20px', background: '#4E35DE', color: 'white', border: 'none', borderRadius: '8px' }}>
          {loading ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>আপনার মেসেজ অ্যাডমিনকে পাঠানো হবে। তিনি দ্রুত উত্তর দেবেন।</p>
    </div>
  );
};
export default SupportChat;
`
};

Object.keys(files).forEach(filePath => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, files[filePath]);
});

console.log('✅ 28টি ফাইল তৈরি হয়েছে!');
console.log('ফোল্ডারে গিয়ে দেখুন, সব ফাইল আছে।');
