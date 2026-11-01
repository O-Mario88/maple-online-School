# Maple Online School: Detailed Launch Blockers & Solutions (April 2026)

## 1. Broken Dashboard Action Links
- **Problem:** 30+ dashboard intelligence/action card links point to non-existent routes (e.g., `/dashboard/library`, `/dashboard/analytics`, `/dashboard/interventions`, `/dashboard/earnings`).
- **Impact:** Users encounter dead ends, reducing trust and usability.
- **Solution:**
  - Audit all dashboard actionLink URLs.
  - For each, either:
    - Create the missing page/component and add a route in the router (e.g., App.tsx).
    - Or, update the link to point to an existing, relevant page.
  - Test all links for navigation and error handling.

## 2. Finance Hub Routing
- **Problem:** Finance management hub is 90% complete with real API integration, but no frontend route exists.
- **Impact:** Feature is invisible to users.
- **Solution:**
  - Add `/dashboard/institution/finance` route in the frontend router.
  - Connect the route to the existing finance hub component.
  - Ensure authentication/authorization (ProtectedRoute).

## 3. Parent Dashboard
- **Problem:** 50% complete; most buttons and navigation links are dead/mocked. Finance tab is mock-only; AI weekly summary not implemented.
- **Impact:** Parents cannot access real data or features.
- **Solution:**
  - Wire all action buttons to real API endpoints.
  - Connect finance tab to InstitutionFinanceHub APIs.
  - Implement AI weekly summary generation (connect to backend/AI Copilot).

## 4. Teacher Dashboard
- **Problem:** Many components are not wired to real APIs (resource engagement, marks upload, interventions, etc.).
- **Impact:** Teachers see mock data, cannot perform core actions.
- **Solution:**
  - Prioritize and connect the 5 most impactful components to backend APIs.
  - Test data flow and error handling for each.

## 5. Live Learning (Google Meet & Calendar)
- **Problem:** Backend and provisioning API are functional, but some frontend features (session replay, missed session recovery) are incomplete or mock-only.
- **Impact:** Users cannot replay sessions or recover missed content.
- **Solution:**
  - Implement session replay (connect to video storage, e.g., Vimeo/Drive).
  - Complete missed session recovery page with real data and video playback.
  - Ensure RSVP is persisted to backend.

## 6. AI Copilot (OpenAI API)
- **Problem:** 85% complete; some features are mock-only (analytics chart data, quiz output not auto-converted to assessments, no conversation persistence).
- **Impact:** AI features are not fully integrated into user workflows.
- **Solution:**
  - Wire quiz output to assessment creation API.
  - Connect smart replies to notification/WhatsApp system.
  - Add conversation history persistence (store in DB, retrieve on login).

## 7. Resource Engagement Panels
- **Problem:** Parent, student, and teacher resource engagement panels are mock-only.
- **Impact:** No real engagement analytics for users.
- **Solution:**
  - Connect all panels to the LearningProgress API.
  - Display real engagement data and handle loading/errors.

## 8. Onboarding Wizards
- **Problem:** Teacher/institution onboarding wizards are only partially built and not wired to backend.
- **Impact:** New users cannot complete onboarding.
- **Solution:**
  - Complete all wizard steps (UI).
  - Wire each step to backend endpoints.
  - Fix progress indicator bugs.

## 9. Intervention System
- **Problem:** Backend is ready, but no API endpoints or UI for interventions.
- **Impact:** No way to manage or view interventions.
- **Solution:**
  - Build intervention ViewSet (API endpoints).
  - Surface interventions in teacher dashboard (UI components).

## 10. Payments
- **Problem:** Payment gateway integration (MoMo, PesaPal) is not yet live.
- **Impact:** No real revenue collection.
- **Solution:**
  - Integrate payment gateway APIs (backend and frontend checkout flows).
  - Test end-to-end payment and error handling.

## 11. Testing & Polish
- **Problem:** Some features are not fully covered by tests; UI/UX polish needed.
- **Impact:** Risk of regressions and poor user experience.
- **Solution:**
  - Ensure all critical user flows are covered by E2E and integration tests.
  - Conduct UI/UX review and address major issues.

---

*This checklist provides a clear path to launch. Each item should be tracked and assigned for completion. Let me know if you want this as a markdown file or a project board template.*
