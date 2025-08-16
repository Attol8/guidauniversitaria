import { NextResponse } from "next/server";
import { db } from "@/../firebaseConfig";
import { collection, endAt, getDocs, limit, orderBy, query, startAt } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term") || "";
  if (!term) return NextResponse.json([]);

  try {
    const cap = term.charAt(0).toUpperCase() + term.slice(1);

    const uniRef = collection(db, "universities");
    const locRef = collection(db, "locations");
    const courseRef = collection(db, "courses");

    // Prefix queries (double run to account for case)
    const queries = [
      getDocs(query(uniRef, orderBy("name"), startAt(term), endAt(term + "\uf8ff"), limit(8))),
      getDocs(query(uniRef, orderBy("name"), startAt(cap), endAt(cap + "\uf8ff"), limit(8))),
      getDocs(query(locRef, orderBy("name"), startAt(term), endAt(term + "\uf8ff"), limit(8))),
      getDocs(query(locRef, orderBy("name"), startAt(cap), endAt(cap + "\uf8ff"), limit(8))),
      getDocs(query(courseRef, orderBy("nomeCorso"), startAt(term), endAt(term + "\uf8ff"), limit(8))),
      getDocs(query(courseRef, orderBy("nomeCorso"), startAt(cap), endAt(cap + "\uf8ff"), limit(8))),
    ];

    const [u1, u2, l1, l2, c1, c2] = await Promise.all(queries);

    const seen = new Set<string>();
    const universities = [...u1.docs, ...u2.docs]
      .map((d) => ({ id: d.id, title: (d.data() as any).name }))
      .filter((x) => x.title && !seen.has("u_" + x.id) && (seen.add("u_" + x.id) || true));
    const locations = [...l1.docs, ...l2.docs]
      .map((d) => ({ id: d.id, title: (d.data() as any).name }))
      .filter((x) => x.title && !seen.has("l_" + x.id) && (seen.add("l_" + x.id) || true));
    const courses = [...c1.docs, ...c2.docs]
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .filter((x) => x.nomeCorso && !seen.has("c_" + x.id) && (seen.add("c_" + x.id) || true));

    const shaped = [
      ...locations.map((l) => ({ type: "location", id: l.id, title: l.title })),
      ...universities.map((u) => ({ type: "university", id: u.id, title: u.title })),
      ...courses.map((c: any) => ({ type: "course", id: c.id, title: c.nomeCorso, university: c.university?.name, location: c.location?.name })),
    ];

    return NextResponse.json(shaped);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}