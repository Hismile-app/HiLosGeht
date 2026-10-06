# Hi Los Geht (HLG) Heavy Machinery Platform
## Dashboard UI/UX & User Action Flows Master Audit
### Document 02: Staff Management, Daily Logs & Verification (Flows 026 – 050)

---

### FLOW-026: Admin Opens Staff Management and Reviews Active Operators List
* **User Role**: Admin (Chief Dispatcher)
* **User Intention**: Inspect the active roster of heavy machinery operators, foremen, and dispatchers in Meru quarry operations.
* **UI Click Sequence**:
  1. On `/admin`, click `4. Staff Management` in sidebar (`id="nav-admin-staff"`).
  2. Route transitions to `/admin/staff`.
  3. Header displays title: `Quarry Operations & Field Staff Management`.
  4. Table loads listing active operators, including "Brian K. (Lead Operator - Meru Quarry)".
* **Routing & UI State**:
  - Current Route: `/admin/staff`
  - Sidebar Nav: "4. Staff Management" active.
* **Elements & Contents Displayed**:
  - Staff table columns: `Full Name`, `Email Address`, `Phone Number`, `Assigned Role`, `Account Status`, `Action Options`.
  - Status badges: `ACTIVE` (Emerald), `PENDING_SETUP` (Amber), `SUSPENDED` (Rose).
  - Quick action buttons: `[Invite Staff Member]`, `[Refresh Directory]`.
* **Database Mapping & Mutations**:
  - `SELECT id, full_name, email, phone_number, role, account_status, created_at FROM public.profiles WHERE role IN ('OPERATOR', 'ADMIN') ORDER BY created_at DESC;`
  - Tables Affected: `public.profiles` (Read).
* **Security & Privacy Audit**:
  - CRITICAL SECURITY CHECK: Query MUST EXPLICITLY EXCLUDE `password_hash` and `onboarding_token`.
  - Access restricted to `public.authorize('ADMIN')`. If an operator attempts to access `/admin/staff`, an access restriction card renders.
* **UX & Logic Audit**:
  - Empty state displays instructions for recruiting plant operators.

---

### FLOW-027: Admin Clicks 'Invite Staff Member' to Open Recruitment Modal
* **User Role**: Admin
* **User Intention**: Launch the modal interface to invite a newly hired excavator driver.
* **UI Click Sequence**:
  1. On `/admin/staff`, click top-right `[+ Invite Staff Member]` button (`id="btn-invite-staff"`).
  2. Modal opens with backdrop blur: `Invite Heavy Machinery Operator / Staff`.
* **Routing & UI State**:
  - Route: `/admin/staff`
  - Modal State: `showInviteModal = true`.
* **Elements & Contents Displayed**:
  - Modal title: "Invite Operations Staff".
  - Subtitle: "Generate a 48-hour secure onboarding link for quarry equipment operators."
  - Form Fields:
    - Full Name input (`placeholder="e.g. John Mwangi"`).
    - Email address input (`placeholder="operator@hilosgeht.co.ke"`).
    - Phone number input (`placeholder="+254 7XX XXX XXX"`).
    - Role selector dropdown: `[OPERATOR]` (Default) or `[ADMIN]`.
  - Buttons: `[Cancel]` and `[Generate Invite Link]`.
* **Database Mapping & Mutations**:
  - No database mutation on open (Modal render).
* **Security & Privacy Audit**:
  - Only authenticated Admin can trigger invite modal.
* **UX & Logic Audit**:
  - Focus auto-shifts to Full Name input field.

---

### FLOW-028: Admin Enters Operator Details and Generates a 48-Hour Onboarding Token
* **User Role**: Admin
* **User Intention**: Register a new operator profile with status `PENDING_SETUP` and a secure cryptographic token.
* **UI Click Sequence**:
  1. In Invite modal, type Name: `Emanuel Kiprono`.
  2. Type Email: `ekiprono@hilosgeht.co.ke`.
  3. Type Phone: `+254719882233`.
  4. Select Role: `OPERATOR`.
  5. Click `[Generate Invite Link]` button (`id="submit-staff-invite"`).
* **Routing & UI State**:
  - Route: `/admin/staff`
  - Modal state updates to success view showing the generated onboarding URL.
* **Elements & Contents Displayed**:
  - Banner: `Operator invitation created successfully!`
  - Generated link box: `https://hilosgeht.co.ke/onboarding?token=onboard_8f9c2d1e...`
  - Expiry notice: `Token expires in 48 hours.`
* **Database Mapping & Mutations**:
  - `INSERT INTO public.profiles (full_name, email, phone_number, role, account_status, onboarding_token) VALUES ('Emanuel Kiprono', 'ekiprono@hilosgeht.co.ke', '+254719882233', 'OPERATOR', 'PENDING_SETUP', 'onboard_' || encode(gen_random_bytes(24), 'hex')) RETURNING id, onboarding_token;`
  - `INSERT INTO public.user_roles (user_id, role) VALUES (new_id, 'OPERATOR');`
  - Tables Affected: `public.profiles` (Insert), `public.user_roles` (Insert).
* **Security & Privacy Audit**:
  - The token is stored temporarily in `onboarding_token` and wiped immediately upon user password setup.
* **UX & Logic Audit**:
  - Button state shows loading spinner during cryptographic generation.

---

### FLOW-029: Admin Copies Onboarding Invitation Link to Clipboard
* **User Role**: Admin
* **User Intention**: Copy the link to send via WhatsApp or SMS to the newly hired driver.
* **UI Click Sequence**:
  1. On the invitation success banner, click `[Copy Link]` button (`id="copy-invite-link-btn"`).
  2. Clipboard API triggers `navigator.clipboard.writeText(inviteUrl)`.
* **Routing & UI State**:
  - Route: `/admin/staff`
* **Elements & Contents Displayed**:
  - Button text flips from `[Copy Link]` to `[Copied! ✓]` with green checkmark for 2.5 seconds.
  - Toast notification: `Onboarding link copied to clipboard`.
* **Database Mapping & Mutations**:
  - Client side clipboard interaction only.
* **Security & Privacy Audit**:
  - Does not log clipboard content to browser storage.
* **UX & Logic Audit**:
  - Fallback textarea copy for older mobile browsers without `navigator.clipboard`.

---

### FLOW-030: Admin Changes Operator Role from 'OPERATOR' to 'ADMIN'
* **User Role**: Admin
* **User Intention**: Promote a senior foreman to Chief Dispatcher with full dashboard access.
* **UI Click Sequence**:
  1. In Staff Management table, locate operator "Brian K.".
  2. Click role badge dropdown in row (`id="role-select-briank"`).
  3. Select `ADMIN`.
  4. Confirmation dialog prompts: "Elevate Brian K. to Central Administrator? This grants full financial, fleet, and settings access."
  5. Click `[Confirm Elevation]`.
* **Routing & UI State**:
  - Route: `/admin/staff`
* **Elements & Contents Displayed**:
  - Role badge updates to `ADMIN` (Blue border, shield icon).
  - Toast message: `Role updated for Brian K. to ADMIN.`
* **Database Mapping & Mutations**:
  - `UPDATE public.profiles SET role = 'ADMIN', updated_at = NOW() WHERE id = '00000000-0000-0000-0000-000000000002';`
  - Trigger `trg_sync_profile_role` executes:
    `INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000002', 'ADMIN') ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role;`
  - Tables: `public.profiles` (Update), `public.user_roles` (Update).
* **Security & Privacy Audit**:
  - Only existing Admins can promote users.
  - The `custom_access_token_hook` will encode `user_role: 'ADMIN'` upon next token refresh.
* **UX & Logic Audit**:
  - Admin cannot demote their own active session to prevent accidental lockout.

---

### FLOW-031: Admin Suspends an Operator Account Due to Compliance Review
* **User Role**: Admin
* **User Intention**: Lockout an operator who failed site safety rules from submitting field logs or accessing plant equipment.
* **UI Click Sequence**:
  1. On `/admin/staff`, locate operator "Emanuel Kiprono".
  2. Click `More Options (...)` icon in Actions column.
  3. Select `Suspend Operator Account` (`id="btn-suspend-operator"`).
  4. Reason input opens: Type `Failed NTSA driving license verification`.
  5. Click `[Confirm Account Suspension]`.
* **Routing & UI State**:
  - Route: `/admin/staff`
* **Elements & Contents Displayed**:
  - Status badge turns red: `SUSPENDED`.
  - Row dims to 70% opacity.
  - Alert message: `Operator Emanuel Kiprono is suspended. All login sessions invalidated.`
* **Database Mapping & Mutations**:
  - `UPDATE public.profiles SET account_status = 'SUSPENDED', updated_at = NOW() WHERE id = $1;`
  - Table: `public.profiles` (Update).
* **Security & Privacy Audit**:
  - Middleware and JWT claim checks immediately reject any requests with `account_status = 'SUSPENDED'`.
* **UX & Logic Audit**:
  - Button dynamically changes to `[Reactivate Account]`.

---

### FLOW-032: Admin Reactivates a Suspended Operator Account
* **User Role**: Admin
* **User Intention**: Restore field access to an operator once safety compliance documents are cleared.
* **UI Click Sequence**:
  1. On `/admin/staff`, find suspended operator.
  2. Click `[Reactivate Account]` button in row.
  3. Confirmation popover: "Restore field access for Emanuel Kiprono?".
  4. Click `[Confirm Reactivation]`.
* **Routing & UI State**:
  - Route: `/admin/staff`
* **Elements & Contents Displayed**:
  - Status badge returns to emerald: `ACTIVE`.
  - Toast notification: `Account reactivated. Operator may now log in.`
* **Database Mapping & Mutations**:
  - `UPDATE public.profiles SET account_status = 'ACTIVE', updated_at = NOW() WHERE id = $1;`
  - Table: `public.profiles` (Update).
* **Security & Privacy Audit**:
  - Admin authorization verified.
* **UX & Logic Audit**:
  - Action logged in system audit trail.

---

### FLOW-033: Admin Resends Onboarding Invitation Token to Operator Email
* **User Role**: Admin
* **User Intention**: Deliver a new activation token when an operator reports the previous email expired.
* **UI Click Sequence**:
  1. On `/admin/staff`, locate an operator with status `PENDING_SETUP`.
  2. Click `[Resend Invitation]` icon button.
  3. Dialog prompts: "A new 48-hour activation link will be generated. The previous link will be invalidated."
  4. Click `[Generate & Dispatch Link]`.
* **Routing & UI State**:
  - Route: `/admin/staff`
* **Elements & Contents Displayed**:
  - Updated link dialog appears with one-click copy.
  - Timestamp updates: `Invite sent: Just now`.
* **Database Mapping & Mutations**:
  - `UPDATE public.profiles SET onboarding_token = 'onboard_' || encode(gen_random_bytes(24), 'hex'), updated_at = NOW() WHERE id = $1;`
  - Table: `public.profiles` (Update).
* **Security & Privacy Audit**:
  - Previous token is replaced immediately, invalidating any leaked old URLs.
* **UX & Logic Audit**:
  - Rate limited to once every 60 seconds per email to prevent email flooding.

---

### FLOW-034: Admin Deletes an Inactive Staff Profile with Safety Confirmation
* **User Role**: Admin
* **User Intention**: Remove a duplicate or erroneously created staff profile.
* **UI Click Sequence**:
  1. On `/admin/staff`, click Trash icon next to inactive staff record.
  2. Danger confirmation modal appears:
     "Permanently delete staff record? If this operator has submitted daily field logs, their history will be preserved as 'Unknown Operator'."
  3. Click `[Confirm Profile Deletion]`.
* **Routing & UI State**:
  - Route: `/admin/staff`
* **Elements & Contents Displayed**:
  - Row removed from table with fade-out animation.
  - Toast message: `Staff profile removed.`
* **Database Mapping & Mutations**:
  - `DELETE FROM public.profiles WHERE id = $1;`
  - Dependent foreign key in `staff_logs.staff_id` has `ON DELETE SET NULL`, preserving fuel and meter logs.
  - Tables Affected: `public.profiles` (Delete), `public.staff_logs` (Cascade foreign key set null).
* **Security & Privacy Audit**:
  - Requires Admin role. Ensures historical equipment logs are never deleted accidentally.
* **UX & Logic Audit**:
  - Check if operator currently has active machine dispatches before permitting deletion.

---

### FLOW-035: Admin Navigates to Daily Logs Ledger and Reviews Submitted Logs
* **User Role**: Admin (Chief Dispatcher / Quarry Accountant)
* **User Intention**: Audit end-of-day machinery hour meters, quarry output, and diesel consumption across all sites.
* **UI Click Sequence**:
  1. Click `5. Daily Logs Ledger` in sidebar (`id="nav-admin-logs"`).
  2. Route opens `/admin/logs`.
  3. Ledger table loads chronological list of shift logs.
* **Routing & UI State**:
  - Current Route: `/admin/logs`
  - Sidebar Nav: "5. Daily Logs Ledger" active.
* **Elements & Contents Displayed**:
  - Summary KPI cards at top:
    - `Total Shift Logs: 42`
    - `Total Hours Billed: 310.5 hrs`
    - `Total Fuel Consumed: 1,420 Litres`
  - Ledger Table Columns: `Date`, `Machine Asset`, `Operator Name`, `Start Meter`, `End Meter`, `Net Hours`, `Fuel (L)`, `Proof Badges`, `Actions`.
* **Database Mapping & Mutations**:
  - `SELECT l.id, l.equipment_id, l.staff_id, l.start_meter, l.end_meter, (l.end_meter - l.start_meter) as hours_worked, l.work_description, l.fuel_amount, l.fuel_proof_image, l.materials_received, l.materials_proof_image, l.date_submitted, p.name as equipment_name, p.model as equipment_model, p.category, pr.full_name as operator_name, pr.email as operator_email FROM public.staff_logs l JOIN public.physical_assets p ON l.equipment_id = p.id LEFT JOIN public.profiles pr ON l.staff_id = pr.id ORDER BY l.date_submitted DESC;`
  - Tables: `public.staff_logs` (Read), `public.physical_assets` (Read), `public.profiles` (Read).
* **Security & Privacy Audit**:
  - Admin reads all operator logs. Individual operators can only view their own logs via RLS policy `Staff can insert logs and view own, Admin full access`.
* **UX & Logic Audit**:
  - Net hours calculation formatted to 1 decimal place (`8.5 hrs`).

---

### FLOW-036: Admin Searches Daily Logs by Operator Name or Machine Model
* **User Role**: Admin
* **User Intention**: Find all logs submitted by "Brian K." on the Komatsu PC-200 excavator.
* **UI Click Sequence**:
  1. On `/admin/logs`, click search input (`id="search-daily-logs"`).
  2. Type `Brian PC-200`.
  3. Table filters instantly to show matching shift submissions.
* **Routing & UI State**:
  - Route: `/admin/logs`
* **Elements & Contents Displayed**:
  - Filtered count: "Showing 5 logs for Brian PC-200".
  - Rows display date submitted, start/end meters, and quarry output notes.
* **Database Mapping & Mutations**:
  - Filter evaluated client-side or via query: `WHERE pr.full_name ILIKE '%Brian%' AND p.model ILIKE '%PC-200%'`.
* **Security & Privacy Audit**:
  - Parameterized search query.
* **UX & Logic Audit**:
  - Highlighting search match terms in table text for visual feedback.

---

### FLOW-037: Admin Filters Daily Logs by Machinery Category
* **User Role**: Admin
* **User Intention**: Audit tipper haulage trucks only to check aggregate delivery tonnage.
* **UI Click Sequence**:
  1. On `/admin/logs`, click Category filter dropdown (`id="filter-log-category"`).
  2. Select `Tipper`.
  3. Table re-renders with Isuzu FVZ 34 haulage logs.
* **Routing & UI State**:
  - Route: `/admin/logs?category=Tipper`
* **Elements & Contents Displayed**:
  - Rows show materials received columns: "15 Tons Quarry Ballast", "15 Tons Hardcore Stone".
* **Database Mapping & Mutations**:
  - `WHERE p.category = 'Tipper'`
* **Security & Privacy Audit**:
  - Safe query filtering.
* **UX & Logic Audit**:
  - Summary stats cards above table re-calculate for the filtered category.

---

### FLOW-038: Admin Clicks a Log Row to Open Detailed Inspection Drawer
* **User Role**: Admin
* **User Intention**: Review full details of a specific daily log, including quarry work description and meter gap.
* **UI Click Sequence**:
  1. On `/admin/logs`, click on log row `#LOG-8812` for Komatsu PC-200.
  2. Inspection Drawer slides in from the right edge.
* **Routing & UI State**:
  - Route: `/admin/logs`
  - Drawer State: `selectedLog = logObject`.
* **Elements & Contents Displayed**:
  - Drawer Header: `Daily Log Dossier: Komatsu PC-200 • 06 Oct 2026`.
  - Section 1: Engine Hours (Start: `334.0 hrs`, End: `342.5 hrs`, Total: `8.5 hrs`).
  - Section 2: Fuel Refueled (`65.0 Litres Diesel`).
  - Section 3: Work Performed (`Excavated 450 tons of basalt rock in Meru Quarry North Pit`).
  - Section 4: Physical Evidence Gallery (Thumbnails for Fuel Receipt and Weighbridge Note).
* **Database Mapping & Mutations**:
  - `SELECT * FROM public.staff_logs WHERE id = $1;`
  - Table: `public.staff_logs` (Read).
* **Security & Privacy Audit**:
  - Admin view only.
* **UX & Logic Audit**:
  - Drawer can be dismissed via `Esc` key or close button `(X)`.

---

### FLOW-039: Admin Audits Engine Start Meter vs End Meter Calculations
* **User Role**: Admin
* **User Intention**: Verify that end meter minus start meter equals the reported billable hours and matches telematics GPS hours.
* **UI Click Sequence**:
  1. Inside Log Drawer on `/admin/logs`, check comparison card:
     - `Reported Shift Hours: 8.5 hrs`
     - `Telematics GPS Operating Hours: 8.3 hrs`
     - `Discrepancy: +0.2 hrs (Within 5% normal tolerance)`.
* **Routing & UI State**:
  - Route: `/admin/logs`
* **Elements & Contents Displayed**:
  - Green audit badge: `Meter Reconciliation Verified ✓`.
  - Machine hour meter continuity meter: "Next start meter should be: 342.5 hrs".
* **Database Mapping & Mutations**:
  - `SELECT current_hour_meter FROM public.physical_assets WHERE id = log.equipment_id;`
  - Table: `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Read-only comparison.
* **UX & Logic Audit**:
  - If discrepancy exceeds 1.5 hours, display amber warning: "Flag: Significant difference between physical meter and telematics ignition log."

---

### FLOW-040: Admin Flags an Abnormal Fuel Consumption Log Entry for Investigation
* **User Role**: Admin
* **User Intention**: Mark a log where fuel burn was 120 liters for only 2 hours of engine operation.
* **UI Click Sequence**:
  1. Inside Log Drawer, click yellow alert button: `[Flag Log for Audit Review]` (`id="btn-flag-log"`).
  2. Dialog opens: "Select Audit Flag Reason".
  3. Select `Abnormal High Fuel Burn (60 L/hr vs 18 L/hr expected)`.
  4. Type note: "Contact operator Brian K. to verify fuel pump calibration or check for fuel tank leak."
  5. Click `[Submit Audit Flag]`.
* **Routing & UI State**:
  - Route: `/admin/logs`
* **Elements & Contents Displayed**:
  - Row gains an amber flag badge: `AUDIT FLAGGED`.
  - Notification dispatched to fleet superintendent.
* **Database Mapping & Mutations**:
  - `UPDATE public.staff_logs SET work_description = work_description || ' [AUDIT FLAGGED: High fuel burn]', updated_at = NOW() WHERE id = $1;`
  - (Or update a dedicated `is_flagged` boolean).
  - Table: `public.staff_logs` (Update).
* **Security & Privacy Audit**:
  - Admin role required to flag logs.
* **UX & Logic Audit**:
  - System displays link to AI Insights page where automated anomaly detection tracks fleet fuel burn averages.

---

### FLOW-041: Admin Clicks Fuel Proof Thumbnail to Inspect Receipt Image Full-Screen
* **User Role**: Admin
* **User Intention**: Inspect the fuel pump meter photo to verify the liters pumped and station receipt stamp.
* **UI Click Sequence**:
  1. In Log Drawer, click thumbnail under "Fuel Receipt Proof" (`id="thumb-fuel-receipt"`).
  2. Full-screen image lightbox modal opens (`previewImage = log.fuel_proof_image`).
  3. Modal displays high-resolution camera photo of the TotalEnergies Meru pump meter.
* **Routing & UI State**:
  - Route: `/admin/logs`
  - Modal: Lightbox active.
* **Elements & Contents Displayed**:
  - Zoomable high-res photo.
  - Image controls: `[Zoom In +]`, `[Zoom Out -]`, `[Rotate 90°]`, `[Close (Esc)]`.
  - Overlay metadata: "Uploaded: 06 Oct 2026, 17:30 EAT by Brian K.".
* **Database Mapping & Mutations**:
  - Image URL loaded from `staff_logs.fuel_proof_image`.
* **Security & Privacy Audit**:
  - Ensure image URLs originate from secure Supabase storage buckets or validated static image paths.
* **UX & Logic Audit**:
  - Smooth pan and zoom support for mobile inspection.

---

### FLOW-042: Admin Clicks Materials Proof Thumbnail to Inspect Delivery Note Image
* **User Role**: Admin
* **User Intention**: Examine signed quarry weighbridge ticket for 15 tons of ballast.
* **UI Click Sequence**:
  1. In Log Drawer, click thumbnail under "Materials Delivered Proof" (`id="thumb-materials-proof"`).
  2. Lightbox opens displaying signed weighbridge ticket with vehicle registration number `KDJ 442P`.
* **Routing & UI State**:
  - Route: `/admin/logs`
* **Elements & Contents Displayed**:
  - High-res image display with zoom controls.
  - Verification checklist: "Weighbridge Stamp Visible: Yes", "Driver Signature: Yes".
* **Database Mapping & Mutations**:
  - Image URL from `staff_logs.materials_proof_image`.
* **Security & Privacy Audit**:
  - Authenticated access.
* **UX & Logic Audit**:
  - If no image was uploaded, drawer displays gray placeholder: "No materials voucher attached to this shift".

---

### FLOW-043: Admin Exports Filtered Daily Logs to CSV for Payroll/Accounting
* **User Role**: Admin (Quarry Accountant)
* **User Intention**: Generate spreadsheet of operator hours and fuel receipts for month-end payroll reconciliation.
* **UI Click Sequence**:
  1. On `/admin/logs`, click `[Export Logs (CSV)]` in top toolbar (`id="btn-export-logs-csv"`).
  2. File `HLG_Daily_Shift_Logs_Oct2026.csv` downloads to local device.
* **Routing & UI State**:
  - Route: `/admin/logs`
* **Elements & Contents Displayed**:
  - Download toast: `Export complete. 42 daily log records exported to CSV.`
* **Database Mapping & Mutations**:
  - `SELECT l.date_submitted, p.name as equipment, pr.full_name as operator, l.start_meter, l.end_meter, (l.end_meter - l.start_meter) as net_hours, l.fuel_amount, l.work_description FROM public.staff_logs l JOIN public.physical_assets p ON l.equipment_id = p.id LEFT JOIN public.profiles pr ON l.staff_id = pr.id ORDER BY l.date_submitted DESC;`
  - Tables: `public.staff_logs` (Read).
* **Security & Privacy Audit**:
  - Administrative action. Excludes internal IDs and tokens from export.
* **UX & Logic Audit**:
  - Properly formats numeric hours and currency for direct import into Excel.

---

### FLOW-044: Admin Navigates to Document Verification Gallery
* **User Role**: Admin (Chief Auditor)
* **User Intention**: Review a centralized visual wall of all physical receipts, vouchers, and weighbridge dockets submitted from the field.
* **UI Click Sequence**:
  1. In sidebar, click `11. Document Verification` (`id="nav-admin-verification"`).
  2. Route navigates to `/admin/verification`.
  3. Visual masonry gallery loads with receipt photo cards.
* **Routing & UI State**:
  - Current Route: `/admin/verification`
  - Sidebar Nav: "11. Document Verification" active.
* **Elements & Contents Displayed**:
  - Gallery stats header:
    - `Total Verified Documents: 8`
    - `Fuel Vouchers: 5`
    - `Materials Dockets: 3`
  - Filter Tabs: `[All Documents (8)]`, `[Fuel Receipts Only (5)]`, `[Materials & Delivery Notes (3)]`.
  - Photo grid with operator attribution, machine name, and submission timestamp.
* **Database Mapping & Mutations**:
  - `SELECT id as log_id, date_submitted, fuel_amount, fuel_proof_image, materials_received, materials_proof_image, (SELECT full_name FROM public.profiles WHERE id = staff_logs.staff_id) as operator_name, (SELECT name FROM public.physical_assets WHERE id = staff_logs.equipment_id) as machine_name, (SELECT model FROM public.physical_assets WHERE id = staff_logs.equipment_id) as machine_model FROM public.staff_logs WHERE fuel_proof_image IS NOT NULL OR materials_proof_image IS NOT NULL ORDER BY date_submitted DESC;`
  - Tables: `public.staff_logs` (Read), `public.profiles` (Read), `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Admin and Foreman view only.
* **UX & Logic Audit**:
  - Lazy loading for high-resolution images to maintain fast page load.

---

### FLOW-045: Admin Filters Document Gallery by 'FUEL' Receipts Only
* **User Role**: Admin
* **User Intention**: Reconcile diesel filling station invoices against operator photo vouchers.
* **UI Click Sequence**:
  1. On `/admin/verification`, click filter button `[Fuel Receipts Only]` (`id="filter-docs-fuel"`).
  2. Gallery updates to show only fuel pump photos.
* **Routing & UI State**:
  - Route: `/admin/verification?type=FUEL`
* **Elements & Contents Displayed**:
  - Card overlay tags: `Fuel Proof • 65.0 Litres Diesel`.
  - Operator: `Brian K.`, Machine: `Komatsu PC-200`.
* **Database Mapping & Mutations**:
  - `WHERE fuel_proof_image IS NOT NULL`
* **Security & Privacy Audit**:
  - Read-only filter.
* **UX & Logic Audit**:
  - Instant transition with zero full-page reload.

---

### FLOW-046: Admin Filters Document Gallery by 'MATERIALS' Delivery Notes Only
* **User Role**: Admin
* **User Intention**: Verify aggregate receipts for billing commercial construction clients.
* **UI Click Sequence**:
  1. On `/admin/verification`, click filter button `[Materials & Delivery Notes]` (`id="filter-docs-materials"`).
  2. Gallery displays weighbridge tickets and material receipts.
* **Routing & UI State**:
  - Route: `/admin/verification?type=MATERIALS`
* **Elements & Contents Displayed**:
  - Card overlay: `Materials • 15 Tons Aggregate`.
  - Machine: `Isuzu FVZ 34 Heavy Tipper`.
* **Database Mapping & Mutations**:
  - `WHERE materials_proof_image IS NOT NULL`
* **Security & Privacy Audit**:
  - Authenticated filter.
* **UX & Logic Audit**:
  - Badges clearly indicate material tonnage.

---

### FLOW-047: Admin Clicks a Voucher Image to Open High-Resolution Zoom Modal
* **User Role**: Admin
* **User Intention**: Read blurry serial number or diesel pump price on a photo taken in the Meru quarry pit.
* **UI Click Sequence**:
  1. On `/admin/verification`, hover over receipt card and click `View Fullscreen (Eye Icon)` (`id="btn-zoom-doc-1"`).
  2. Lightbox opens in 4K resolution modal.
* **Routing & UI State**:
  - Route: `/admin/verification`
  - Modal: `previewImage = selectedUrl`.
* **Elements & Contents Displayed**:
  - Darkened backdrop with centered image.
  - Controls: `[Close X]`, `[Download Image]`, `[Audit Approved ✓]`, `[Flag Discrepancy !]`.
* **Database Mapping & Mutations**:
  - Read query for specific image URL.
* **Security & Privacy Audit**:
  - Safe asset delivery.
* **UX & Logic Audit**:
  - Keyboard shortcut `Esc` closes lightbox.

---

### FLOW-048: Admin Approves a Verified Fuel Receipt Voucher
* **User Role**: Admin
* **User Intention**: Mark a fuel voucher as officially audited and reconciled for accounting.
* **UI Click Sequence**:
  1. Inside voucher lightbox on `/admin/verification`, click green button: `[Approve Document ✓]` (`id="btn-approve-voucher"`).
  2. Dialog confirms: "Mark fuel receipt for 65.0 L as verified?".
  3. Click `[Confirm Approval]`.
* **Routing & UI State**:
  - Route: `/admin/verification`
* **Elements & Contents Displayed**:
  - Card gains green checkmark badge: `AUDIT VERIFIED`.
  - Toast notification: `Document verified and locked for accounting.`
* **Database Mapping & Mutations**:
  - `UPDATE public.staff_logs SET work_description = work_description || ' [VOUCHER VERIFIED]', updated_at = NOW() WHERE id = $1;`
  - Table: `public.staff_logs` (Update).
* **Security & Privacy Audit**:
  - Admin authorization required.
* **UX & Logic Audit**:
  - Card moves to "Verified" tab.

---

### FLOW-049: Admin Rejects a Blurry or Fraudulent Fuel Voucher with Notes
* **User Role**: Admin
* **User Intention**: Reject an unreadable photo and instruct the operator to resubmit a clear photo.
* **UI Click Sequence**:
  1. Inside voucher modal on `/admin/verification`, click red button: `[Reject Voucher !]` (`id="btn-reject-voucher"`).
  2. Reason selector opens: Choose `Unreadable / Blurry Image`.
  3. Input notes: "Please retake photo showing pump receipt totals clearly."
  4. Click `[Submit Rejection & Notify Operator]`.
* **Routing & UI State**:
  - Route: `/admin/verification`
* **Elements & Contents Displayed**:
  - Card gains red warning badge: `VOUCHER REJECTED`.
  - Toast message: `Voucher rejected. Task alert sent to operator Brian K.`
* **Database Mapping & Mutations**:
  - `INSERT INTO public.staff_tasks (assigned_to, equipment_id, task_type, priority, status, description) VALUES (staff_id, equipment_id, 'RESUBMIT_VOUCHER', 'HIGH', 'PENDING', 'Rejection notice: Fuel voucher unreadable. Resubmit clear photo.');`
  - Tables Affected: `public.staff_tasks` (Insert).
* **Security & Privacy Audit**:
  - Operator receives task notification upon next login.
* **UX & Logic Audit**:
  - Clear feedback provided to operator.

---

### FLOW-050: Admin Searches Verification Gallery by Quarry Job Site Name
* **User Role**: Admin
* **User Intention**: Audit all vouchers submitted specifically from the "Nkubu Bypass Project".
* **UI Click Sequence**:
  1. On `/admin/verification`, click Search bar (`id="search-docs-input"`).
  2. Type `Nkubu`.
  3. Gallery filters to show vouchers tagged with Nkubu excavation tasks.
* **Routing & UI State**:
  - Route: `/admin/verification`
* **Elements & Contents Displayed**:
  - Filter counter: `Showing 3 documents for 'Nkubu'`.
* **Database Mapping & Mutations**:
  - `WHERE work_description ILIKE '%Nkubu%'`
* **Security & Privacy Audit**:
  - Parameterized search.
* **UX & Logic Audit**:
  - Instant live search with debounce.
