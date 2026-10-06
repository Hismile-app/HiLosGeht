# Hi Los Geht (HLG) Heavy Machinery Platform
## Dashboard UI/UX & User Action Flows Master Audit
### Document 01: Fleet Management, Inbox & Master Calendar (Flows 001 – 025)

---

### FLOW-001: Admin Logs In and Views Fleet Command Overview KPIs
* **User Role**: Admin (Chief Dispatcher)
* **User Intention**: Access central operational metrics on plant availability, active quarry assignments, revenue projections, and pending inquiries.
* **UI Click Sequence**:
  1. Open `/login`.
  2. Input username `AdminHLG` and password `Admin 321`.
  3. Click `[Sign In to Command Hub]` button (`id="login-submit-btn"`).
  4. Browser routes to `/admin`.
  5. Page header loads module badge: `HLG Command Center • Module 1`.
  6. Admin scrolls down to view 4 KPI Cards: "Total Machinery", "Available Units", "Active Dispatches", "Pending Inquiries".
* **Routing & UI State**:
  - Current Route: `/admin`
  - URL Query: None
  - Nav State: Sidebar item "1. Command Overview" active (`bg-primary/10 text-primary`).
* **Elements & Contents Displayed**:
  - KPI Card 1: `Total Machinery: 8 Units` (Live count from `physical_assets`).
  - KPI Card 2: `Available: 6 Units` (Status badge: `emerald`).
  - KPI Card 3: `Booked / Dispatched: 2 Units` (Status badge: `amber`).
  - KPI Card 4: `Pending Inquiries: 1` with quick action button `[View Inquiries]`.
  - Chart Section: Recharts fuel burn vs operating hours area chart.
  - Natural Language Audit: Copy uses clear operational terminology ("Quarry Fleet Status", "Engine Operating Hours", "Daily Revenue KES"). No AI jargon.
* **Database Mapping & Mutations**:
  - `SELECT COUNT(*) as total_fleet, COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available_count, COUNT(*) FILTER (WHERE status = 'BOOKED') as booked_count, COUNT(*) FILTER (WHERE status = 'MAINTENANCE') as maintenance_count FROM public.physical_assets;`
  - `SELECT COUNT(*) as pending_count FROM public.reservations WHERE status = 'PENDING';`
  - Tables Affected: `public.physical_assets` (Read), `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Verification that session token contains `user_role: 'ADMIN'`.
  - No client PII exposed on top-level overview cards.
* **UX & Logic Audit**:
  - Skeleton loaders must show during API fetch to prevent layout shifts.
  - If backend is offline, user is shown an alert card with `[Retry Telematics Connection]` button.

---

### FLOW-002: Admin Filters Machinery Fleet by Category
* **User Role**: Admin
* **User Intention**: Narrow down fleet table to view only earthmoving excavators available in Meru.
* **UI Click Sequence**:
  1. On `/admin`, click `Manage Fleet` button in top header or click `2. Fleet Management` in sidebar.
  2. Browser routes to `/admin/fleet`.
  3. Locate category filter pills above table: `[All]`, `[Excavator]`, `[Dozer]`, `[Backhoe]`, `[Tipper]`, `[Roller]`.
  4. Click `[Excavator]` pill (`id="filter-category-excavator"`).
* **Routing & UI State**:
  - Current Route: `/admin/fleet?category=Excavator` (or component state filtered).
  - Nav State: Sidebar "2. Fleet Management" active.
* **Elements & Contents Displayed**:
  - Filter pill `[Excavator]` active with glowing orange border.
  - Table refreshes to show only matching machines: "Komatsu PC-200 Heavy Excavator".
  - Columns: `Machine Name & Model`, `Category`, `Hour Meter`, `Daily Rate (KES)`, `Status Badge`, `Actions`.
* **Database Mapping & Mutations**:
  - `SELECT id, name, category, model, daily_rate, status, current_hour_meter, telemetry_api_id, specs FROM public.physical_assets WHERE category = 'Excavator' ORDER BY created_at DESC;`
  - Table: `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Open read policy `public.physical_assets` allows public/admin reading. Sanitized parameter binding prevents SQL injection.
* **UX & Logic Audit**:
  - Display badge showing "Showing 1 of 8 heavy machines". Clear "Reset Filters" link appears when filter is active.

---

### FLOW-003: Admin Searches Machinery Fleet by Name/Model
* **User Role**: Admin
* **User Intention**: Rapidly locate "Komatsu D155" dozer to check its current engine meter.
* **UI Click Sequence**:
  1. Navigate to `/admin/fleet`.
  2. Click into the search input box (`id="fleet-search-input"`).
  3. Type `D155`.
  4. Table auto-filters in real-time (debounced 250ms).
* **Routing & UI State**:
  - Route: `/admin/fleet`
  - Input State: Search value `'D155'`.
* **Elements & Contents Displayed**:
  - Single row returned: "Komatsu D155AX-8 Crawler Dozer", Category: "Dozer", Meter: "490.0 hrs", Status: "AVAILABLE".
  - Clear button `(X)` appears inside the search bar.
* **Database Mapping & Mutations**:
  - `SELECT * FROM public.physical_assets WHERE name ILIKE '%D155%' OR model ILIKE '%D155%';`
  - Table: `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Ensure client-side search or backend query uses parameterized ILIKE to prevent SQL injection.
* **UX & Logic Audit**:
  - If search yields 0 results, render "No machinery found matching 'D155'. [Clear Search]".

---

### FLOW-004: Admin Toggles Machinery Status from 'AVAILABLE' to 'MAINTENANCE'
* **User Role**: Admin
* **User Intention**: Mark a machine as undergoing mechanical service so it cannot be booked.
* **UI Click Sequence**:
  1. On `/admin/fleet`, locate row for "JCB 3DXPLUS Backhoe Loader".
  2. Click status dropdown or toggle button in actions column (`id="toggle-status-jcb3dx"`).
  3. Select `MAINTENANCE`.
  4. Confirmation popover asks: "Schedule machine for maintenance? This will block calendar dates."
  5. Click `[Confirm Maintenance Status]`.
* **Routing & UI State**:
  - Route: `/admin/fleet`
  - UI State: Optimistic update flips badge from Green (`AVAILABLE`) to Red (`MAINTENANCE`).
* **Elements & Contents Displayed**:
  - Status Badge changes to `Under Maintenance` (Red border, wrench icon).
  - Toast notification appears: `JCB 3DXPLUS status updated to MAINTENANCE`.
* **Database Mapping & Mutations**:
  - `UPDATE public.physical_assets SET status = 'MAINTENANCE', updated_at = NOW() WHERE id = '11111111-1111-1111-1111-111111111103';`
  - Table: `public.physical_assets` (Update).
* **Security & Privacy Audit**:
  - Protected by RLS: `Admins can manage physical assets`. Requires JWT claim `user_role = 'ADMIN'`. Operators cannot mutate this record.
* **UX & Logic Audit**:
  - If machine has active reservation during this window, system must display warning: "Warning: Machine has confirmed booking on Oct 12. Notify client?".

---

### FLOW-005: Admin Opens 'Add New Equipment' Modal and Creates an Excavator Record
* **User Role**: Admin
* **User Intention**: Add newly acquired heavy equipment to the digital quarry fleet.
* **UI Click Sequence**:
  1. On `/admin/fleet`, click top-right `[+ Add Machinery]` button (`id="btn-add-machinery"`).
  2. Modal overlay opens: `Modal: Register Heavy Machinery`.
  3. Enter Name: `Caterpillar 320D Excavator`.
  4. Select Category: `Excavator`.
  5. Enter Model: `CAT 320D`.
  6. Enter Daily Rate (KES): `65000.00`.
  7. Enter Initial Engine Hours: `120.5`.
  8. Enter Telematics VIN/ID: `CAT-320D-KE-009`.
  9. Enter Specs JSON: `{"bucket_capacity": "1.2 m3", "operating_weight": "22,000 kg"}`.
  10. Click `[Save & Register Machinery]` button.
* **Routing & UI State**:
  - Route: `/admin/fleet`
  - Modal State: `showAddModal = true` -> transitions to `false` upon success.
* **Elements & Contents Displayed**:
  - Modal title: "Register Heavy Machinery Asset".
  - Field labels in clear Kenyan contractor format: "Machine Asset Name", "Machinery Category", "Manufacturer Model", "Daily Hire Rate (KES)", "Current Engine Hour Meter".
  - Success banner: "Machinery CAT 320D successfully added to fleet".
* **Database Mapping & Mutations**:
  - `INSERT INTO public.physical_assets (name, category, model, daily_rate, status, current_hour_meter, telemetry_api_id, specs) VALUES ('Caterpillar 320D Excavator', 'Excavator', 'CAT 320D', 65000.00, 'AVAILABLE', 120.5, 'CAT-320D-KE-009', '{"bucket_capacity": "1.2 m3"}'::jsonb) RETURNING id;`
  - Table: `public.physical_assets` (Insert).
* **Security & Privacy Audit**:
  - Restricted to Admins.
  - Sanitization on specs JSONB to prevent malformed object injection.
* **UX & Logic Audit**:
  - Modal must trap focus (`Esc` key closes, outside click warns if dirty form).
  - Validation: Daily rate cannot be negative; hour meter must be numeric.

---

### FLOW-006: Admin Edits Machinery Daily Rental Rate and Specs
* **User Role**: Admin
* **User Intention**: Update the commercial dry/wet hire rate for an Isuzu tipper truck.
* **UI Click Sequence**:
  1. On `/admin/fleet`, find row for "Isuzu FVZ 34 Heavy Tipper Truck".
  2. Click the `Edit (Pencil)` icon in Actions column (`id="edit-asset-isuzu"`).
  3. Modal opens prefilled with current asset details.
  4. Change Daily Rate from `0.00` to `25000.00`.
  5. Add spec: `"fuel_tank_capacity": "300 L"`.
  6. Click `[Update Machinery Asset]`.
* **Routing & UI State**:
  - Route: `/admin/fleet`
  - Modal State: `editingItem = selectedMachine`.
* **Elements & Contents Displayed**:
  - Form fields preloaded with existing record.
  - Rate input formatted with currency sign `KES`.
  - Button states: `[Cancel]` and `[Update Machinery Asset]`.
* **Database Mapping & Mutations**:
  - `UPDATE public.physical_assets SET daily_rate = 25000.00, specs = specs || '{"fuel_tank_capacity": "300 L"}'::jsonb, updated_at = NOW() WHERE id = '11111111-1111-1111-1111-111111111107';`
  - Table: `public.physical_assets` (Update).
* **Security & Privacy Audit**:
  - Verification of Admin credentials via authorization bearer token.
* **UX & Logic Audit**:
  - Live currency formatting helper (`25,000 KES`) updates as user types digits.

---

### FLOW-007: Admin Updates Telemetry API ID for Automatic IoT Tracking
* **User Role**: Admin
* **User Intention**: Link a newly installed onboard GPS/OBD tracker to a Komatsu excavator.
* **UI Click Sequence**:
  1. On `/admin/fleet`, click Edit on "Komatsu PC-200".
  2. Scroll to "Telemetry Integration ID" field.
  3. Enter GPS Serial: `KOM-PC200-MERU-099`.
  4. Click `[Verify Tracker Connection]`.
  5. Status indicator turns green: "Signal Confirmed".
  6. Click `[Update Machinery Asset]`.
* **Routing & UI State**:
  - Route: `/admin/fleet`
* **Elements & Contents Displayed**:
  - Input box with placeholder: `e.g. KOM-PC200-KE-001`.
  - Real-time diagnostic badge: "Telematics Link: ACTIVE".
* **Database Mapping & Mutations**:
  - `UPDATE public.physical_assets SET telemetry_api_id = 'KOM-PC200-MERU-099', updated_at = NOW() WHERE id = '11111111-1111-1111-1111-111111111101';`
  - Table: `public.physical_assets` (Update).
* **Security & Privacy Audit**:
  - Telematics IDs are protected from public scrapers; only admin views hardware tracking identifiers.
* **UX & Logic Audit**:
  - Check uniqueness: prevent two machines from sharing identical `telemetry_api_id`.

---

### FLOW-008: Admin Decommission/Archives Machinery from Fleet Registry
* **User Role**: Admin
* **User Intention**: Remove a sold or retired compactor roller from active dispatch.
* **UI Click Sequence**:
  1. On `/admin/fleet`, locate "XCMG XS163J Vibratory Compactor Roller".
  2. Click the Red `Trash` icon in Actions column (`id="delete-asset-xcmg"`).
  3. Destructive confirmation dialog opens:
     "Decommission Machine? This will permanently archive the asset. Active reservations will be cancelled."
  4. Admin types confirmation word: `ARCHIVE`.
  5. Click `[Confirm Decommission]`.
* **Routing & UI State**:
  - Route: `/admin/fleet`
  - Modal: `showArchiveConfirmModal = true`.
* **Elements & Contents Displayed**:
  - Red danger alert modal.
  - Input field requiring explicit typed verification (`ARCHIVE`).
  - Action buttons: `[Cancel]` and `[Confirm Decommission]`.
* **Database Mapping & Mutations**:
  - `DELETE FROM public.physical_assets WHERE id = '11111111-1111-1111-1111-111111111106';` (Or soft-delete `status = 'MAINTENANCE'`).
  - Foreign Key cascade handles dependent `staff_tasks` and `maintenance_triggers`.
  - Table: `public.physical_assets` (Delete/Update).
* **Security & Privacy Audit**:
  - Irreversible action requires explicit Admin authentication and two-step confirmation modal.
* **UX & Logic Audit**:
  - If machine has pending client bookings, refuse hard delete and prompt user: "Machine has 1 pending reservation. Reassign reservation first."

---

### FLOW-009: Admin Views Client Inquiries Kanban Board in Inbox
* **User Role**: Admin
* **User Intention**: Review inbound machinery hire requests submitted by contractors via the public catalog.
* **UI Click Sequence**:
  1. Click `3. Request & Order Inbox` in sidebar or click header badge `Inquiries (1)`.
  2. Browser routes to `/admin/inbox`.
  3. Kanban board loads with 3 columns:
     - `Pending Review (1)`
     - `Confirmed Bookings (0)`
     - `Cancelled / Declined (0)`
* **Routing & UI State**:
  - Route: `/admin/inbox`
  - Sidebar Nav: "3. Request & Order Inbox" active.
* **Elements & Contents Displayed**:
  - Inquiry Card: Client Name ("Mutuma Roadworks Ltd"), Machine ("Komatsu PC-200"), Dates ("10 Oct - 15 Oct"), Daily Rate ("KES 65,000"), Total ("KES 325,000").
  - Preferred Contact Badge: `WHATSAPP` (Green badge with WhatsApp icon).
* **Database Mapping & Mutations**:
  - `SELECT r.id, r.physical_asset_id, r.client_name, r.client_email, r.client_phone, r.booking_period, r.daily_rate, r.total_amount, r.status, r.preferred_contact, r.notes, r.created_at, p.name as equipment_name, p.model as equipment_model FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id ORDER BY r.created_at DESC;`
  - Table: `public.reservations` (Read), `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Operator role cannot access this page. If an operator accesses `/admin/inbox`, page shows `Access Restricted to Central Administrators`.
* **UX & Logic Audit**:
  - Cards support drag-and-drop or explicit click buttons (`[Confirm]`, `[Decline]`) for accessibility.

---

### FLOW-010: Admin Filters Inquiries by Status
* **User Role**: Admin
* **User Intention**: Isolate only 'PENDING' inquiries requiring urgent quote responses.
* **UI Click Sequence**:
  1. On `/admin/inbox`, click filter pill `[Pending Only]` (`id="filter-inquiries-pending"`).
  2. View re-renders showing only inquiries with status `'PENDING'`.
* **Routing & UI State**:
  - Route: `/admin/inbox?status=PENDING`
* **Elements & Contents Displayed**:
  - Counter badge: "Showing 1 Pending Inquiries".
  - Action buttons visible on card: `[Approve & Lock Dates]`, `[Contact WhatsApp]`, `[Decline]`.
* **Database Mapping & Mutations**:
  - `SELECT * FROM public.reservations WHERE status = 'PENDING' ORDER BY created_at ASC;`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Admin authorized only.
* **UX & Logic Audit**:
  - Empty state displays friendly empty tray icon: "All caught up! No pending client inquiries."

---

### FLOW-011: Admin Opens Inquiry Details Modal and Inspects Client Project Notes
* **User Role**: Admin
* **User Intention**: Read contractor site location and terrain details before approving machine dispatch.
* **UI Click Sequence**:
  1. On `/admin/inbox`, click inquiry card for "Mutuma Roadworks Ltd".
  2. Modal drawer slides in from right: `Inquiry Dossier #RES-901`.
  3. Admin reads section: "Project Site & Ground Conditions":
     `"Excavation of hard rock quarry in Nkubu, Meru. Requires rock breaker attachment or heavy bucket."`
* **Routing & UI State**:
  - Route: `/admin/inbox`
  - Drawer State: `selectedInquiry = item`.
* **Elements & Contents Displayed**:
  - Client details: Full Name, Phone (+254712345678), Email (`mutuma@roadworks.co.ke`).
  - Rental dates: Start Date, End Date, Total Days (5 Days).
  - Estimated Revenue: `KES 325,000`.
  - Machine specs compatibility check.
* **Database Mapping & Mutations**:
  - `SELECT r.*, p.name, p.specs FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id WHERE r.id = $1;`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Client phone and email visible only to authenticated Admin.
* **UX & Logic Audit**:
  - Modal must feature direct clickable phone link (`tel:+254712345678`) and WhatsApp button.

---

### FLOW-012: Admin Confirms a Pending Reservation and Triggers Booking Commitment
* **User Role**: Admin
* **User Intention**: Accept client booking and block calendar dates to prevent double-booking.
* **UI Click Sequence**:
  1. Inside Inquiry Details modal on `/admin/inbox`, review total quote `KES 325,000`.
  2. Click green button: `[Confirm Reservation & Lock Fleet]` (`id="btn-confirm-inquiry"`).
  3. System prompts confirmation modal: "Lock Komatsu PC-200 for 10 Oct - 15 Oct? This will activate GiST calendar exclusion."
  4. Click `[Confirm & Dispatch]`.
* **Routing & UI State**:
  - Route: `/admin/inbox`
  - Card transitions from "Pending Review" column to "Confirmed Bookings" column.
* **Elements & Contents Displayed**:
  - Status badge turns green: `CONFIRMED`.
  - Toast notification: `Reservation #RES-901 confirmed. Dates locked on Master Calendar.`
* **Database Mapping & Mutations**:
  - `UPDATE public.reservations SET status = 'CONFIRMED', updated_at = NOW() WHERE id = '33333333-3333-3333-3333-333333333301';`
  - `UPDATE public.physical_assets SET status = 'BOOKED' WHERE id = '11111111-1111-1111-1111-111111111101';`
  - Tables Affected: `public.reservations` (Update), `public.physical_assets` (Update).
* **Security & Privacy Audit**:
  - GiST constraint `no_overlapping_reservations` automatically validates at database level. If another confirmed reservation overlaps, Postgres throws exclusion violation (code `23P01`).
* **UX & Logic Audit**:
  - If GiST violation occurs, catch error gracefully and display: "Error: Komatsu PC-200 is already booked during these dates. Please adjust dates or assign another excavator."

---

### FLOW-013: Admin Cancels an Unconfirmed Inquiry with Rejection Reason
* **User Role**: Admin
* **User Intention**: Decline an inquiry due to machine unavailability or client credit terms.
* **UI Click Sequence**:
  1. On `/admin/inbox`, click `[Decline]` icon on inquiry card.
  2. Dialog opens: "Decline Booking Request".
  3. Select Reason: `Equipment unavailable due to scheduled quarry blast`.
  4. Type internal note: "Offered Shantui loader as alternative, awaiting callback."
  5. Click `[Confirm Cancellation]`.
* **Routing & UI State**:
  - Route: `/admin/inbox`
* **Elements & Contents Displayed**:
  - Card moves to "Cancelled / Declined" column with red status badge.
* **Database Mapping & Mutations**:
  - `UPDATE public.reservations SET status = 'CANCELLED', notes = notes || ' [DECLINED: Equipment unavailable]', updated_at = NOW() WHERE id = $1;`
  - Table: `public.reservations` (Update).
* **Security & Privacy Audit**:
  - Cancellation frees up the GiST reservation exclusion range (`WHERE status != 'CANCELLED'`).
* **UX & Logic Audit**:
  - Provide an `[Undo Cancellation]` button for 10 seconds in toast notification.

---

### FLOW-014: Admin Generates a Direct WhatsApp Quote Link for an Inquiry
* **User Role**: Admin
* **User Intention**: Send an instant quote to the client's WhatsApp with full booking parameters.
* **UI Click Sequence**:
  1. On `/admin/inbox`, find inquiry from Mutuma Roadworks.
  2. Click the green WhatsApp button (`id="whatsapp-quote-btn"`).
  3. System parses client phone (+254712345678) and pre-fills encoded WhatsApp message:
     `"Hello Mutuma Roadworks Ltd, your hire request for Komatsu PC-200 (10 Oct - 15 Oct, KES 325,000) is reviewed. Click to confirm..."`
  4. New browser tab opens: `https://wa.me/254712345678?text=...`
* **Routing & UI State**:
  - Route: `/admin/inbox` (opens external link in new tab `target="_blank"`).
* **Elements & Contents Displayed**:
  - WhatsApp branded button with phone badge.
* **Database Mapping & Mutations**:
  - `SELECT client_name, client_phone, daily_rate, total_amount, booking_period FROM public.reservations WHERE id = $1;`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Validate phone number regex to ensure proper country code format (`+254...`).
* **UX & Logic Audit**:
  - Works on both desktop WhatsApp Web and mobile native WhatsApp app.

---

### FLOW-015: Admin Triggers Email Quote Confirmation to Client
* **User Role**: Admin
* **User Intention**: Dispatch formal PDF contract quote to corporate contractor email.
* **UI Click Sequence**:
  1. In Inquiry Details drawer, click `[Send Official Email Quote]`.
  2. Modal shows email preview: Recipient `mutuma@roadworks.co.ke`, Subject `Official Quote: HLG Komatsu PC-200 Hire`.
  3. Click `[Send Email Now]`.
* **Routing & UI State**:
  - Route: `/admin/inbox`
* **Elements & Contents Displayed**:
  - Success badge: "Email quote dispatched via SMTP".
* **Database Mapping & Mutations**:
  - `SELECT client_email, client_name, total_amount FROM public.reservations WHERE id = $1;`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Rate limiting on outgoing email triggers to prevent mail server abuse.
* **UX & Logic Audit**:
  - Displays checkmark on the card: "Quote Sent: 10:45 AM".

---

### FLOW-016: Admin Navigates to Master Calendar and Switches Month View
* **User Role**: Admin
* **User Intention**: Review upcoming fleet deployment schedules for November 2026.
* **UI Click Sequence**:
  1. In sidebar, click `9. Master Calendar`.
  2. Route loads `/admin/calendar`.
  3. Current month (October 2026) is displayed in grid.
  4. Click `[>] Next Month` arrow button in calendar header (`id="btn-calendar-next"`).
  5. Calendar transitions smoothly to November 2026.
* **Routing & UI State**:
  - Route: `/admin/calendar?month=11&year=2026`
  - Nav State: Sidebar "9. Master Calendar" active.
* **Elements & Contents Displayed**:
  - Month Header: `November 2026`.
  - 7 Days Header: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
  - Days 1 to 30 populated with machinery booking ribbons.
* **Database Mapping & Mutations**:
  - `SELECT r.id, r.physical_asset_id, r.client_name, r.booking_period, r.status, p.name as equipment_name, p.category FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id WHERE r.booking_period && tstzrange('2026-11-01 00:00:00+03', '2026-11-30 23:59:59+03') AND r.status != 'CANCELLED';`
  - Table: `public.reservations` (Read), `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Calendar accessible to Admin and Foreman.
* **UX & Logic Audit**:
  - Keyboard navigation supported: Left arrow (prev month), Right arrow (next month).

---

### FLOW-017: Admin Clicks a Calendar Date Cell to Inspect Booked Equipment
* **User Role**: Admin
* **User Intention**: Drill into a specific day (e.g. October 12) to see all machines operating in the field.
* **UI Click Sequence**:
  1. On `/admin/calendar`, locate date cell `12`.
  2. Click cell `12` (`id="calendar-day-12"`).
  3. Modal popup opens: `Daily Fleet Dispatch: 12 October 2026`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
  - Modal: `selectedDate = '2026-10-12'`.
* **Elements & Contents Displayed**:
  - List of active machines on this day:
    - `Komatsu PC-200` — Booked by Mutuma Roadworks (Nkubu Quarry).
    - `Isuzu FVZ 34 Tipper` — Booked by Meru Municipal Works.
  - Available machines section:
    - 6 machines available for emergency hire.
* **Database Mapping & Mutations**:
  - `SELECT r.*, p.name FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id WHERE r.booking_period @> '2026-10-12 12:00:00+03'::timestamptz AND r.status = 'CONFIRMED';`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Client contacts sanitized unless admin is authenticated.
* **UX & Logic Audit**:
  - Cell highlights in primary amber glow with active dispatch count badge `(2)`.

---

### FLOW-018: Admin Resolves a Scheduling Conflict Alert via Calendar Modal
* **User Role**: Admin
* **User Intention**: Resolve overlapping client requests on the Shantui SL60W wheel loader.
* **UI Click Sequence**:
  1. On `/admin/calendar`, an amber alert banner displays: `1 Potential Scheduling Overlap Detected`.
  2. Click `[Review Conflict]` button.
  3. Conflict comparison modal displays Client A vs Client B time ranges.
  4. Click `[Reassign Client B to JCB 3DXPLUS Backhoe]`.
  5. Click `[Apply Conflict Resolution]`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
* **Elements & Contents Displayed**:
  - Conflict visualizer comparing two timelines.
  - Dropdown: "Alternative Equipment with Available Window".
  - Action button: `[Reassign Machine Asset]`.
* **Database Mapping & Mutations**:
  - `UPDATE public.reservations SET physical_asset_id = '11111111-1111-1111-1111-111111111103', updated_at = NOW() WHERE id = $1;`
  - Table: `public.reservations` (Update).
* **Security & Privacy Audit**:
  - Exclusion constraint verifies new assignment has zero overlap.
* **UX & Logic Audit**:
  - Real-time confirmation prevents transaction rollback.

---

### FLOW-019: Admin Creates an Emergency Reservation Directly from Calendar View
* **User Role**: Admin
* **User Intention**: Book an Isuzu tipper truck for an urgent county government landslide clearance.
* **UI Click Sequence**:
  1. On `/admin/calendar`, click top button `[+ Quick Booking]`.
  2. Dialog opens: "Instant Machine Dispatch".
  3. Select Machine: `Isuzu FVZ 34 Heavy Tipper Truck`.
  4. Select Dates: `15 Oct 2026` to `17 Oct 2026`.
  5. Client Name: `Meru Disaster Response Unit`.
  6. Phone: `+254722000111`.
  7. Click `[Lock Dispatch Dates]`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
* **Elements & Contents Displayed**:
  - Start/End datepicker.
  - Client contact inputs.
  - Calculated total hire fee.
* **Database Mapping & Mutations**:
  - `INSERT INTO public.reservations (physical_asset_id, client_name, client_email, client_phone, booking_period, daily_rate, total_amount, status) VALUES ('11111111-1111-1111-1111-111111111107', 'Meru Disaster Response Unit', 'disaster@meru.go.ke', '+254722000111', tstzrange('2026-10-15 00:00:00+03', '2026-10-17 23:59:59+03'), 25000.00, 75000.00, 'CONFIRMED');`
  - Table: `public.reservations` (Insert).
* **Security & Privacy Audit**:
  - Admin authentication required.
* **UX & Logic Audit**:
  - Ribbon instantly appears across days 15, 16, and 17 on the calendar.

---

### FLOW-020: Admin Drags/Reschedules a Reservation Booking Period Range
* **User Role**: Admin
* **User Intention**: Extend client excavation hire by 2 days upon contractor site request.
* **UI Click Sequence**:
  1. On `/admin/calendar`, locate reservation bar for "Komatsu PC-200".
  2. Click reservation bar to open editor.
  3. Adjust End Date from `15 Oct 2026` to `17 Oct 2026`.
  4. Click `[Update Booking Period]`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
* **Elements & Contents Displayed**:
  - Revised date range display: "10 Oct - 17 Oct (7 Days)".
  - Recalculated total amount: `KES 455,000`.
* **Database Mapping & Mutations**:
  - `UPDATE public.reservations SET booking_period = tstzrange('2026-10-10 00:00:00+03', '2026-10-17 23:59:59+03'), total_amount = 455000.00, updated_at = NOW() WHERE id = $1;`
  - Table: `public.reservations` (Update).
* **Security & Privacy Audit**:
  - GiST trigger verifies extended range has no conflict with subsequent bookings.
* **UX & Logic Audit**:
  - Ribbon length expands dynamically on the UI grid.

---

### FLOW-021: Admin Tests GiST Exclusion Constraint Rejection on Overlapping Dates
* **User Role**: Admin
* **User Intention**: Attempt to intentionally double-book an already confirmed machine to test system safety guards.
* **UI Click Sequence**:
  1. On `/admin/calendar`, click `[+ Quick Booking]`.
  2. Select `Komatsu PC-200`.
  3. Select Dates: `11 Oct - 13 Oct` (overlapping with active booking 10-15 Oct).
  4. Click `[Lock Dispatch Dates]`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
* **Elements & Contents Displayed**:
  - UI intercepts and backend returns 409 Conflict.
  - Alert banner: `Double Booking Blocked: Komatsu PC-200 is already reserved from 10 Oct to 15 Oct. GiST exclusion constraint active.`
* **Database Mapping & Mutations**:
  - Attempted `INSERT` triggers PostgreSQL error: `ERROR: conflicting key value violates exclusion constraint "no_overlapping_reservations"`.
  - Transaction safely aborted. Zero corrupted rows.
* **Security & Privacy Audit**:
  - Demonstrates rock-solid ACID database level integrity against race conditions.
* **UX & Logic Audit**:
  - Suggest alternative machine: "Would you like to book the Shantui SL60W instead for these dates?".

---

### FLOW-022: Admin Filters Master Calendar by Individual Heavy Machine
* **User Role**: Admin
* **User Intention**: Inspect the entire 6-month itinerary of the Shantui SG18-3 Motor Grader.
* **UI Click Sequence**:
  1. On `/admin/calendar`, locate "Equipment Filter" dropdown in top toolbar.
  2. Select `Shantui SG18-3 Motor Grader` (`id="select-calendar-machine"`).
  3. Calendar updates to hide all other machines.
* **Routing & UI State**:
  - Route: `/admin/calendar?equipment_id=11111111-1111-1111-1111-111111111105`
* **Elements & Contents Displayed**:
  - Subtitle: `Showing schedule for: Shantui SG18-3 Motor Grader`.
  - Calendar shows open availability gaps highlighted in soft green.
* **Database Mapping & Mutations**:
  - `SELECT * FROM public.reservations WHERE physical_asset_id = '11111111-1111-1111-1111-111111111105' AND status != 'CANCELLED';`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Read-only filter.
* **UX & Logic Audit**:
  - "Clear Filter" button restores full fleet schedule view.

---

### FLOW-023: Admin Exports Calendar Reservation Schedule to CSV Format
* **User Role**: Admin
* **User Intention**: Download current monthly machinery dispatch schedule for physical quarry gate checkpoint.
* **UI Click Sequence**:
  1. On `/admin/calendar`, click `[Export Schedule (CSV)]` button in top toolbar (`id="btn-export-calendar-csv"`).
  2. Browser generates and downloads `HLG_Dispatch_Schedule_October_2026.csv`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
  - File Download trigger.
* **Elements & Contents Displayed**:
  - Toast message: `Export complete. 12 dispatch records downloaded.`
* **Database Mapping & Mutations**:
  - `SELECT r.id, p.name as equipment, r.client_name, lower(r.booking_period) as start_date, upper(r.booking_period) as end_date, r.daily_rate, r.status FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id WHERE r.status = 'CONFIRMED';`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Internal administrative export; does not include payment gateway tokens or passwords.
* **UX & Logic Audit**:
  - CSV output properly escapes comma characters in company names.

---

### FLOW-024: Admin Inspects Machine Downtime Maintenance Blocks on Calendar
* **User Role**: Admin
* **User Intention**: Check when the Komatsu D155 dozer is scheduled for its 500-hour transmission service.
* **UI Click Sequence**:
  1. On `/admin/calendar`, observe a red diagonal-striped ribbon across October 20-22.
  2. Click the red maintenance ribbon.
  3. Maintenance popover opens: `Service Order: 500-Hour Final Drive Lubrication`.
* **Routing & UI State**:
  - Route: `/admin/calendar`
* **Elements & Contents Displayed**:
  - Badge: `SCHEDULED MAINTENANCE`.
  - Machine: `Komatsu D155AX-8 Crawler Dozer`.
  - Service Description: `500-Hour Final Drive Lubrication & Track Tension Check`.
  - Assigned Mechanic: `Lead Technician Brian K.`
* **Database Mapping & Mutations**:
  - `SELECT m.*, p.name FROM public.maintenance_triggers m JOIN public.physical_assets p ON m.equipment_id = p.id WHERE m.equipment_id = '11111111-1111-1111-1111-111111111102';`
  - Tables: `public.maintenance_triggers` (Read), `public.staff_tasks` (Read).
* **Security & Privacy Audit**:
  - Maintenance records visible to Admin and Staff.
* **UX & Logic Audit**:
  - Calendar blocks booking creation during maintenance windows.

---

### FLOW-025: Admin Clicks Machine Badge in Calendar to Deep-Link to Fleet Manager
* **User Role**: Admin
* **User Intention**: Jump directly from calendar view to the machinery specs card in Fleet Manager.
* **UI Click Sequence**:
  1. On `/admin/calendar`, open details for "Komatsu PC-200".
  2. Click linked machine title: `[Komatsu PC-200 Heavy Excavator ->]`.
  3. Browser smoothly navigates to `/admin/fleet?highlight=11111111-1111-1111-1111-111111111101`.
  4. Fleet Management page loads with the Komatsu PC-200 row highlighted in glowing orange.
* **Routing & UI State**:
  - Source: `/admin/calendar`
  - Target: `/admin/fleet?highlight=11111111-1111-1111-1111-111111111101`
  - Sidebar updates to "2. Fleet Management".
* **Elements & Contents Displayed**:
  - Fleet table row for Komatsu PC-200 pulses with subtle animation for 2 seconds.
* **Database Mapping & Mutations**:
  - Standard fleet read query.
* **Security & Privacy Audit**:
  - Smooth authenticated navigation within Admin module.
* **UX & Logic Audit**:
  - Table auto-scrolls into view if highlighted row is off-screen.
