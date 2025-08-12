"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../providers";
import { useRouter } from "next/navigation";

// Metadata removed because this is a Client Component

const SigninPage = () => {
  const { signInEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInEmail(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Accesso non riuscito");
    } finally {
      setLoading(false);
    }
  };
  const usingEmulator = process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === "true";
  const onGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGoogle();
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Accesso con Google non riuscito");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-var(--header-h,80px))]">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-lg bg-white dark:bg-dark shadow p-6">
            <h1 className="text-2xl font-bold text-center mb-2">Accedi</h1>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
              Entra per salvare corsi e inviare richieste più velocemente.
            </p>

            {!usingEmulator && (
              <button
                onClick={onGoogle}
                disabled={loading}
                className="btn btn-outline w-full mb-4"
              >
              <span className="mr-2">{/* Google icon */}
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#g)">
                    <path d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216" fill="#4285F4"/>
                    <path d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001" fill="#34A853"/>
                    <path d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z" fill="#FBBC05"/>
                    <path d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z" fill="#EB4335"/>
                  </g>
                  <defs>
                    <clipPath id="g"><rect width="20" height="20" fill="white"/></clipPath>
                  </defs>
                </svg>
              </span>
              Accedi con Google
              </button>
            )}

            <div className="flex items-center my-4">
              <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="mx-3 text-xs uppercase text-gray-400">oppure</span>
              <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario.rossi@email.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="La tua password"
                  autoComplete="current-password"
                />
              </div>
              <button disabled={loading} className={`btn btn-primary w-full ${loading ? "loading" : ""}`}>
                {loading ? "Accesso…" : "Accedi"}
              </button>
            </form>

            <p className="text-center text-sm mt-4">
              Non hai un account? <Link className="link link-primary" href="/signup">Registrati</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SigninPage;
