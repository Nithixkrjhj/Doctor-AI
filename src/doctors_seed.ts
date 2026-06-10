import { Doctor } from './types';

export const initialDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Saranya Menon",
    specialty: "Cardiology",
    rating: 4.9,
    experience: 14,
    qualification: "MD, DM (Cardiology) - AIIMS, New Delhi",
    fee: 1200,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"]
  },
  {
    id: "doc-1-b",
    name: "Dr. Rajesh Kurup",
    specialty: "Cardiology",
    rating: 4.85,
    experience: 16,
    qualification: "MD, DM (Cardiology) - Government Medical College, Thiruvananthapuram",
    fee: 1400,
    avatar: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["08:30 AM", "10:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"]
  },
  {
    id: "doc-2",
    name: "Dr. Anjali Menon",
    specialty: "Dermatology",
    rating: 4.8,
    experience: 9,
    qualification: "MD (Dermatology) - Madras Medical College",
    fee: 900,
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "06:30 PM"]
  },
  {
    id: "doc-2-b",
    name: "Dr. Meera Nair",
    specialty: "Dermatology",
    rating: 4.75,
    experience: 8,
    qualification: "MD (Dermatology) - University of Kerala",
    fee: 750,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:30 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
  },
  {
    id: "doc-3",
    name: "Dr. Madhavan Nair",
    specialty: "Pediatrics",
    rating: 4.95,
    experience: 18,
    qualification: "MD, DCH - Christian Medical College (CMC), Vellore",
    fee: 1000,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["08:30 AM", "11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM"]
  },
  {
    id: "doc-3-b",
    name: "Dr. Anand Krishnan",
    specialty: "Pediatrics",
    rating: 4.8,
    experience: 11,
    qualification: "MD, DCH - Calicut Medical College",
    fee: 850,
    avatar: "https://images.unsplash.com/photo-1507152832244-10d45a7e2193?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"]
  },
  {
    id: "doc-4",
    name: "Dr. Arun Chandran",
    specialty: "Neurology",
    rating: 4.75,
    experience: 12,
    qualification: "MD, DM (Neurology) - NIMHANS, Bengaluru",
    fee: 1500,
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "05:30 PM"]
  },
  {
    id: "doc-4-b",
    name: "Dr. Lakshmi Sankar",
    specialty: "Neurology",
    rating: 4.9,
    experience: 15,
    qualification: "MD, DM (Neurology) - Sree Chitra Tirunal Institute (SCTIMST), Trivandrum",
    fee: 1650,
    avatar: "https://images.unsplash.com/photo-1567186937675-a5131c8a89ea?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["10:00 AM", "12:00 PM", "03:00 PM", "04:30 PM", "06:00 PM"]
  },
  {
    id: "doc-5",
    name: "Dr. Kiran Pillai",
    specialty: "Orthopedics",
    rating: 4.85,
    experience: 15,
    qualification: "MS, MCh (Orthopedics) - King George's Medical University, Lucknow",
    fee: 1100,
    avatar: "https://images.unsplash.com/photo-1618015358954-115ef1ed6515?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:00 AM", "10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM"]
  },
  {
    id: "doc-5-b",
    name: "Dr. Manoj Kumar V.",
    specialty: "Orthopedics",
    rating: 4.7,
    experience: 10,
    qualification: "MS (Orthopedics) - Government Medical College, Kottayam",
    fee: 950,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["08:30 AM", "11:00 AM", "01:30 PM", "04:00 PM", "05:30 PM"]
  },
  {
    id: "doc-6",
    name: "Dr. Kottakal Ramachandran",
    specialty: "General Medicine",
    rating: 4.9,
    experience: 10,
    qualification: "MD (Internal Medicine) - University of Kerala (TMC)",
    fee: 800,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["08:00 AM", "09:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "06:00 PM"]
  },
  {
    id: "doc-6-b",
    name: "Dr. Jayakrishnan Nair",
    specialty: "General Medicine",
    rating: 4.75,
    experience: 7,
    qualification: "MD (General Medicine) - T.D. Medical College, Alappuzha",
    fee: 600,
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:00 AM", "10:30 AM", "12:00 PM", "03:00 PM", "04:30 PM", "07:00 PM"]
  }
];
