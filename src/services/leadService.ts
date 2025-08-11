// src/services/leadService.ts
"use client";

import { db } from "../../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type LeadPayload = {
  courseId: string;
  courseName?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
  source?: string;      // e.g. "course_detail_cta"
};

export async function submitLead(payload: LeadPayload): Promise<string> {
  const docRef = await addDoc(collection(db, "leads"), {
    ...payload,
    createdAt: serverTimestamp(),
    status: "new",
  });
  return docRef.id;
}