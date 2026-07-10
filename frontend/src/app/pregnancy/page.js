"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "husband", label: "Husband" },
  { value: "mother", label: "Mother" },
  { value: "sister", label: "Sister" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

function BumpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M9 3.5c-2.8.7-4.5 3.4-4.5 6.7 0 3 1.6 5 1.6 7.3 0 2 1.6 3.5 3.6 3.5h4.6c2 0 3.6-1.6 3.6-3.6 0-1.6.9-2.4 1.6-3.7.9-1.7.7-4.1-.6-5.8"
        strokeWidth="1.6" strokeLinecap="round"
      />
      <circle cx="14.5" cy="5.2" r="1.9" strokeWidth="1.6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 3l10 18H2L12 3Z" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="9" width="18" height="6" rx="3" strokeWidth="1.6" transform="rotate(-25 12 12)" />
      <path d="M12 12l3-3" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-25 12 12)" />
    </svg>
  );
}

function HospitalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">{title}</p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]";

export default function PregnancyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [dueDate, setDueDate] = useState("");
  const [weekInfo, setWeekInfo] = useState(null);
  const [emergencySymptoms, setEmergencySymptoms] = useState([]);
  const [medicineName, setMedicineName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState("");
  const [savingDate, setSavingDate] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Emergency contact states
  const [contactName, setContactName] = useState("");
  const [relationship, setRelationship] = useState("husband");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWeekInfo();
      loadEmergencyChecklist();
      loadReminders();
      loadEmergencyContact();
    }
  }, [user]);

  async function loadWeekInfo() {
    try {
      const data = await apiCall("/pregnancy/week-info");
      setWeekInfo(data);
    } catch (err) {
      setWeekInfo(null);
    }
  }

  async function loadEmergencyChecklist() {
    try {
      const data = await apiCall("/pregnancy/emergency-checklist");
      setEmergencySymptoms(data.symptoms);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadReminders() {
    try {
      const data = await apiCall("/pregnancy/medicine-reminders");
      setReminders(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadEmergencyContact() {
    try {
      const data = await apiCall("/emergency-contact");
      setEmergencyContact(data);
    } catch (err) {
      setEmergencyContact(null);
    }
  }

  async function handleDueDateSubmit(e) {
    e.preventDefault();
    setSavingDate(true);
    try {
      await apiCall("/pregnancy/profile", {
        method: "POST",
        body: JSON.stringify({ due_date: dueDate }),
      });
      setMessage("Due date saved!");
      loadWeekInfo();
    } catch (err) {
      setMessage("Error saving due date");
    } finally {
      setSavingDate(false);
    }
  }

  async function handleReminderSubmit(e) {
    e.preventDefault();
    try {
      await apiCall("/pregnancy/medicine-reminder", {
        method: "POST",
        body: JSON.stringify({ medicine_name: medicineName, time_of_day: timeOfDay }),
      });
      setMedicineName("");
      loadReminders();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    try {
      await apiCall("/emergency-contact", {
        method: "POST",
        body: JSON.stringify({
          contact_name: contactName,
          relationship: relationship,
          phone_number: phoneNumber,
        }),
      });
      setAlertMessage("Emergency contact saved!");
      loadEmergencyContact();
    } catch (err) {
      setAlertMessage("Error saving contact");
    }
  }

  function getSmsLink() {
    if (!emergencyContact) return "#";

    const message = `HerWellness Emergency Alert: I may need your help right now. Please contact me immediately.`;
    const phone = emergencyContact.phone_number;

    const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? "&" : "?";

    return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
  }

  function findNearbyHospitals() {
    setLoadingHospitals(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location access is not supported in this browser.");
      setLoadingHospitals(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await apiCall(`/pregnancy/nearby-hospitals?latitude=${latitude}&longitude=${longitude}`);
          setHospitals(data.hospitals);
          if (data.hospitals.length === 0 && data.message) {
            setLocationError(data.message);
          }
        } catch (err) {
          setLocationError("Could not fetch nearby hospitals.");
        } finally {
          setLoadingHospitals(false);
        }
      },
      () => {
        setLocationError("Location permission denied. Please enable location access.");
        setLoadingHospitals(false);
      }
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center">
        <p className="text-[#8A8299] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-11 h-11 rounded-2xl bg-[#3F91421A] flex items-center justify-center shrink-0 text-[#3F9142]">
            <BumpIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Pregnancy Companion
            </h1>
            <p className="text-sm text-[#8A8299]">Week-by-week guidance, reminders & safety info</p>
          </div>
        </div>

        {!weekInfo && (
          <div className="max-w-md">
            <SectionCard title="Set Your Due Date">
              <form onSubmit={handleDueDateSubmit} className="space-y-4">
                <input
                  type="date"
                  className={inputClass}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={savingDate}
                  className="w-full bg-[#3F9142] text-white p-3 rounded-xl font-medium hover:bg-[#357A38] transition-colors disabled:opacity-60"
                >
                  {savingDate ? "Saving..." : "Save"}
                </button>
                {message && (
                  <p className={`text-sm text-center ${message.includes("Error") ? "text-red-500" : "text-[#3F9142]"}`}>
                    {message}
                  </p>
                )}
              </form>
            </SectionCard>
          </div>
        )}

        {weekInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Week Info Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-6 md:col-span-2 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#3F9142] to-[#7C3AED]" />
              <div className="pl-2">
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-1">
                  Week {weekInfo.current_week}
                </p>
                <p
                  className="text-2xl md:text-3xl text-[#251C35] mb-3"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Your baby is the size of a {weekInfo.baby_size}
                </p>
                <p className="text-sm text-[#8A8299] mb-3">({weekInfo.baby_size_cm} cm)</p>
                <p className="text-sm text-[#251C35] leading-relaxed mb-4">{weekInfo.development}</p>
                <div className="p-3.5 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35] flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                  {weekInfo.tip}
                </div>
              </div>
            </div>

            {/* Medicine Reminders */}
            <SectionCard title="Medicine Reminders">
              <form onSubmit={handleReminderSubmit} className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Medicine name"
                  className={inputClass}
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  required
                />
                <select
                  className={inputClass + " bg-white"}
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                >
                  {TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#3F9142] text-white p-2.5 rounded-xl font-medium hover:bg-[#357A38] transition-colors"
                >
                  Add Reminder
                </button>
              </form>
              <ul className="space-y-2">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="p-3 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35] flex items-center gap-2.5"
                  >
                    <span className="text-[#3F9142]"><PillIcon /></span>
                    {r.medicine_name} — {r.time_of_day}
                  </li>
                ))}
                {reminders.length === 0 && (
                  <p className="text-[#C4BDDB] text-sm py-2 text-center">No reminders yet.</p>
                )}
              </ul>
            </SectionCard>

            {/* Emergency Checklist */}
            <SectionCard title="Seek Immediate Care If">
              <div className="flex items-center gap-2 mb-3 text-[#B23A2E]">
                <AlertIcon />
                <span className="text-sm font-semibold">Emergency Symptoms</span>
              </div>
              <ul className="space-y-2">
                {emergencySymptoms.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm p-3 rounded-xl flex items-start gap-2"
                    style={{ backgroundColor: "#FDECEB", color: "#B23A2E" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E24C3B] mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Nearby Hospitals */}
            <SectionCard title="Nearby Hospitals" className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#251C35]">
                  <HospitalIcon />
                  <span className="text-sm font-semibold">Find care near you</span>
                </div>
                <button
                  onClick={findNearbyHospitals}
                  disabled={loadingHospitals}
                  className="bg-[#3F9142] text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-[#357A38] transition-colors disabled:opacity-60"
                >
                  {loadingHospitals ? "Finding..." : "Find Near Me"}
                </button>
              </div>

              {locationError && (
                <p className="text-sm mb-3" style={{ color: "#B23A2E" }}>{locationError}</p>
              )}

              {hospitals.length === 0 && !loadingHospitals && (
                <p className="text-[#C4BDDB] text-sm py-2 text-center">
                  Click "Find Near Me" to see nearby hospitals.
                </p>
              )}

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {hospitals.map((h, i) => (
                  <div
                    key={i}
                    className="bg-[#FAF7FF] rounded-2xl p-4 border border-[#F1ECFB] relative"
                  >
                    {i === 0 && (
                      <div className="flex justify-end mb-2">
                        <span className="bg-green-600 text-white text-[11px] px-3 py-1 rounded-full font-semibold shadow">
                          ❤️ Nearest
                        </span>
                      </div>
                    )}

                    <p className="font-semibold text-[#251C35] text-sm mb-1.5">🏥 {h.name}</p>
                    <p className="text-xs text-[#8A8299] mb-1">📍 {h.address}</p>

                    <div className="flex flex-wrap gap-3 mt-2 mb-3 text-xs">
                      <span className="text-[#7C3AED] font-medium">📏 {h.distance_km} km away</span>
                      {h.rating && <span className="text-[#B8802F]">⭐ {h.rating}</span>}
                      <span style={{ color: h.is_open ? "#3F9142" : "#8A8299" }}>
                        {h.is_open ? "🟢 Open" : "⚪ Hours unknown"}
                      </span>
                    </div>

                    <p className="text-xs text-[#251C35] mb-3">
                      📞 {h.phone || "Phone not available"}
                    </p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${h.latitude},${h.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-white px-4 py-2 rounded-xl font-medium"
                      style={{ backgroundColor: "#7C3AED" }}
                    >
                      🗺 Open in Google Maps
                    </a>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Emergency Contact + Free SMS Alert */}
                <SectionCard title="Emergency Contact" className="md:col-span-2">
                  {!emergencyContact ? (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Contact name (e.g. husband's name)"
                        className={inputClass}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                      <select
                        className={inputClass + " bg-white"}
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                      >
                        {RELATIONSHIP_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="Phone number (e.g. +919876543210)"
                        className={inputClass}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-[#3F9142] text-white p-2.5 rounded-xl font-medium hover:bg-[#357A38] transition-colors"
                      >
                        Save Emergency Contact
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-[#FAF7FF] rounded-xl">
                        <p className="text-sm text-[#251C35] font-semibold">{emergencyContact.contact_name}</p>
                        <p className="text-xs text-[#8A8299]">{emergencyContact.relationship} · {emergencyContact.phone_number}</p>
                      </div>

                      <a
                        href={getSmsLink()}
                        className="block w-full text-white text-center p-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#E24C3B" }}
                      >
                        🚨 Send Emergency Alert
                      </a>

                      <p className="text-xs text-[#8A8299] text-center">
                        This will open your messaging app with a pre-filled alert to {emergencyContact.contact_name}. Just tap send.
                      </p>
                    </div>
                  )}
                  {alertMessage && (
                    <p className="text-sm text-center mt-3" style={{ color: "#3F9142" }}>
                      {alertMessage}
                    </p>
                  )}
                </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}