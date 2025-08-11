// src/app/page.tsx
import { Metadata } from "next";
import StudentLanding from "@/components/Home/StudentLanding";

export const metadata: Metadata = {
  title: "Guida Universitaria — Trova il corso giusto",
  description:
    "Filtra per disciplina, città o ateneo. Dati ufficiali, UX veloce, pensata per studenti.",
};

export default function Home() {
  return <StudentLanding />;
}