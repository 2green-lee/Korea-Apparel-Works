import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { X, Download, Trash2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn text-left font-sans">
      <div className="relative w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.08)] p-6 sm:p-8 text-neutral-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-medium text-neutral-900 mb-2">My Account</h2>
        <p className="text-xs text-neutral-500 mb-6 pb-6 border-b border-neutral-200/80">
          Manage your data and privacy settings (GDPR / CCPA Compliant).
        </p>

        <div className="space-y-4">
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4">
            <h3 className="text-sm font-medium text-neutral-900 flex items-center mb-1">
              <Download className="w-4 h-4 mr-2 text-neutral-400" />
              Export My Data
            </h3>
            <p className="text-xs text-neutral-500 mb-3 font-light">
              Download a copy of your personal data, chat history, and purchase orders in JSON format.
            </p>
            <button
              onClick={handleExportData}
              disabled={loading}
              className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs px-4 py-2 rounded-lg transition cursor-pointer"
            >
              Download Data
            </button>
          </div>

          <div className="bg-red-50 border border-red-200/80 rounded-xl p-4">
            <h3 className="text-sm font-medium text-red-600 flex items-center mb-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </h3>
            <p className="text-xs text-neutral-500 mb-3 font-light">
              Permanently remove your account and all associated data from our servers.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-lg transition cursor-pointer"
            >
              Delete Permanently
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 text-xs text-center text-neutral-600 bg-neutral-100 py-2 rounded-lg">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
