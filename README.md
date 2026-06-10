<div align="center">
  <img width="1200" height="475" alt="DocAI Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🩺 DocAI – Voice-Based Smart Doctor Appointment System

**DocAI** is an AI-powered healthcare application designed to simplify doctor appointment booking through **voice-based symptom input** and **intelligent symptom extraction**. By leveraging the **Google Gemini API**, the system can understand patient-reported symptoms, recommend relevant medical departments, and streamline the booking process with **secure payment integration**.

---

## ✨ Features
- 🎙️ **Voice Input** – Patients can describe symptoms naturally using speech.  
- 🧠 **AI Symptom Extraction** – Powered by Gemini API for accurate medical context.  
- 📅 **Smart Appointment Booking** – Matches patients with the right doctors.  
- 💳 **Payment Integration** – Secure and seamless transactions.  
- 📊 **Data Visualization** – Charts and reports using Recharts & XLSX.  
- 📄 **PDF Generation** – Export medical summaries and appointment confirmations.  
- ⚡ **Modern UI** – Built with React 19, TailwindCSS, and Lucide React.  

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, TailwindCSS, Lucide React  
- **Backend:** Express, Node.js  
- **AI Integration:** Google Gemini API (`@google/genai`)  
- **Utilities:** XLSX, jsPDF, Recharts  
- **Build Tools:** TypeScript, Esbuild, TSX  

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed  
- Gemini API key  

### Run Locally
```bash
# Install dependencies
npm install

# Set your Gemini API key in .env.local
GEMINI_API_KEY=your_api_key_here

# Start the development server
npm run dev
