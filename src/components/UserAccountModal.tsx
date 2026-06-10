import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { X, Download, Trash2, ShieldAlert } from "lucide-react";

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserAccountModal({ isOpen, onClose, user }: UserAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!isOpen || !user) return null;

  const handleExportData = async () => {
    setLoading(true);
    setMsg("Compiling your data...");
    try {
      const res = await fetch(`/api/user/data?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to export data.");
      
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my_apparel_data_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg("Data exported successfully.");
    } catch (err: any) {
      setMsg(err.message || "Export failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Warning: This will permanently delete your account, chats, and purchase orders. This action cannot be undone. Proceed?")) return;
    
    setLoading(true);
    setMsg("Deleting account...");
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      if (!res.ok) throw new Error("Failed to delete account.");
      
      await supabase.auth.signOut();
      onClose();
    } catch (err: any) {
      setMsg(err.message || "Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-left font-sans">
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-medium text-white mb-2">My Account</h2>
        <p className="text-xs text-neutral-400 mb-6 pb-6 border-b border-white/10">
          Manage your data and privacy settings (GDPR / CCPA Compliant).
        </p>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white flex items-center mb-1">
              <Download className="w-4 h-4 mr-2 text-neutral-400" />
              Export My Data
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Download a copy of your personal data, chat history, and purchase orders in JSON format.
            </p>
            <button
              onClick={handleExportData}
              disabled={loading}
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-4 py-2 rounded-lg transition"
            >
              Download Data
            </button>
          </div>

          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <h3 className="text-sm font-medium text-red-400 flex items-center mb-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Permanently remove your account and all associated data from our servers.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-900/50 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-lg transition"
            >
              Delete Permanently
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 text-xs text-center text-neutral-400 bg-neutral-800 py-2 rounded-lg">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
