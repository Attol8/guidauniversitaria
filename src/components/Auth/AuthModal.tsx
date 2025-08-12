"use client";

import { useAuth } from "@/app/providers";
import Link from "next/link";

export default function AuthModal({ open, onClose, prompt = "Per continuare, accedi o registrati." }: { open: boolean; onClose: () => void; prompt?: string }) {
  const { signInGoogle } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Accedi o registrati</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Chiudi</button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{prompt}</p>
        <div className="space-y-3">
          <button
            onClick={async () => { await signInGoogle(); onClose(); }}
            className="w-full border rounded-sm px-4 py-2 hover:border-primary hover:text-primary"
          >
            Continua con Google
          </button>
          <div className="text-center text-sm">oppure</div>
          <div className="flex gap-2">
            <Link href="/signin" className="btn btn-ghost flex-1">Accedi</Link>
            <Link href="/signup" className="btn btn-primary flex-1">Registrati</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

