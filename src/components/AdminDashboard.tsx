import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, ShieldAlert, Users, Calendar, IndianRupee, Stethoscope, Clock, Save, X, Activity, Mail, CheckCircle2, AlertCircle, Download, FileText } from 'lucide-react';
import { Doctor, Appointment, ContactMessage } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  onGoBack: () => void;
}


export default function AdminDashboard({ onGoBack }: AdminDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Doctor draft state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    specialty: 'General Medicine',
    qualification: '',
    experience: 5,
    fee: 100,
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    availableSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"]
  });

  // Doctor editing slot state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Doctor | null>(null);

  const SPECIALTIES = ['Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics', 'General Medicine'];
  const SLOTS_OPTIONS = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [resDocs, resApts, resContacts] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/appointments"),
        fetch("/api/contacts")
      ]);
      if (resDocs.ok) {
        setDoctors(await resDocs.json());
      }
      if (resApts.ok) {
        setAppointments(await resApts.json());
      }
      if (resContacts.ok) {
        setContacts(await resContacts.json());
      }
    } catch (e) {
      console.error("Failed to load administrative registry data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDoctorActiveSlot = async (doc: Doctor, slot: string) => {
    let updatedSlots = [...doc.availableSlots];
    if (updatedSlots.includes(slot)) {
      updatedSlots = updatedSlots.filter(s => s !== slot);
    } else {
      updatedSlots.push(slot);
    }

    try {
      const res = await fetch(`/api/doctors/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableSlots: updatedSlots })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to alter shift availability:", err);
    }
  };

  const handleResolveContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to resolve medical enquiry card:", err);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.qualification || !newDoctor.fee) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor)
      });

      if (res.ok) {
        setShowAddForm(false);
        setNewDoctor({
          name: '',
          specialty: 'General Medicine',
          qualification: '',
          experience: 5,
          fee: 100,
          rating: 5.0,
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
          availableSlots: ["09:00 AM", "11:00 AM", "03:00 PM", "05:00 PM"]
        });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    try {
      const res = await fetch(`/api/doctors/${editingDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDoc)
      });
      if (res.ok) {
        setEditingDocId(null);
        setEditingDoc(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this medical professional? This will delete their profile from listings.")) return;
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle slot choices for new doctor profiles
  const toggleSlotChoice = (slot: string) => {
    const activeSlots = [...(newDoctor.availableSlots || [])];
    if (activeSlots.includes(slot)) {
      setNewDoctor({ ...newDoctor, availableSlots: activeSlots.filter(s => s !== slot) });
    } else {
      setNewDoctor({ ...newDoctor, availableSlots: [...activeSlots, slot] });
    }
  };

  // Telehealth revenue summary calculations
  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.feePaid, 0);

  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const chartData = {
    daily: [
      { name: 'Mon', revenue: 4000 },
      { name: 'Tue', revenue: 3000 },
      { name: 'Wed', revenue: 2000 },
      { name: 'Thu', revenue: 2780 },
      { name: 'Fri', revenue: 1890 },
      { name: 'Sat', revenue: 2390 },
      { name: 'Sun', revenue: totalRevenue > 0 ? totalRevenue : 3490 },
    ],
    weekly: [
      { name: 'Week 1', revenue: 14000 },
      { name: 'Week 2', revenue: 23000 },
      { name: 'Week 3', revenue: 12000 },
      { name: 'Week 4', revenue: totalRevenue > 0 ? totalRevenue + 2000 : 27800 },
    ],
    monthly: [
      { name: 'Jan', revenue: 44000 },
      { name: 'Feb', revenue: 53000 },
      { name: 'Mar', revenue: 52000 },
      { name: 'Apr', revenue: 67800 },
      { name: 'May', revenue: 88900 },
      { name: 'Jun', revenue: totalRevenue > 0 ? totalRevenue + 10000 : 124000 },
    ]
  };

  const exportToExcel = () => {
    // Doctors
    const wsDoctors = XLSX.utils.json_to_sheet(doctors.map(d => ({
      ID: d.id,
      Name: d.name,
      Specialty: d.specialty,
      Qualification: d.qualification,
      Experience: d.experience + ' years',
      Fee: d.fee,
      Rating: d.rating
    })));
    // Appointments
    const wsAppointments = XLSX.utils.json_to_sheet(appointments.map(a => ({
      ID: a.id,
      Patient: a.patientName,
      Phone: a.patientPhone,
      Doctor: a.doctorName,
      TimeSlot: a.timeSlot,
      FeePaid: a.feePaid,
      Status: a.status
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsDoctors, "Doctors");
    XLSX.utils.book_append_sheet(wb, wsAppointments, "Appointments");
    XLSX.writeFile(wb, "DocAI_Admin_Report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("DocAI Admin Report", 14, 15);
    
    // Doctors table
    doc.text("Registered Doctors", 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Specialty', 'Experience', 'Fee']],
      body: doctors.map(d => [d.name, d.specialty, d.experience + ' years', `Rs.${d.fee}`]),
    });

    // Appointments table
    doc.text("Appointments", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Patient', 'Doctor', 'Time', 'Fee Paid']],
      body: appointments.map(a => [a.patientName, a.doctorName, a.timeSlot, `Rs.${a.feePaid}`]),
    });

    doc.save("DocAI_Admin_Report.pdf");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="admin-dashboard-container">
      
      {/* Admin Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full uppercase border border-rose-100">
            <Activity className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            <span>Clinic Control Hub • Authorized Only</span>
          </div>
          <h2 className="text-3xl font-display font-black text-slate-800">DocAI Hospital Admin Panel</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center shadow-xs cursor-pointer transition-colors"
            title="Download Excel Report"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center shadow-xs cursor-pointer transition-colors"
            title="Download PDF Report"
          >
            <Download className="h-4 w-4 mr-1.5" />
            PDF
          </button>
          <button
            onClick={onGoBack}
            className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all rounded-lg active:scale-95 shadow-xs"
          >
            Exit Admin Dashboard
          </button>
        </div>
      </div>

      {/* 1. Metric widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="metric-widgets">
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Staff Physicians</span>
            <span className="text-2xl font-display font-semibold text-slate-800 block">{doctors.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Booked Visits</span>
            <span className="text-2xl font-display font-semibold text-slate-800 block">{appointments.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-lg">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Gross Billing</span>
            <span className="text-2xl font-display font-semibold text-slate-800 block">₹{totalRevenue}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-lg">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Sync Status</span>
            <span className="text-[11px] font-mono font-bold text-rose-600 block flex items-center">
              ● ACTIVE (MEMSTATE)
            </span>
          </div>
        </div>

      </div>

      {/* Analytics Chart Block */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-lg text-slate-800">Financial Insights</h3>
          <div className="flex bg-slate-100/80 p-1 rounded-lg">
            <button
              onClick={() => setRevenueFilter('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${revenueFilter === 'daily' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setRevenueFilter('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${revenueFilter === 'weekly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setRevenueFilter('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${revenueFilter === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData[revenueFilter]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }} 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Admin action split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid Section: Table of doctors manage */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-lg text-slate-800">Physicians Registry Database</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{showAddForm ? "Cancel Form" : "Add Specialty Doctor"}</span>
            </button>
          </div>

          {/* Form for creation */}
          {showAddForm && (
            <form onSubmit={handleAddDoctor} className="bg-slate-50 rounded-xl p-5 border border-slate-200 animate-slide-in space-y-4">
              <h4 className="font-bold text-sm text-slate-700">Add New Practitioner profile</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Robert Chen"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Affiliated Specialty Department *</label>
                  <select
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    {SPECIALTIES.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Qualifications / Degrees *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD (Cardiology) - Cambridge Medicine"
                    value={newDoctor.qualification}
                    onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fees (₹) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newDoctor.fee}
                    onChange={(e) => setNewDoctor({ ...newDoctor, fee: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Experience Years</label>
                  <input
                    type="number"
                    min={1}
                    value={newDoctor.experience}
                    onChange={(e) => setNewDoctor({ ...newDoctor, experience: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Avatar URL link</label>
                  <input
                    type="text"
                    value={newDoctor.avatar}
                    onChange={(e) => setNewDoctor({ ...newDoctor, avatar: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Slots selector list */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consultation Slots Scheduling (Select checkboxes):</label>
                <div className="flex flex-wrap gap-1.5">
                  {SLOTS_OPTIONS.map(slot => {
                    const isChecked = (newDoctor.availableSlots || []).includes(slot);
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => toggleSlotChoice(slot)}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                          isChecked 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white hover:bg-slate-200 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200/50">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          )}

          {/* Table display */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono tracking-wider uppercase">
                  <th className="py-3 px-2">Image</th>
                  <th className="py-3 px-2">Provider / Category</th>
                  <th className="py-3 px-2">Qualifications</th>
                  <th className="py-3 px-2">Active Shift Slots (Click to Toggle)</th>
                  <th className="py-3 px-2">Exp</th>
                  <th className="py-3 px-2 text-right">Fee Rate</th>
                  <th className="py-3 px-2 text-right">Registry Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {doctors.map(doctor => (
                  <tr key={doctor.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <img 
                        src={doctor.avatar} 
                        alt="Dr." 
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-800 text-xs">{doctor.name}</div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase font-mono tracking-wide mt-0.5 inline-block font-bold">
                        {doctor.specialty}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 max-w-[130px] truncate">
                      {doctor.qualification}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1 max-w-[210px]">
                        {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"].map(slot => {
                          const isAvailable = doctor.availableSlots.includes(slot);
                          return (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => toggleDoctorActiveSlot(doctor, slot)}
                              className={`px-1.5 py-1 rounded text-[8px] font-mono leading-none border transition-all cursor-pointer ${
                                isAvailable 
                                  ? 'bg-indigo-50 text-indigo-750 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800' 
                                  : 'bg-white text-slate-350 border-slate-250 line-through opacity-50 hover:bg-slate-200'
                              }`}
                              title={isAvailable ? `Mark ${slot} Unavailable/Blocked` : `Mark ${slot} Available`}
                            >
                              {slot.replace(':00', '')}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-400 font-mono">
                      {doctor.experience} yr
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-700">
                      ₹{doctor.fee}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        title="Delete profile"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Registered Patient schedules */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center justify-between">
            <span>Clinic Booked Visits</span>
            <span className="text-xs bg-slate-100 px-2.5 py-1 text-slate-600 rounded-full font-mono">{appointments.length} live</span>
          </h3>

          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Calendar className="h-10 w-10 text-slate-200 mb-2" />
              <p className="text-xs leading-relaxed">No appointments have occurred on this session yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 space-y-2 relative text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800">{apt.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">{apt.patientPhone}</div>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-bold">
                      Paid ₹{apt.feePaid}
                    </span>
                  </div>

                  <hr className="border-slate-200/50" />

                  <div className="flex justify-between text-slate-500 text-[11px] font-mono leading-none">
                    <span>Specialist: <strong>{apt.doctorName}</strong></span>
                    <span>Hours: <strong>{apt.timeSlot}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 3. Patients Inquiries Box section */}
      <hr className="border-slate-200" />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4" id="visitor-inquiries-box">
        <h3 className="font-display font-bold text-lg text-slate-800 flex items-center space-x-2">
          <Mail className="h-5 w-5 text-indigo-600" />
          <span>Patient & Guest Inquiries Inbox</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono font-bold">
            {contacts.length} live cards
          </span>
        </h3>

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="h-10 w-10 text-slate-350 mb-2" />
            <p className="text-xs font-semibold">Inquiries inbox is clean. No guest messages logged yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="contacts-message-grid">
            {contacts.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                  msg.status === 'resolved' 
                    ? 'bg-slate-50 border-slate-200 opacity-70' 
                    : 'bg-white border-indigo-100 hover:border-indigo-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{msg.name}</h4>
                      <a href={`mailto:${msg.email}`} className="text-[10px] text-indigo-500 hover:underline block font-mono">
                        {msg.email}
                      </a>
                    </div>
                    {msg.status === 'resolved' ? (
                      <span className="bg-slate-150 text-slate-600 font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Answered
                      </span>
                    ) : (
                      <span className="bg-rose-100 text-rose-800 font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                        Unresolved
                      </span>
                    )}
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">Subject:</span>
                    <span className="text-xs font-semibold text-slate-700 block">{msg.subject}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 select-text">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide block">Message:</span>
                    <p className="text-xs text-slate-600 leading-relaxed overflow-y-auto max-h-[85px]">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{msg.createdAt.split('GMT')[0]}</span>
                  {msg.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleResolveContact(msg.id)}
                      className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer border border-indigo-100"
                    >
                      Resolve Check
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
