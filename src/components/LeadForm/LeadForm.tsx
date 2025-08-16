// src/components/LeadForm/LeadForm.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { validateStep1, validateStep2 } from "./validation";
import { FaArrowLeft, FaPaperPlane, FaUser } from "react-icons/fa";
import { useAuth } from "@/app/providers";
import AuthModal from "@/components/Auth/AuthModal";

type LeadFormProps = {
  courseId: string;
  courseName: string;
  onSubmitted?: () => void;
};

type Step = 1 | 2;

export default function LeadForm({ courseId, courseName, onSubmitted }: LeadFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    consent: false,
    message: "",
  });

  const step1Errors = useMemo(() => validateStep1(form), [form]);
  const step2Errors = useMemo(() => validateStep2(form), [form]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type, checked } = e.target as any;
      setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    },
    []
  );

  const next = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (Object.keys(step1Errors).length === 0) setStep(2);
  };

  const back = () => setStep(1);

  const submit = useCallback(async () => {
    setError(null);
    if (!user) { setShowAuth(true); return; }
    if (Object.keys(step2Errors).length > 0) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        courseId,
        courseName,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        message: form.message.trim(),
        consent: !!form.consent,
        createdAt: serverTimestamp(),
        source: "course_detail_page",
        context: {
          path: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });

      setSubmitted(true);
      onSubmitted?.();
    } catch (err: any) {
      setError(err?.message || "Invio non riuscito. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }, [courseId, courseName, form, onSubmitted, step2Errors]);

  if (submitted) {
    return (
      <div className="alert alert-success">
        <span>Richiesta inviata. Ti contatteremo a breve.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} prompt="Per inviare la richiesta devi accedere o registrarti." />
      {/* Stepper */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded ${step === 1 ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
          1. Contatti
        </span>
        <span className="text-gray-400">→</span>
        <span className={`px-2 py-1 rounded ${step === 2 ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
          2. Dettagli
        </span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="text-xs text-gray-600 dark:text-body-color-dark">
            Stai richiedendo informazioni su: <span className="font-semibold">{courseName}</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nome e cognome <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                className="input input-bordered w-full pr-10"
                placeholder="Mario Rossi"
                autoComplete="name"
              />
              <FaUser className="absolute right-3 top-3.5 text-gray-400" />
            </div>
            {step1Errors.fullName && <p className="text-xs text-red-600 mt-1">{step1Errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="mario.rossi@email.com"
              type="email"
              autoComplete="email"
            />
            {step1Errors.email && <p className="text-xs text-red-600 mt-1">{step1Errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefono (opzionale)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="+39 3XX XXXXXXX"
              type="tel"
              autoComplete="tel"
            />
            {step1Errors.phone && <p className="text-xs text-red-600 mt-1">{step1Errors.phone}</p>}
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={onChange}
              className="checkbox checkbox-primary mt-0.5"
            />
            <span>
              Autorizzo il trattamento dei dati per essere ricontattato riguardo questo corso.{" "}
              <span className="text-red-600">*</span>
            </span>
          </label>
          {step1Errors.consent && <p className="text-xs text-red-600 -mt-2">{step1Errors.consent}</p>}

          <button className="btn btn-primary w-full" onClick={next} disabled={Object.keys(step1Errors).length > 0}>
            Continua
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-body-color-dark">
            Aggiungi dettagli per una risposta migliore (facoltativo).
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Messaggio</label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              className="textarea textarea-bordered w-full min-h-[120px]"
              placeholder="Es. Requisiti di accesso, scadenze, tasse, borse di studio, piani di studio…"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={back}>
              <FaArrowLeft className="mr-2" /> Indietro
            </button>
            <button
              className={`btn btn-primary flex-1 ${submitting ? "loading" : ""}`}
              onClick={submit}
              disabled={submitting || Object.keys(step2Errors).length > 0}
            >
              {!submitting && <FaPaperPlane className="mr-2" />}
              Invia richiesta
            </button>
          </div>

          <p className="text-[11px] text-gray-500">
            Inviando dichiari di aver letto l&apos;informativa privacy. Potremmo contattarti via email o telefono per questa
            richiesta.
          </p>
        </div>
      )}
    </div>
  );
}