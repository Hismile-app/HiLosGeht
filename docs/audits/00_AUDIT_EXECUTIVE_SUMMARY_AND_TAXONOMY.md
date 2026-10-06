# Hi Los Geht (HLG) Heavy Machinery Platform
## Dashboard UI/UX & User Action Flows Master Audit
### Document 00: Architecture, Personas, Taxonomy & Master Flow Index

---

## 1. Executive Summary & Purpose

This audit establishes the **complete blueprint of 100 end-to-end user action flows** across all operational dashboards within the **Hi Los Geht (HLG)** heavy equipment rental and quarry operations ecosystem in Meru, Kenya.

Every flow documented herein specifies:
1. **User Intention & Business Goal**: What real-world operational objective the user is trying to accomplish.
2. **Deterministic UI Sequence**: Exact click path (`Login -> Route -> Interactive Element -> Modal/Panel -> Input -> Commit Action`).
3. **Routing & View State**: Full URL route, query parameters, drawer/modal state, navigation hierarchy, and back-button behavior.
4. **Data Entities & Storage Mapping**: Exact PostgreSQL tables and columns affected (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), foreign keys, constraints, and database triggers.
5. **UI Copy & Human-Centric Language Audit**: Verification that terminology reflects industry-standard quarry and heavy plant operations rather than generic software or artificial AI jargon.
6. **Security, RBAC & Privacy Audit**: Leak prevention (e.g. `password_hash`, JWT tokens, confidential contract rates), permission boundaries between Admin and Operator, and input validation.
7. **UX Logic & Failure Prevention**: Handling of network latency, optimistic UI updates, confirmation modals on destructive actions, GiST double-booking conflict defense, and mobile responsiveness.

---

## 2. Dashboard Role Personas & RBAC Matrix

| Role | Target Route | Persona Profile & Responsibilities | Permitted Modules |
| :--- | :--- | :--- | :--- |
| **Central Admin / Chief Dispatcher** | `/admin/*` | Fleet operations directors, dispatch managers, and quarry accountants managing Meru operations. | All 12 Admin modules (`/admin`, `fleet`, `inbox`, `staff`, `logs`, `ai-insights`, `financials`, `utilization`, `calendar`, `crm`, `verification`, `settings`). |
| **Site Foreman / Operations Staff** | `/staff`, `/admin/logs`, `/admin/calendar` | Senior quarry supervisors inspecting machines, verifying operator field submissions, and reviewing daily work orders. | Daily logs review, maintenance task tracking, verification gallery, machinery schedule view. |
| **Heavy Machinery Field Operator** | `/staff`, `/dashboard/operator/log`, `/staff/profile` | Operators and drivers in the field operating excavators, dozers, tipper trucks, and compactors. | Daily hour meter log submission, fuel receipt upload, delivery voucher capture, personal profile, equipment assignment verification. |

---

## 3. The 16 Live Dashboard Routes in HLG

### Admin Routes (12 Modules)
1. `/admin` — **Command Overview**: Top-level fleet status, revenue KPIs, pending inquiries, telemetry alert feed.
2. `/admin/fleet` — **Fleet Management**: Machinery registry, equipment status toggle, spec editor, telematics mapping.
3. `/admin/inbox` — **Request & Order Inbox**: Client booking inquiries, quote negotiation, reservation confirmation.
4. `/admin/staff` — **Staff Management**: Operator directory, invite creation, onboarding token generation, account suspension.
5. `/admin/logs` — **Daily Logs Ledger**: Central audit log of operator end-of-day meter submissions and fuel yields.
6. `/admin/ai-insights` — **AI Insights & Anomalies**: Telemetry anomaly detection, fuel burn analysis, maintenance forecasts.
7. `/admin/financials` — **Financial & Fuel Analytics**: Daily yield, fuel cost tracking (KES), cost-per-hour machine breakdowns.
8. `/admin/utilization` — **Fleet Utilization**: Active vs booked vs maintenance breakdown, idle machine analysis.
9. `/admin/calendar` — **Master Calendar**: Visual Gantt/grid schedule, GiST exclusion range visualizer, reservation timelines.
10. `/admin/crm` — **Client CRM**: Repeat client profiles, booking histories, contact preferences, customer lifetime value.
11. `/admin/verification` — **Document Verification**: Visual lightbox gallery for fuel receipts and delivery vouchers.
12. `/admin/settings` — **System Settings**: WhatsApp dispatch numbers, automated maintenance thresholds, telematics simulator.

### Staff & Operator Routes (4 Modules)
13. `/staff` — **Operator Daily Log**: Field submission portal for engine hours, fuel liters, receipt images, and work descriptions.
14. `/staff/profile` — **Operator Profile & Permits**: Operator details, machine certifications, contact details, active assignment.
15. `/dashboard/operator` — **Operator Hub**: Mobile-first entry point for machinery drivers.
16. `/dashboard/operator/log` — **Operator Log Alias**: Canonical redirect to field log submission form.

---

## 4. Master Flow Catalog: The 100 Flows Index

### Module Group 1: Fleet, Inquiries & Master Calendar (Flows 001 – 025)
- `FLOW-001`: Admin logs in and views fleet command overview KPIs.
- `FLOW-002`: Admin filters machinery fleet by category in Fleet Management.
- `FLOW-003`: Admin searches for a specific machine by name/model.
- `FLOW-004`: Admin toggles machinery status from 'AVAILABLE' to 'MAINTENANCE'.
- `FLOW-005`: Admin opens Add New Equipment modal and creates an excavator record.
- `FLOW-006`: Admin edits machinery daily rental rate and updates technical specs.
- `FLOW-007`: Admin updates telemetry API ID for automatic IoT tracking.
- `FLOW-008`: Admin deletes/archives decommissioned machinery from fleet registry.
- `FLOW-009`: Admin views client inquiries kanban board in Inbox.
- `FLOW-010`: Admin filters inquiries by status ('PENDING', 'CONFIRMED', 'CANCELLED').
- `FLOW-011`: Admin opens inquiry details modal and inspects client project notes.
- `FLOW-012`: Admin confirms a pending client reservation and triggers booking commitment.
- `FLOW-013`: Admin cancels an unconfirmed inquiry with rejection reason.
- `FLOW-014`: Admin generates a direct WhatsApp quote link for an inquiry.
- `FLOW-015`: Admin triggers email quote confirmation to client.
- `FLOW-016`: Admin navigates to Master Calendar and switches month view.
- `FLOW-017`: Admin clicks a calendar date cell to inspect booked equipment.
- `FLOW-018`: Admin resolves a scheduling conflict alert via calendar modal.
- `FLOW-019`: Admin creates an emergency reservation directly from the calendar view.
- `FLOW-020`: Admin drags/reschedules a reservation booking period range.
- `FLOW-021`: Admin tests GiST exclusion constraint rejection on overlapping dates.
- `FLOW-022`: Admin filters Master Calendar by individual heavy machine.
- `FLOW-023`: Admin exports calendar reservation schedule to CSV format.
- `FLOW-024`: Admin inspects machine downtime maintenance blocks on calendar.
- `FLOW-025`: Admin clicks machine badge in calendar to deep-link to Fleet Manager.

### Module Group 2: Staff Management, Daily Logs & Verification (Flows 026 – 050)
- `FLOW-026`: Admin opens Staff Management and reviews active operators list.
- `FLOW-027`: Admin clicks Invite Staff Member to open recruitment modal.
- `FLOW-028`: Admin enters operator details and generates a 48-hour onboarding token.
- `FLOW-029`: Admin copies onboarding invitation link to clipboard.
- `FLOW-030`: Admin changes operator role from 'OPERATOR' to 'ADMIN'.
- `FLOW-031`: Admin suspends an operator account due to compliance review.
- `FLOW-032`: Admin reactivates a suspended operator account.
- `FLOW-033`: Admin resends onboarding invitation token to operator email.
- `FLOW-034`: Admin deletes an inactive staff profile with safety confirmation.
- `FLOW-035`: Admin navigates to Daily Logs Ledger and reviews submitted logs.
- `FLOW-036`: Admin searches daily logs by operator name or machine model.
- `FLOW-037`: Admin filters daily logs by machinery category.
- `FLOW-038`: Admin clicks a log row to open detailed inspection drawer.
- `FLOW-039`: Admin audits engine start meter vs end meter calculations.
- `FLOW-040`: Admin flags an abnormal fuel consumption log entry for investigation.
- `FLOW-041`: Admin clicks fuel proof thumbnail to inspect receipt image full-screen.
- `FLOW-042`: Admin clicks materials proof thumbnail to inspect delivery note image.
- `FLOW-043`: Admin exports filtered daily logs to CSV for payroll/accounting.
- `FLOW-044`: Admin navigates to Document Verification gallery.
- `FLOW-045`: Admin filters document gallery by 'FUEL' receipts only.
- `FLOW-046`: Admin filters document gallery by 'MATERIALS' delivery notes only.
- `FLOW-047`: Admin clicks a voucher image to open high-resolution zoom modal.
- `FLOW-048`: Admin approves a verified fuel receipt voucher.
- `FLOW-049`: Admin rejects a blurry or fraudulent fuel voucher with notes.
- `FLOW-050`: Admin searches verification gallery by quarry job site name.

### Module Group 3: Financials, AI Insights, CRM & Settings (Flows 051 – 075)
- `FLOW-051`: Admin opens Financial & Fuel Analytics dashboard.
- `FLOW-052`: Admin inspects total fleet operating hours vs fuel burn timeline.
- `FLOW-053`: Admin views machine cost breakdown table and sorts by cost-per-hour.
- `FLOW-054`: Admin adjusts financial analytics reporting time range.
- `FLOW-055`: Admin exports financial breakdown report to CSV.
- `FLOW-056`: Admin navigates to Fleet Utilization dashboard.
- `FLOW-057`: Admin inspects donut chart of available vs booked vs maintenance units.
- `FLOW-058`: Admin reviews underutilized machinery list and flags for quarry dispatch.
- `FLOW-059`: Admin navigates to AI Insights & Anomalies page.
- `FLOW-060`: Admin toggles anomaly lookback window between 7 days and 30 days.
- `FLOW-061`: Admin clicks on a 'HIGH' severity anomaly card to expand incident details.
- `FLOW-062`: Admin triggers automated maintenance work order from an AI anomaly alert.
- `FLOW-063`: Admin dismisses a false-positive anomaly notification with reason.
- `FLOW-064`: Admin reads AI weekly executive operating summary for executive report.
- `FLOW-065`: Admin navigates to Client CRM directory.
- `FLOW-066`: Admin searches CRM records by customer name, email, or phone.
- `FLOW-067`: Admin clicks a client card to view complete historical booking ledger.
- `FLOW-068`: Admin initiates a new booking inquiry directly from client CRM card.
- `FLOW-069`: Admin triggers direct WhatsApp message to client from CRM profile.
- `FLOW-070`: Admin updates client preferred contact channel ('EMAIL' vs 'WHATSAPP').
- `FLOW-071`: Admin navigates to System Settings page.
- `FLOW-072`: Admin updates primary and backup dispatch phone numbers.
- `FLOW-073`: Admin updates administrative support and emergency alert emails.
- `FLOW-074`: Admin configures automated preventive maintenance engine hour threshold.
- `FLOW-075`: Admin runs IoT Telematics simulator to test automated trigger alerts.

### Module Group 4: Operator Field Portal, Profile, Auth & Onboarding (Flows 076 – 100)
- `FLOW-076`: New operator clicks onboarding email link with token.
- `FLOW-077`: Operator enters full name, phone number, and sets secure password.
- `FLOW-078`: Operator submits onboarding form and is redirected to login.
- `FLOW-079`: Operator logs in with credentials and lands on `/staff` field dashboard.
- `FLOW-080`: Operator selects assigned machinery from dropdown list.
- `FLOW-081`: Operator verifies start meter is prefilled from previous day's end meter.
- `FLOW-082`: Operator enters shift end hour meter reading.
- `FLOW-083`: Operator validates error warning when end meter is lower than start meter.
- `FLOW-084`: Operator enters work performed description (e.g. trenching, quarry excavation).
- `FLOW-085`: Operator logs fuel refueled quantity (liters).
- `FLOW-086`: Operator uploads camera photo of fuel pump meter/receipt.
- `FLOW-087`: Operator enters materials received note (aggregate/ballast tonnage).
- `FLOW-088`: Operator uploads delivery note voucher photo.
- `FLOW-089`: Operator submits daily log and receives success confirmation card.
- `FLOW-090`: Operator reviews summary of the submitted log in confirmation banner.
- `FLOW-091`: Operator resets form to submit a second shift log for a different machine.
- `FLOW-092`: Operator switches to 'INQUIRIES' tab on `/staff` to view active field bookings.
- `FLOW-093`: Operator navigates to `/staff/profile` page.
- `FLOW-094`: Operator views personal badge, email, phone, and role status.
- `FLOW-095`: Operator attempts to access unauthorized `/admin` route and receives 403 guard.
- `FLOW-096`: Operator clicks 'Log Out' button in sidebar and session is cleared.
- `FLOW-097`: Admin attempts to access operator log and receives administrative header.
- `FLOW-098`: Unauthenticated user attempts to visit `/admin` and is redirected to `/login`.
- `FLOW-099`: User submits invalid credentials on `/login` and sees clear error toast.
- `FLOW-100`: Admin triggers manual cache refresh on dashboard metrics header.

---

## 5. Architectural & Security Rules for All Audited Flows

1. **Zero Hardcoded Mock Data**: Every metric, machine name, and status badge MUST originate from PostgreSQL queries via REST API `/api/v1/*` endpoints.
2. **Strict RLS Policy Enforcement**:
   - `profiles`: Self-service view for own profile; full access restricted to `public.authorize('ADMIN')`.
   - `physical_assets`: Public select; mutation restricted to `ADMIN`.
   - `reservations`: Public insert (inquiry intake); updates and management restricted to `ADMIN`.
   - `staff_logs`: Operator inserts for own shifts; read restricted to owner and `ADMIN`.
   - `maintenance_triggers` & `staff_tasks`: Assigned operator view; manage restricted to `ADMIN`.
3. **No PII or Hash Exposure**: API responses MUST explicitly omit `password_hash` and `onboarding_token` using SQL projections (`SELECT id, full_name, email, phone_number, role, account_status FROM profiles`).
4. **Natural Field Vernacular**: Technical labels must utilize industry terms: "Engine Hours", "Fuel Burn (Litres)", "Excavation Yield", "Pre-Trip Inspection", rather than generic tech jargon ("Node Metric", "Data Matrix", "Neural Output").
