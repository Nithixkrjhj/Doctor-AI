import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initialDoctors } from "./src/doctors_seed";
import { Doctor, Appointment } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store using seeded doctors list
let doctors: Doctor[] = [...initialDoctors];
let appointments: Appointment[] = [];
let contacts: any[] = [];
let medicalRecords: any[] = [
  {
    id: 'rec-001',
    title: 'Diagnostic Lab Report - CBC & Lipid Triage',
    date: 'May 28, 2026',
    doctor: 'Dr. Vivek Nair',
    department: 'Cardiology Support',
    diagnosis: 'Mild hypercholesterolemia identified under clinical review. Recommended lifestyle adjustments.',
    prescription: ['Atorvastatin 10mg (once daily)', 'Omega-3 fatty supplements 1000mg'],
    notes: 'Total cholesterol checked at 224 mg/dL. Re-evaluation of vital metrics scheduled in 3 months.',
    status: 'Stable'
  },
  {
    id: 'rec-002',
    title: 'NPCI Vocal Symptom Dispatch Analysis',
    date: 'June 02, 2026',
    doctor: 'DocAI virtual system',
    department: 'Symptom Triage Dispatch',
    diagnosis: 'Acute respiratory congestion classified via acoustic voice analysis.',
    prescription: ['Levosalbutamol syrup 5ml', 'Warm saline gargles thrice daily'],
    notes: 'Gemini priority score assessed at higher confidence rating. Recommended internal pulmonology consult.',
    status: 'On-track'
  },
  {
    id: 'rec-003',
    title: 'Orthodontic Assessment & Bio-Scaling',
    date: 'March 14, 2026',
    doctor: 'Dr. Venkatesh M J',
    department: 'Dental Surgery',
    diagnosis: 'Mild level of dental plaque and tartar deposition around molar regions.',
    prescription: ['Chlorhexidine Gluconate 0.2% mouthwash', 'Amoxicillin 500mg if discomfort arises'],
    notes: 'Scaling performed successfully. Encouraged fluoride-enriched cleaning protocols.',
    status: 'Stable'
  }
];
let users: any[] = [
  {
    id: "user-1",
    name: "Nitheesh Krishna",
    email: "nitheeshkrishnapr123@gmail.com",
    phone: "9876543210",
    password: "password123"
  }
];

// AUTH REST APIs
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  const emailLower = email.toLowerCase().trim();
  const exists = users.find(u => u.email.toLowerCase() === emailLower);
  if (exists) {
    return res.status(400).json({ error: "An account has already been registered with this email address." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: emailLower,
    phone: phone.trim(),
    password: password // simple password comparison for demo safety
  };

  users.push(newUser);

  // Return user info WITHOUT password
  const { password: _, ...userResponse } = newUser;
  res.status(201).json(userResponse);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required inputs." });
  }

  const emailLower = email.toLowerCase().trim();
  const matchedUser = users.find(u => u.email.toLowerCase() === emailLower);

  if (!matchedUser || matchedUser.password !== password) {
    return res.status(401).json({ error: "Incorrect email address or password credentials." });
  }

  const { password: _, ...userResponse } = matchedUser;
  res.json(userResponse);
});


// Lazy-loaded Gemini client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please add it to your environment.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST APIs
// 1. Get all doctors
app.get("/api/doctors", (req, res) => {
  res.json(doctors);
});

// 2. Create/Add a doctor (Admin)
app.post("/api/doctors", (req, res) => {
  const { name, specialty, rating, experience, qualification, fee, avatar, availableSlots } = req.body;
  
  if (!name || !specialty || !qualification || !fee) {
    return res.status(400).json({ error: "Missing required fields for doctor profile." });
  }

  const newDoc: Doctor = {
    id: `doc-${Date.now()}`,
    name,
    specialty,
    rating: Number(rating) || 5.0,
    experience: Number(experience) || 1,
    qualification,
    fee: Number(fee),
    avatar: avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    availableSlots: availableSlots || ["10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM"]
  };

  doctors.push(newDoc);
  res.status(201).json(newDoc);
});

// 3. Update a doctor (Admin)
app.put("/api/doctors/:id", (req, res) => {
  const { id } = req.params;
  const index = doctors.findIndex(doc => doc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Doctor profile not found." });
  }

  doctors[index] = {
    ...doctors[index],
    ...req.body
  };

  res.json(doctors[index]);
});

// 4. Delete a doctor (Admin)
app.delete("/api/doctors/:id", (req, res) => {
  const { id } = req.params;
  const index = doctors.findIndex(doc => doc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Doctor profile not found." });
  }

  doctors.splice(index, 1);
  res.json({ message: "Doctor profile removed successfully." });
});

// 5. Get all appointments
app.get("/api/appointments", (req, res) => {
  res.json(appointments);
});

// Cancel/delete an appointment
app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex(appt => appt.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }
  appointments.splice(index, 1);
  res.json({ message: "Appointment cancelled successfully." });
});

// 6. Book an appointment with simulated payment
app.post("/api/appointments/book", (req, res) => {
  const {
    doctorId,
    timeSlot,
    patientName,
    patientEmail,
    patientPhone,
    date,
    feePaid,
    symptomsAnalysed,
    cardDetails
  } = req.body;

  if (!doctorId || !timeSlot || !patientName || !patientEmail || !patientPhone || !date) {
    return res.status(400).json({ error: "Missing required details to schedule appointment." });
  }

  const matchedDoc = doctors.find(doc => doc.id === doctorId);
  if (!matchedDoc) {
    return res.status(404).json({ error: "The selected specialist was not found." });
  }

  // Basic validation of slot
  if (!matchedDoc.availableSlots.includes(timeSlot)) {
    return res.status(400).json({ error: "The chosen time slot is no longer available." });
  }

  // Simulated Payment Processing
  if (cardDetails) {
    const { cardNumber, cardExpiry, cardCvc } = cardDetails;
    if (!cardNumber || !cardExpiry || !cardCvc) {
      return res.status(400).json({ error: "Payment transaction failed. Incomplete credit card credentials." });
    }
  }

  // Generate unique confirmation ID & mock payment receipt tracking ID
  const paymentId = `tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const appointmentId = `apt_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const newAppointment: Appointment = {
    id: appointmentId,
    doctorId,
    doctorName: matchedDoc.name,
    doctorSpecialty: matchedDoc.specialty,
    patientName,
    patientEmail,
    patientPhone,
    date,
    timeSlot,
    feePaid: matchedDoc.fee,
    symptomsAnalysed: symptomsAnalysed || [],
    status: 'confirmed',
    paymentId
  };

  appointments.push(newAppointment);

  // Automatically save each doctor appointment data in medical records
  try {
    const autoMedicalRecord = {
      id: `rec-apt-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      title: `Consultation Booked: ${newAppointment.doctorName}`,
      date: newAppointment.date,
      doctor: newAppointment.doctorName,
      department: newAppointment.doctorSpecialty,
      diagnosis: `Confirmed appointment ticket allocated at slot ${newAppointment.timeSlot}. Symptoms reviewed: ${newAppointment.symptomsAnalysed && newAppointment.symptomsAnalysed.length > 0 ? newAppointment.symptomsAnalysed.join(', ') : 'General Checkup Consultation'}.`,
      prescription: ['Awaiting physician evaluation & advice'],
      notes: `Secure check-in verified. Consultation fee: ₹${newAppointment.feePaid} paid with confirmation ID: ${newAppointment.paymentId}.`,
      status: 'On-track'
    };
    medicalRecords.unshift(autoMedicalRecord);
  } catch (err) {
    console.warn("Could not automatically save appointment to medical records:", err);
  }

  // Simulate cloud SMTP email server dispatch to patient
  try {
    console.log(`
============================================================
📧 SIMULATED SMTP EMAIL DELIVERY SERVICE (DocAI Care Hub)
============================================================
From: docaisupport@gmil.com
To: ${newAppointment.patientEmail}
Subject: CONFIRMED: Appointment Admission Ticket #${newAppointment.id}
Timestamp: ${new Date().toISOString()}
------------------------------------------------------------
Hello ${newAppointment.patientName},

Your clinic consultation appointment was booked successfully!

[APPOINTMENT INFORMATION]
- Patient Ticket Ref: ${newAppointment.id}
- Specialist Physician: ${newAppointment.doctorName} (${newAppointment.doctorSpecialty})
- Timing Allocated: ${newAppointment.timeSlot}
- Session Date: ${newAppointment.date}
- Core Consultation Fee: INR ${newAppointment.feePaid} (PAID SECURELY)
- Security Admission Secret: ${newAppointment.paymentId}

[FACILITY HEADQUARTERS ADDRESS]
Nelamangala Square Office, Bangalore (PIN 562123), Karnataka

Instructions: Please present this digital receipt or barcode on 
your mobile device 15 minutes before the arrival window.
============================================================
`);
  } catch (err) {
    console.warn("Simulated email service encountered an logging error:", err);
  }

  // Keep slot allocation clean by keeping slots active per appointment if desired, 
  // or simply simulating successful registration. Let's reserve the slot in real-time.
  // Optional: We can choose to remove the booked slot from the doctor's general schema.
  // matchedDoc.availableSlots = matchedDoc.availableSlots.filter(s => s !== timeSlot);

  res.status(201).json(newAppointment);
});

// 6.6. Medical Records Management
app.get("/api/records", (req, res) => {
  res.json(medicalRecords);
});

app.post("/api/records", (req, res) => {
  const { title, doctor, department, diagnosis, prescription, notes, status } = req.body;
  if (!title || !doctor || !diagnosis) {
    return res.status(400).json({ error: "Missing required medical record parameters (title, doctor, diagnosis)." });
  }

  const newRecord = {
    id: `rec-${Date.now()}`,
    title,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    doctor,
    department: department || "General Medicine",
    diagnosis,
    prescription: Array.isArray(prescription) ? prescription : [],
    notes: notes || 'No additional notes registered.',
    status: status || 'Stable'
  };

  medicalRecords.unshift(newRecord);
  res.status(201).json(newRecord);
});

// 6.5. Contacts & Enquiries Management
app.get("/api/contacts", (req, res) => {
  res.json(contacts);
});

app.post("/api/contacts", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required contact details." });
  }
  const newContact = {
    id: `msg-${Date.now()}`,
    name,
    email,
    subject: subject || "General Inquiry",
    message,
    createdAt: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " " + new Date().toLocaleTimeString(),
    status: 'pending' as const
  };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

app.put("/api/contacts/:id", (req, res) => {
  const { id } = req.params;
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Inquiry not found." });
  }
  contacts[index].status = req.body.status || 'resolved';
  res.json(contacts[index]);
});

// 7. Analyze symptoms with Gemini JSON response
app.post("/api/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Symptom description input is required." });
  }

  try {
    const ai = getGeminiClient();
    
    const prompt = `Analyze these symptoms described by the patient: "${text}".
Map them logically to one of the following departments: Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics, General Medicine.
Also extract individual symptoms and provide a rationale for the matching department.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert clinical dispatcher. Map symptoms to the most relevant clinic department accurately and conservatively. General Medicine should be a default wrapper for ambiguous symptoms (fever, standard viral issues). Use child-oriented tags for children's symptoms (match with Pediatrics).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specialtySuggested: {
              type: Type.STRING,
              description: "Must be exactly one of: Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics, General Medicine.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence rating for this category mapping, float between 0.00 and 1.00",
            },
            extractedSymptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A flat JSON array of clean, discrete symptoms parsed from the patient's statement.",
            },
            clinicalRationale: {
              type: Type.STRING,
              description: "A short, compassionate clinic diagnosis summary explanation of why this specialty was matched.",
            }
          },
          required: ["specialtySuggested", "confidence", "extractedSymptoms", "clinicalRationale"],
        }
      }
    });

    const output = JSON.parse(response.text || "{}");
    res.json(output);

  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    // Graceful fallback values to ensure the patient still gets assistance
    res.status(500).json({
      error: error.message || "Failed to analyze symptoms through Gemini.",
      fallback: {
        specialtySuggested: "General Medicine",
        confidence: 0.5,
        extractedSymptoms: [text.trim().substring(0, 50)],
        clinicalRationale: "Gemini analysis is temporarily offline. Routing safely to General Medicine."
      }
    });
  }
});

// Serve frontend with Vite middleware / compiler checks
async function launchServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DocAI Core Server] running at http://localhost:${PORT}`);
  });
}

launchServer();
