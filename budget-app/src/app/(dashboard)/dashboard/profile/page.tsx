"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/app-store";
import { User, ShieldCheck, Globe, Coins, Camera, Check, Video, VideoOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-[#e5e2e1] shadow-sm ${className}`}>{children}</div>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 disabled:opacity-50 ${checked ? "bg-[#006d67]" : "bg-[#bec9c7]"}`}>
      <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-300 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function ProfilePage() {
  const { profile, saveProfile, setCameraAccess } = useAppStore();
  const [draft, setDraft]     = useState({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast]     = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Sync draft whenever profile changes externally
  const handleEdit = () => { setDraft({ ...profile }); setIsEditing(true); };
  const handleCancel = () => { setDraft({ ...profile }); setIsEditing(false); };

  const handleSave = () => {
    saveProfile(draft);         // updates app-store + localStorage + backend
    setIsEditing(false);
    showToast("Profile updated successfully!");
  };

  // Avatar upload — base64 stored in profile
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setDraft(d => ({ ...d, avatar: b64 }));
    };
    reader.readAsDataURL(file);
  };

  // Camera access toggle — persists to backend via app-store
  const handleCameraToggle = async () => {
    setCameraLoading(true);
    try {
      await setCameraAccess(!profile.cameraAccess);
      showToast(`Camera access ${!profile.cameraAccess ? "enabled" : "disabled"}`);
    } finally {
      setCameraLoading(false);
    }
  };

  const displayProfile = isEditing ? draft : profile;

  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-fade-in">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-[#00534e] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-[24px] font-bold text-[#1c1b1b]">Account Profile</h2>
        <p className="text-[13px] text-[#3e4947] mt-0.5">All changes update across the entire app in real time.</p>
      </div>

      {/* Header Card */}
      <Card className="p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            onClick={() => isEditing && fileInputRef.current?.click()}
            className={`w-20 h-20 rounded-full border-2 border-[#9ef1e9] overflow-hidden flex items-center justify-center text-white text-2xl font-black shadow-lg ${isEditing ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${displayProfile.avatar ? "" : "bg-[#006d67]"}`}
          >
            {displayProfile.avatar
              ? <img src={displayProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
              : (displayProfile.initials || "?")
            }
          </div>
          {isEditing && (
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-[#00534e] text-white rounded-full hover:scale-110 transition-transform shadow-md">
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="text-center sm:text-left flex-1">
          <h3 className="text-[18px] font-bold text-[#1c1b1b]">{profile.name || "Your Name"}</h3>
          <p className="text-[13px] text-[#6e7978]">{profile.email || "—"}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffddb5]/60 text-[#835400]">
              {profile.plan} Plan
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0edec] text-[#3e4947]">
              Joined {profile.joinDate}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="flex gap-2 shrink-0">
            <button onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-[#bec9c7] text-[13px] font-semibold text-[#3e4947] hover:bg-[#f0edec] transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#00534e] text-white text-[13px] font-bold hover:opacity-90 transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        ) : (
          <button onClick={handleEdit}
            className="px-5 py-2 rounded-xl bg-[#f0edec] hover:bg-[#e5e2e1] text-[13px] font-semibold text-[#1c1b1b] transition-colors shrink-0">
            Edit Profile
          </button>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Personal Details */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-[#1c1b1b] flex items-center gap-2 text-[15px]">
            <User className="w-4 h-4 text-[#00534e]" /> Personal Details
          </h3>
          <div className="space-y-3">
            {[
              { label: "Full Name",     key: "name",  type: "text" },
              { label: "Email Address", key: "email", type: "email" },
              { label: "Phone Number",  key: "phone", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-bold text-[#6e7978] uppercase block mb-1">{f.label}</label>
                <input type={f.type}
                  value={(displayProfile as any)[f.key] || ""}
                  disabled={!isEditing}
                  onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#f6f3f2] border border-[#bec9c7]/60 rounded-xl text-[14px] text-[#1c1b1b] focus:outline-none focus:ring-2 focus:ring-[#00534e]/25 disabled:opacity-70 transition-all"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-[#1c1b1b] flex items-center gap-2 text-[15px]">
            <ShieldCheck className="w-4 h-4 text-[#00534e]" /> Preferences
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#6e7978] uppercase flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5" /> Currency
              </label>
              <select value={displayProfile.currency} disabled={!isEditing}
                onChange={e => setDraft(d => ({ ...d, currency: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#f6f3f2] border border-[#bec9c7]/60 rounded-xl text-[14px] text-[#1c1b1b] focus:outline-none disabled:opacity-70">
                {["USD","EUR","GBP","INR","JPY","AUD","CAD"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#6e7978] uppercase flex items-center gap-1 mb-1">
                <Globe className="w-3.5 h-3.5" /> Language
              </label>
              <select value={displayProfile.language} disabled={!isEditing}
                onChange={e => setDraft(d => ({ ...d, language: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#f6f3f2] border border-[#bec9c7]/60 rounded-xl text-[14px] text-[#1c1b1b] focus:outline-none disabled:opacity-70">
                {["English","Hindi","Spanish","French","German","Arabic"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Camera Access — persisted to MongoDB */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${profile.cameraAccess ? "bg-[#9ef1e9]/30 text-[#00534e]" : "bg-[#f0edec] text-[#6e7978]"}`}>
              {profile.cameraAccess ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1c1b1b]">Camera Access</p>
              <p className="text-[12px] text-[#6e7978] mt-0.5">
                Allow the app to use your camera for profile photos and voice-input visualisation.
                This setting is saved to your account.
              </p>
              {profile.cameraAccess && (
                <span className="inline-block mt-1.5 text-[10px] font-bold text-[#2e7d32] bg-green-50 px-2 py-0.5 rounded-full">ENABLED</span>
              )}
            </div>
          </div>
          <Toggle checked={profile.cameraAccess} onChange={handleCameraToggle} disabled={cameraLoading} />
        </div>
      </Card>

      {/* Account Stats — live from store */}
      <Card className="p-5">
        <h3 className="font-bold text-[#1c1b1b] text-[15px] mb-4">Account Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Member Since", val: profile.joinDate || "—",       icon: "📅" },
            { label: "Plan",         val: profile.plan || "Free",         icon: "⭐" },
            { label: "Currency",     val: profile.currency || "USD",      icon: "💱" },
            { label: "Language",     val: profile.language || "English",  icon: "🌐" },
          ].map(s => (
            <div key={s.label} className="bg-[#f6f3f2] rounded-xl p-3 text-center">
              <div className="text-[20px] mb-1">{s.icon}</div>
              <p className="text-[13px] font-bold text-[#1c1b1b]">{s.val}</p>
              <p className="text-[10px] text-[#6e7978]">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
