export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number; // in years
  qualification: string;
  fee: number; // in USD or INR
  avatar: string;
  availableSlots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  timeSlot: string;
  feePaid: number;
  symptomsAnalysed: string[];
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentId: string;
}

export interface SymptomAnalysis {
  specialtySuggested: string;
  confidence: number; // 0 to 1
  extractedSymptoms: string[];
  clinicalRationale: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

