# PROBASHI HELP – IRAQ (Master App)

**একটি সম্পূর্ণ কার্যকরী ওয়েব অ্যাপ / PWA**

**Owner:** Md Zhalak Mia  
**Purpose:** ইরাকে বসবাসরত বাংলাদেশিদের জন্য একটি সম্পূর্ণ সহায়তা প্ল্যাটফর্ম

---

## 🚀 শুরু করুন

### প্রয়োজনীয় সফটওয়্যার
- Node.js v18+ ([ডাউনলোড](https://nodejs.org/))
- npm v9+
- Git
- Docker (ঐচ্ছিক)

### ইনস্টলেশন

#### 1. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/yourusername/probashi-help-iraq.git
cd probashi-help-iraq
```

#### 2. Backend সেটআপ
```bash
cd backend
npm install
cp ../.env.example .env
# .env ফাইলে আপনার কনফিগারেশন এডিট করুন
npm run dev   # ডেভেলপমেন্ট মোডে
# অথবা
npm start     # প্রোডাকশন মোডে
```

Backend চলবে: `http://localhost:5000`

#### 3. Frontend সেটআপ
```bash
cd frontend
npm install
npm start
```

Frontend খুলবে: `http://localhost:3000`

---

## 🐳 Docker এ চালান

```bash
docker-compose up --build
```

এরপর ব্রাউজারে খুলুন: `http://localhost:3000`

---

## 🔐 ডিফল্ট অ্যাডমিন ক্রেডেনশিয়াল

| ক্ষেত্র | মান |
|--------|-----|
| Email | admin@probashi.com |
| Password | admin123 |

⚠️ **প্রোডাকশনে এটি অবশ্যই পরিবর্তন করুন!**

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
probashi-help-iraq/
├── backend/                 # Express.js Backend
│   ├── routes/             # API রুট
│   ├── controllers/        # বিজনেস লজিক
│   ├── middleware/         # কাস্টম মিডলওয়্যার
│   ├── models/             # ডাটাবেস মডেল (আসছে)
│   ├── .env.example        # এনভায়রনমেন্ট টেমপ্লেট
│   ├── server.js           # মেইন ফাইল
│   └── package.json
│
├── frontend/                # React.js Frontend
│   ├── public/
│   │   ├── manifest.json   # PWA ম্যানিফেস্ট
│   │   ├── service-worker.js
│   │   └── index.html
│   ├── src/
│   │   ├── pages/          # প্রতিটি পৃষ্ঠার কম্পোনেন্ট
│   │   ├── components/     # পুনরায় ব্যবহারযোগ্য কম্পোনেন্ট
│   │   ├── hooks/          # কাস্টম হুক
│   │   ├── utils/          # ইউটিলিটি ফাংশন
│   │   ├── App.js          # মেইন অ্যাপ কম্পোনেন্ট
│   │   ├── index.js        # এন্ট্রি পয়েন্ট
│   │   └── index.css       # গ্লোবাল স্টাইল
│   └── package.json
│
├── docker-compose.yml       # Docker কম্পোজ ফাইল
├── .gitignore
└── README.md
```

---

## ✨ ফিচার

- 🏠 **হোম ড্যাশবোর্ড** - দ্রুত অ্যাক্সেস
- 👥 **কমিউনিটি** - পোস্ট এবং আলোচনা
- 🛠️ **সেবা** - পাসপোর্ট, ইকামা, ভিসা ইত্যাদি
- 💼 **চাকরি** - নতুন চাকরির তালিকা
- 👤 **প্রোফাইল** - ব্যবহারকারী ম্যানেজমেন্ট
- 💬 **মেসেজিং** - এজেন্টের সাথে যোগাযোগ
- 📊 **অ্যাডমিন ড্যাশবোর্ড** - ইস্যু এবং এজেন্ট ম্যানেজমেন্ট
- 🤝 **এজেন্ট সিস্টেম** - স্থানীয় এজেন্ট নিয়োগ
- 💳 **পেমেন্ট** - bKash, Nagad, ব্যাংক সমর্থন
- 🆘 **সাপোর্ট চ্যাট** - লাইভ সাপোর্ট
- 📱 **PWA** - অফলাইন সাপোর্ট

---

## 🔧 এপিআই এন্ডপয়েন্ট

### সাপোর্ট API

```bash
# নতুন সাপোর্ট মেসেজ পাঠান
POST /api/support
{
  "message": "আমার সমস্যা...",
  "sender": "user"
}

# সকল সাপোর্ট মেসেজ পান
GET /api/support

# সাপোর্ট রিপ্লাই পাঠান (অ্যাডমিন)
POST /api/support/reply
{
  "id": 1,
  "reply": "আমরা আপনাকে সাহায্য করব..."
}
```

---

## 📝 পরিবেশ ভেরিয়েবল সেটআপ

### Gmail এর মাধ্যমে ইমেইল সেটআপ

1. Google Account এ যান
2. [App Passwords](https://myaccount.google.com/apppasswords) খুলুন
3. 16 ক্যারেক্টারের পাসওয়ার্ড কপি করুন
4. `.env` ফাইলে যোগ করুন:

```env
GMAIL_USER=আপনার-ইমেইল@gmail.com
GMAIL_PASS=16-character-password
```

---

## 🧪 টেস্টিং

### ম্যানুয়াল টেস্টিং

```bash
# ব্রাউজার ডেভেলপার টুলস খুলুন (F12)
# নেটওয়ার্ক ট্যাব চেক করুন
# সকল API কল দেখুন
```

### Postman এ API টেস্ট করুন

1. [Postman](https://www.postman.com/) ডাউনলোড করুন
2. নতুন রিকোয়েস্ট তৈরি করুন:
   - **URL:** `http://localhost:5000/api/support`
   - **Method:** POST
   - **Body:** JSON
   ```json
   {
     "message": "টেস্ট মেসেজ",
     "sender": "user"
   }
   ```
3. **Send** বাটনে ক্লিক করুন

---

## 🚨 সাধারণ সমস্যা এবং সমাধান

### সমস্যা: "Cannot find module 'express'"

**সমাধান:**
```bash
cd backend
npm install
```

### সমস্যা: "Port 5000 already in use"

**সমাধান:**
```bash
# ম্যাক/লিনাক্স
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### সমস্যা: "CORS error"

**সমাধান:** Backend এ CORS সঠিক কনফিগ করা আছে। নিশ্চিত করুন:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### সমস্যা: "Email not sending"

**সমাধান:**
1. Gmail App Password সেট করুন (উপরে দেখুন)
2. `GMAIL_USER` এবং `GMAIL_PASS` সঠিক কিনা চেক করুন
3. Console এ ত্রুটি মেসেজ পড়ুন

---

## 📦 ডিপ্লয়মেন্ট

### Heroku এ ডিপ্লয়:

```bash
# ইনস্টল করুন
npm install -g heroku
heroku login

# অ্যাপ তৈরি করুন
heroku create your-app-name

# এনভায়রনমেন্ট সেট করুন
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASS=your-password

# ডিপ্লয় করুন
git push heroku main
```

### ভার্চুয়াল সার্ভার (AWS/DigitalOcean):

```bash
# সার্ভারে লগইন করুন এবং চালান:
git clone <repo>
cd probashi-help-iraq
docker-compose up -d
```

---

## 📚 শিখতে থাকুন

- [React ডকুমেন্টেশন](https://react.dev)
- [Express.js গাইড](https://expressjs.com)
- [PWA শিখুন](https://web.dev/progressive-web-apps/)

---

## 🤝 অবদান রাখুন

1. Fork করুন
2. নতুন ব্র্যাঞ্চ তৈরি করুন: `git checkout -b feature/নতুন-ফিচার`
3. পরিবর্তন কমিট করুন: `git commit -m 'নতুন ফিচার যোগ করা হয়েছে'`
4. পুশ করুন: `git push origin feature/নতুন-ফিচার`
5. Pull Request তৈরি করুন

---

## 📄 লাইসেন্স

MIT License - অবাধে ব্যবহার করুন!

---

## 📞 যোগাযোগ

**ডেভেলপার:** Md Zhalak Mia  
**ইমেইল:** admin@probashi.com  
**প্রশ্ন?** একটি Issue খুলুন!

---

**সর্বশেষ আপডেট:** ২০২৬ সেপ্টেম্বর  
**সংস্করণ:** 1.0.0
