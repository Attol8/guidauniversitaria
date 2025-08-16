"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/../firebaseConfig";
import CourseCard from "@/components/CourseCard/CourseCard";
import Link from "next/link";

type SavedCourse = { id: string; courseId: string; nomeCorso?: string };

export default function SavedPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<SavedCourse[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      setBusy(true);
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "favourites"));
        if (!alive) return;
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as SavedCourse[];
        setItems(list);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="animate-pulse h-6 w-48 bg-gray-200 rounded" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="rounded-lg bg-white dark:bg-dark p-6 shadow text-center">
          <h1 className="text-2xl font-bold mb-2">Salvati</h1>
          <p className="mb-4">Accedi per vedere i corsi che hai salvato.</p>
          <Link href="/signin" className="btn btn-primary">Accedi</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Corsi salvati</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">I corsi che hai aggiunto ai preferiti.</p>
      </div>

      {busy ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-white dark:bg-dark p-6 shadow">
          Nessun corso salvato al momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((fav) => (
            <CourseCard key={fav.courseId} course={{ id: fav.courseId, nomeCorso: fav.nomeCorso }} />
          ))}
        </div>
      )}
    </section>
  );
}

