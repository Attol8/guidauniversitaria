# Project TODOs

This list merges the original README todos with new conversion-focused recommendations.  Tasks are grouped by sprint and marked as completed or pending based on the current code-base analysis.

---
## ✔️ Completed
- [x] Minimal search component (`CourseSearch`) that queries courses by name.
- [x] Category filter component (`FilterBar`) with discipline, location and university selects.
- [x] Course cards now display key categories (Luogo, Università, Disciplina, ecc.).
- [x] Navbar redesigned; dynamic sub-menus for Discipline / Città / Università populated at runtime.
- [x] Filter logic wired to Firestore in `CourseGrid`.

---
## 🏃 Sprint 1 – Conversion Foundation

1. **Course detail & lead capture**
   - [x] Create dynamic route `src/app/courses/[id]/page.tsx`.
   - [x] Fetch course document from Firestore and render hero, details.
   - [x] Build reusable `LeadForm` component with 2-step UX and validation.
   - [x] Persist leads to Firestore `leads` collection.
   - [x] Add sticky CTA ("Richiedi informazioni") visible at every scroll depth.

2. **Favourites & Authentication**
   - [x] Integrate Firebase Auth (email/password + Google, Apple).
   - [x] make sure that authentication follows the same design as the rest of the app.
   - [x] make sure that the authentication follows firebase auth design.
   - [x] Convert heart button in `CourseCard` to `toggleFavourite(courseId)`; store under `users/{uid}/favourites/{courseId}`.
   - [x] New route `/profilo/saved` to list saved courses. make this page simple but make it look good.
   - [x] Rename Sign up and Sign in to Italian
   - [x] Show sign-up modal when unauthenticated users click heart or lead form.

3. **Pagination & performance**
   - [ ] Add cursor-based pagination to `CourseGrid` (e.g. 24 courses per page).
   - [ ] UI pager component or infinite scroll with "Load more".
   - [ ] Emit `view_item_list` event for each page of results.

4. **Landing page CRO tweaks**
   - [ ] Add accreditation badge strip using existing brand logos.
   - [x] Change card CTA copy from "Scopri di più" to "Richiedi info".

5. **Header & Navigation Fixes**
   - [x] Convert header from fixed to sticky positioning to prevent hero cutoff.
   - [x] Add backdrop blur effect with semi-transparent background.
   - [x] Implement dynamic header height tracking with ResizeObserver.
   - [x] Add global scroll-padding for proper anchor scrolling.

--- 
## 🌱 Backlog / Nice to have
- [ ] Recommendation widget ("Potrebbero interessarti") using similarity search.
- [ ] Multi-language (EN/IT) i18n support.
- [ ] SEO optimisation for course detail (Open Graph, static props).
- [ ] Server-side rendering for better crawlability of course lists.

---
## 📄 Guida PDF per studenti – Conversione

- [ ] Struttura della guida (10–12 pagine):
  - [ ] Copertina con claim chiaro (es. "Scegli l’università giusta in 7 passi")
  - [ ] Sommario e come usare la guida
  - [ ] Passo 1: Definisci obiettivo e vincoli (città, budget, lingua)
  - [ ] Passo 2: Disciplina e sbocchi (dati mercato + fonti)
  - [ ] Passo 3: Requisiti di ammissione e test (calendario e link utili)
  - [ ] Passo 4: Confronto piani di studio (template tabellare)
  - [ ] Passo 5: Costi totali e borse (checklist + fonti)
  - [ ] Passo 6: Stage e placement (metriche da verificare)
  - [ ] Passo 7: Checklist finale e decisione
  - [ ] Sezione FAQ
  - [ ] Call-to-action finale (cerca corsi / richiedi info)

- [ ] Visual design:
  - [ ] Palette coerente con brand (blu)
  - [ ] Componenti riutilizzabili (titoli, box checklist, tabelle)
  - [ ] Versione A4 e mobile-friendly (PDF responsive-ish)

- [ ] Contenuti e dati:
  - [ ] Inserire fonti ufficiali (MIUR, ANVUR, atenei)
  - [ ] Esempi concreti per 2–3 discipline
  - [ ] Glossario termini (CFU, LM, L, LM/SC, ecc.)

- [ ] Distribuzione e tracking:
  - [ ] Endpoint per generazione link download tracciato
  - [ ] Eventi analytics (download, CTA click)
  - [ ] Versione email con link sicuro (expiring)

- [ ] Operativo:
  - [ ] Template Figma/Canva
  - [ ] Script export PDF
  - [ ] Checklist QA prima del rilascio
