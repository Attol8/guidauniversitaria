"use client";

import { useAuth } from "@/app/providers";
import Link from "next/link";

export default function AuthModal({ open, onClose, prompt = "Per continuare, accedi o registrati." }: { open: boolean; onClose: () => void; prompt?: string }) {
  const { signInGoogle, signInApple } = useAuth();
  const usingEmulator = process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === "true";
  
  const handleGoogleClick = async () => {
    if (usingEmulator) {
      alert("OAuth non disponibile in modalità emulatore. Usa email/password per il test locale.");
      return;
    }
    await signInGoogle();
    onClose();
  };
  
  const handleAppleClick = async () => {
    if (usingEmulator) {
      alert("OAuth non disponibile in modalità emulatore. Usa email/password per il test locale.");
      return;
    }
    await signInApple();
    onClose();
  };
  
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
            onClick={handleGoogleClick}
            className="w-full border rounded-sm px-4 py-2 hover:border-primary hover:text-primary"
          >
                <span className="mr-2">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline">
                    <g clipPath="url(#g)">
                      <path d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216" fill="#4285F4"/>
                      <path d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001" fill="#34A853"/>
                      <path d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z" fill="#FBBC05"/>
                      <path d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z" fill="#EB4335"/>
                    </g>
                    <defs><clipPath id="g"><rect width="20" height="20" fill="white"/></clipPath></defs>
                  </svg>
                </span>
                Continua con Google
              </button>
          
          <button
            onClick={handleAppleClick}
            className="w-full bg-black hover:bg-gray-800 text-white border-black hover:border-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:border-white dark:hover:border-gray-100 rounded-sm px-4 py-2"
          >
                <span className="mr-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                </span>
                Continua con Apple
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

