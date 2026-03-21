# 🤖PrepSense |  AI Interview Agent (MERN Stack SaaS)

A production-ready **SaaS platform** that simulates real-world technical and HR interviews using AI.  
Users can upload resumes, practice interviews, receive intelligent feedback, and purchase credits for continued usage.

---

## 🚀 Project Overview

This application replicates a real SaaS product workflow:
- Resume-based interview generation  
- AI-driven evaluation system  
- Credit-based monetization model  

Designed to help users **prepare smarter for interviews** with personalized insights.

---

## ⚡ Key Features

### 🤖 AI-Powered Interview System
- **Resume Analysis** – Upload PDF resumes for personalized question generation  
- **Dynamic Interview Flow** – Supports Technical & HR rounds  
- **AI Feedback System** – Detailed performance analysis after each interview  

---

### 💳 SaaS Monetization
- **Credit-Based System** – Users spend credits to start interviews  
- **Secure Payments** – Integrated with Razorpay for purchasing credits  

---

### 🔐 Authentication & Security
- **Google Authentication** via Firebase  
- **JWT-Based Authorization** for backend security  

---

### 🎨 Modern UI/UX
- Smooth animations using Framer Motion  
- Responsive design with Tailwind CSS  
- Clean and intuitive user flow  

---

## 🛠 Tech Stack

### Frontend
- React.js  
- Tailwind CSS  
- Redux Toolkit  
- Framer Motion  
- Firebase Authentication  

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Multer (File Uploads)  
- Razorpay (Payments)  
- JSON Web Tokens (JWT)  

---




## 🚀 Getting Started
```bash
git clone https://github.com/anshrajput-tech/PrepSense
cd PrepSense

cd server
npm install

.env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

frontend
cd ../frontend
npm install


VITE_FIREBASE_API_KEY=your_firebase_key
VITE_BACKEND_URL=http://localhost:5000



# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev


Deployed using Render
```
