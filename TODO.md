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
   - [ ] Create dynamic route `src/app/courses/[id]/page.tsx`.
   - [ ] Fetch course document from Firestore and render hero, details.
   - [ ] Build reusable `LeadForm` component with 2-step UX and validation.
   - [ ] Persist leads to Firestore `leads` collection.
   - [ ] Fire GA4 / Firebase Analytics event `generate_lead` on submit.
   - [ ] Add sticky CTA ("Richiedi informazioni") visible at every scroll depth.

2. **Favourites & Authentication**
   - [ ] Integrate Firebase Auth (email/password + Google, GitHub).
   - [ ] Convert heart button in `CourseCard` to `toggleFavourite(courseId)`; store under `users/{uid}/favourites/{courseId}`.
   - [ ] New route `/profilo/saved` to list saved courses.
   - [ ] Show sign-up modal when unauthenticated users click heart or lead form.

3. **Pagination & performance**
   - [ ] Add cursor-based pagination to `CourseGrid` (e.g. 24 courses per page).
   - [ ] UI pager component or infinite scroll with "Load more".
   - [ ] Emit `view_item_list` event for each page of results.

4. **Landing page CRO tweaks**
   - [ ] Embed `CourseSearch` directly under hero subtitle.
   - [ ] Add accreditation badge strip using existing brand logos.
   - [ ] Change card CTA copy from "Scopri di più" to "Richiedi info".

---
## 🧩 Sprint 2 – Personalisation & Retention

5. **Filter persistence & smart banner**
   - [ ] Persist last-used filters to `localStorage` and re-hydrate on load.
   - [ ] After ≥3 filter interactions show banner: "Ricevi una shortlist personalizzata" ➜ opens `LeadForm`.

6. **Analytics & experimentation**
   - [ ] Install Firebase Analytics / GA4 via Next.js `<Script>`.
   - [ ] Track events: `select_item`, `view_item`, `begin_checkout`, `sign_up`.
   - [ ] Integrate A/B test framework (`next-experiment` or similar) for CTA colour/text.

---
## 🎨 Sprint 3 – Polish & Trust

7. **UI/UX Enhancements**
   - [ ] Testimonials carousel near lead form on course detail page.
   - [ ] Sticky bottom CTA on mobile for quick sign-up.
   - [ ] Add privacy & T&C quick links beneath sign-up button.
   - [ ] Improve skeleton loading states for cards, filters and detail page.

8. **Documentation & DX**
   - [ ] Update README with new setup (analytics keys, auth instructions).
   - [ ] Unit tests for `LeadForm` and `toggleFavourite` logic.
   - [ ] Cypress end-to-end test: visit → filter → detail → submit lead.

---
## 🌱 Backlog / Nice to have
- [ ] Recommendation widget ("Potrebbero interessarti") using similarity search.
- [ ] Multi-language (EN/IT) i18n support.
- [ ] SEO optimisation for course detail (Open Graph, static props).
- [ ] Server-side rendering for better crawlability of course lists.
