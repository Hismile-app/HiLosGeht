# Hi Los Geht (HLG) Heavy Machinery Platform
## Dashboard UI/UX & User Action Flows Master Audit
### Document 04: Operator Field Portal, Profile, Auth & Onboarding (Flows 076 – 100)

---

### FLOW-076: New Operator Clicks Onboarding Email Link with Token
* **User Role**: New Operator (Plant Driver / Field Technician)
* **User Intention**: Access the initial account setup page via the invitation link sent to their phone or email by the Central Dispatcher.
* **UI Click Sequence**:
  1. Operator taps onboarding link received via SMS/Email:
     `https://hilosgeht.co.ke/onboarding?token=onboard_8f9c2d1e...`
  2. Mobile browser opens `/onboarding?token=...`.
  3. System validates cryptographic token against the backend.
  4. Form unlocks displaying welcome banner: "Welcome to HLG Machinery Fleet • Operator Activation".
* **Routing & UI State**:
  - Current Route: `/onboarding?token=onboard_8f9c2d1e...`
  - URL Query: `token` present.
  - Page State: `tokenValid = true`, `loading = false`.
* **Elements & Contents Displayed**:
  - Organization Badge: `Hi Los Geht • Heavy Plant Operations`.
  - Welcome Banner with Operator Email prefilled (read-only): `ekiprono@hilosgeht.co.ke`.
  - Assigned Role Badge: `OPERATOR (Field Plant Driver)`.
  - Form Fields:
    - Full Name input (prefilled with invitation name: `Emanuel Kiprono`).
    - Mobile Phone number input (`+254 719 882233`).
    - Create Password input (`type="password"`).
    - Confirm Password input (`type="password"`).
    - Submit Button: `[Complete Onboarding & Activate Account]`.
* **Database Mapping & Mutations**:
  - `SELECT id, email, full_name, role, account_status FROM public.profiles WHERE onboarding_token = $1 AND account_status = 'PENDING_SETUP';`
  - Table: `public.profiles` (Read).
* **Security & Privacy Audit**:
  - CRITICAL: Onboarding token must be single-use. If token has expired or is invalid, render explicit error: `This activation link has expired or is invalid. Please contact HLG Dispatch at 0717 186396.`
  - Password field MUST enforce minimum 8 characters with numbers and symbols.
* **UX & Logic Audit**:
  - Mobile-responsive layout optimized for smartphones used by operators in the quarry pit.

---

### FLOW-077: Operator Enters Full Name, Phone Number, and Sets Secure Password
* **User Role**: Operator
* **User Intention**: Complete personal profile details and create their private access credential.
* **UI Click Sequence**:
  1. On `/onboarding`, verify full name is correct.
  2. Enter phone number: `+254719882233`.
  3. Enter password: `OperatorPass@2026`.
  4. Enter confirm password: `OperatorPass@2026`.
  5. Password strength meter updates to green: `Strong Password`.
* **Routing & UI State**:
  - Route: `/onboarding`
* **Elements & Contents Displayed**:
  - Real-time password matching validator checkmark.
  - Show/Hide password eye toggle button.
* **Database Mapping & Mutations**:
  - Client-side validation before commit.
* **Security & Privacy Audit**:
  - Password entered in masked input. No plain-text password logged to browser console or telemetry.
* **UX & Logic Audit**:
  - Submit button remains disabled until password confirmation matches and meets length rules.

---

### FLOW-078: Operator Submits Onboarding Form and is Redirected to Login
* **User Role**: Operator
* **User Intention**: Commit new account activation and transition to the operational sign-in screen.
* **UI Click Sequence**:
  1. Click `[Complete Onboarding & Activate Account]` button (`id="submit-onboarding-btn"`).
  2. Loading spinner indicates account provisioning.
  3. Success screen displays:
     `"Account Activated! Welcome to the Hi Los Geht team. You may now sign in with your credentials."`
  4. Auto-redirect or click `[Proceed to Sign In ->]` button.
  5. Browser routes to `/login`.
* **Routing & UI State**:
  - Source: `/onboarding`
  - Target: `/login`
* **Elements & Contents Displayed**:
  - Green checkmark animation with confirmation message.
  - Smooth route transition to `/login`.
* **Database Mapping & Mutations**:
  - `UPDATE public.profiles SET full_name = 'Emanuel Kiprono', phone_number = '+254719882233', password_hash = crypt('OperatorPass@2026', gen_salt('bf')), account_status = 'ACTIVE', onboarding_token = NULL, updated_at = NOW() WHERE onboarding_token = $1;`
  - Table: `public.profiles` (Update).
* **Security & Privacy Audit**:
  - Cryptographic token is permanently destroyed (`onboarding_token = NULL`), preventing replay attacks.
  - Password hashed using bcrypt before storage.
* **UX & Logic Audit**:
  - Pre-fills operator email on `/login` to minimize repetitive typing on mobile devices.

---

### FLOW-079: Operator Logs In with Credentials and Lands on Field Dashboard
* **User Role**: Operator
* **User Intention**: Access their daily work station on their smartphone before starting morning machinery inspection.
* **UI Click Sequence**:
  1. On `/login`, input email: `ekiprono@hilosgeht.co.ke` (or username `Emanuel`).
  2. Input password: `OperatorPass@2026`.
  3. Click `[Sign In to Command Hub]` (`id="login-submit-btn"`).
  4. System detects `role: 'OPERATOR'`.
  5. Browser automatically navigates to `/staff`.
* **Routing & UI State**:
  - Source: `/login`
  - Target: `/staff` (or `/dashboard/operator/log`)
  - Session State: `hlg_role = 'OPERATOR'`, `hlg_user = { full_name: 'Emanuel Kiprono', role: 'OPERATOR' }`.
* **Elements & Contents Displayed**:
  - Top Banner: `OPERATOR FIELD DISPATCH • MERU QUARRY HUB`.
  - Greeting: `Welcome, Emanuel Kiprono • Daily Shift Log`.
  - Nav Tabs: `[Daily Machinery Log (Active)]`, `[Assigned Inquiries & Bookings]`.
  - Form Header: `End of Shift Machinery & Fuel Verification Form`.
* **Database Mapping & Mutations**:
  - `SELECT id, full_name, email, role, account_status FROM public.profiles WHERE (email = $1 OR full_name = $1) AND account_status = 'ACTIVE';`
  - Verifies bcrypt password hash.
  - Generates session JWT containing claim `user_role = 'OPERATOR'`.
* **Security & Privacy Audit**:
  - Operator cannot access Admin pages. Sidebar only displays `Daily Log Submission` and `Staff Profile & Permits`.
* **UX & Logic Audit**:
  - Clean, high-contrast UI designed for outdoor visibility under sunlight in the quarry.

---

### FLOW-080: Operator Selects Assigned Machinery from Dropdown List
* **User Role**: Operator
* **User Intention**: Choose the specific machine they operated during today's shift.
* **UI Click Sequence**:
  1. On `/staff`, locate "Assigned Machinery" dropdown (`id="select-assigned-equipment"`).
  2. Click dropdown.
  3. List opens showing active plant equipment:
     - `Komatsu PC-200 Heavy Excavator (342.5 hrs)`
     - `Komatsu D155AX-8 Crawler Dozer (490.0 hrs)`
     - `JCB 3DXPLUS Backhoe Loader (128.0 hrs)`
     - `Shantui SL60W-2 Wheel Loader (215.4 hrs)`
     - `Isuzu FVZ 34 Heavy Tipper Truck (512.8 hrs)`
  4. Select `Komatsu PC-200 Heavy Excavator`.
* **Routing & UI State**:
  - Route: `/staff`
  - Component State: `selectedEquipmentId = '11111111-1111-1111-1111-111111111101'`.
* **Elements & Contents Displayed**:
  - Machine specs summary badge appears below dropdown:
    `Model: Komatsu PC-200 • Category: Excavator • Registered Meter: 342.5 hrs`.
* **Database Mapping & Mutations**:
  - `SELECT id, name, model, category, current_hour_meter, status FROM public.physical_assets WHERE status != 'MAINTENANCE' ORDER BY name ASC;`
  - Table: `public.physical_assets` (Read).
* **Security & Privacy Audit**:
  - Machine list open to authenticated staff.
* **UX & Logic Audit**:
  - Only operational machines shown. Decommissioned machines excluded.

---

### FLOW-081: Operator Verifies Start Meter is Prefilled from Previous Day's End Meter
* **User Role**: Operator
* **User Intention**: Confirm that the engine hour meter when starting work matches the official system record.
* **UI Click Sequence**:
  1. On `/staff`, look at "Shift Starting Hour Meter" field (`id="input-start-meter"`).
  2. Value is automatically locked/prefilled: `342.5 hrs`.
  3. Operator verifies against the physical dashboard hour meter in the excavator cabin.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Input field pre-populated with `342.5`.
  - Helper note: `Prefilled from physical asset registry. Contact dispatcher if physical meter differs.`
* **Database Mapping & Mutations**:
  - Loaded directly from `physical_assets.current_hour_meter`.
* **Security & Privacy Audit**:
  - Prevents operators from rolling back engine hours.
* **UX & Logic Audit**:
  - Field is disabled or requires override reason if edited.

---

### FLOW-082: Operator Enters Shift End Hour Meter Reading
* **User Role**: Operator
* **User Intention**: Record the final hour meter displayed on the machine at the end of the shift.
* **UI Click Sequence**:
  1. On `/staff`, click into "Shift Ending Hour Meter" field (`id="input-end-meter"`).
  2. Input: `351.0`.
  3. System automatically calculates and displays:
     `Shift Duration: 8.5 Operating Hours`.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Ending hour meter input.
  - Calculated Net Hours badge: `+8.5 hrs Worked` (Green badge).
* **Database Mapping & Mutations**:
  - Local state calculation (`endMeter - startMeter`).
* **Security & Privacy Audit**:
  - Client and server side arithmetic verification.
* **UX & Logic Audit**:
  - Live calculation provides immediate visual feedback.

---

### FLOW-083: Operator Validates Error Warning When End Meter is Lower Than Start Meter
* **User Role**: Operator
* **User Intention**: Accidental typo test where operator types 340.0 instead of 350.0.
* **UI Click Sequence**:
  1. On `/staff`, enter Ending Meter: `340.0` (Start meter is `342.5`).
  2. System detects negative hours (`-2.5 hrs`).
  3. Field highlights in red border.
  4. Error banner appears:
     `"Invalid Meter Reading: Ending meter (340.0 hrs) cannot be lower than start meter (342.5 hrs). Heavy machinery hour meters cannot run backwards."`
  5. Submit button is disabled.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Red alert banner with warning icon (`AlertTriangle`).
  - Disabled submit button with tooltip: `Fix hour meter error before submitting`.
* **Database Mapping & Mutations**:
  - Blocked client side and enforced by database check constraint `CHECK (end_meter >= start_meter)`.
* **Security & Privacy Audit**:
  - Prevents data corruption and negative billable hours.
* **UX & Logic Audit**:
  - Clear, logical explanation of why the input is invalid.

---

### FLOW-084: Operator Enters Work Performed Description
* **User Role**: Operator
* **User Intention**: Describe the quarry activity, rock strata excavated, or road construction work completed.
* **UI Click Sequence**:
  1. On `/staff`, click into "Work Description & Site Yield" textarea (`id="input-work-description"`).
  2. Type:
     `"Excavated hard basalt rock at Quarry Face #3, Meru bypass. Loaded 18 tipper trucks of crushed aggregates. Hydraulics operating normally."`
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Textarea with character counter: `142 / 500 characters`.
  - Placeholder: `e.g. Excavation of foundation trench, 14 tipper loads dispatched...`.
* **Database Mapping & Mutations**:
  - Local form state (`workDescription`).
* **Security & Privacy Audit**:
  - Sanitization of text input to prevent XSS.
* **UX & Logic Audit**:
  - Requires minimum 10 characters to ensure meaningful quarry site reports.

---

### FLOW-085: Operator Logs Fuel Refueled Quantity (Litres)
* **User Role**: Operator
* **User Intention**: Report diesel fuel pumped into the excavator during the shift.
* **UI Click Sequence**:
  1. On `/staff`, locate "Diesel Refueling (Litres)" field (`id="input-fuel-amount"`).
  2. Input: `75.0`.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Number input with `Litres` unit suffix.
  - Calculated fuel burn rate estimate: `75.0 L / 8.5 hrs = 8.82 L/hr (Optimal)`.
* **Database Mapping & Mutations**:
  - Form state (`fuelAmount = 75.0`).
* **Security & Privacy Audit**:
  - Validates positive numeric value.
* **UX & Logic Audit**:
  - Can be left at `0` if machine was not refueled during this shift.

---

### FLOW-086: Operator Uploads Camera Photo of Fuel Pump Meter/Receipt
* **User Role**: Operator
* **User Intention**: Attach physical proof of diesel dispensed using smartphone camera.
* **UI Click Sequence**:
  1. On `/staff`, click `[📸 Snap / Upload Fuel Receipt]` button (`id="upload-fuel-receipt"`).
  2. Smartphone camera opens natively.
  3. Operator takes photo of the fuel pump digital meter showing 75.00 L.
  4. Photo uploads and thumbnail preview renders in the card.
* **Routing & UI State**:
  - Route: `/staff`
  - Upload State: `fuelImageFile` set.
* **Elements & Contents Displayed**:
  - Thumbnail preview of the photo with green checkmark: `Receipt Attached ✓`.
  - Remove button `[Remove / Retake]`.
* **Database Mapping & Mutations**:
  - Image uploaded to Supabase Storage bucket `fuel-receipts` or base64 encoded URL.
* **Security & Privacy Audit**:
  - Validates file type (`image/jpeg`, `image/png`, `image/webp`) and restricts max size to 10MB.
* **UX & Logic Audit**:
  - Automatic image compression applied on mobile before upload to minimize quarry mobile data usage.

---

### FLOW-087: Operator Enters Materials Received Note (Aggregate/Ballast Tonnage)
* **User Role**: Operator
* **User Intention**: Record delivery of maintenance lubricants or haulage dispatch of quarry ballast.
* **UI Click Sequence**:
  1. On `/staff`, locate "Materials & Aggregates Handled" field (`id="input-materials-received"`).
  2. Type: `Received 20L Tellus S2 Hydraulic Oil for hydraulic top-up`.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Text input for consumable materials or aggregate tonnages.
* **Database Mapping & Mutations**:
  - Form state (`materialsReceived`).
* **Security & Privacy Audit**:
  - Sanitized text input.
* **UX & Logic Audit**:
  - Optional field; clear helper text guides operator on what to record.

---

### FLOW-088: Operator Uploads Delivery Note Voucher Photo
* **User Role**: Operator
* **User Intention**: Capture signed delivery note for the hydraulic oil received at the site.
* **UI Click Sequence**:
  1. Click `[📸 Upload Delivery Note / Voucher]` button (`id="upload-materials-voucher"`).
  2. Camera takes photo of the signed goods receipt voucher.
  3. Thumbnail renders: `Voucher Attached ✓`.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Thumbnail preview with date overlay.
* **Database Mapping & Mutations**:
  - Uploaded to storage bucket `delivery-vouchers`.
* **Security & Privacy Audit**:
  - Safe file upload verification.
* **UX & Logic Audit**:
  - Can view full-screen thumbnail check before final submit.

---

### FLOW-089: Operator Submits Daily Log and Receives Success Confirmation Card
* **User Role**: Operator
* **User Intention**: Finalize shift report and commit data to central dispatch ledger.
* **UI Click Sequence**:
  1. Review form summary checklist:
     - Machine: `Komatsu PC-200`
     - Start: `342.5 hrs` | End: `351.0 hrs` | Net: `8.5 hrs`
     - Fuel: `75.0 L (Receipt Attached)`
     - Description: `Excavated hard basalt rock...`
  2. Click orange button: `[Submit Daily Shift Log & Lock Record]` (`id="submit-daily-log-btn"`).
  3. Button displays loading spinner: `Securing Shift Ledger...`.
  4. Form successfully commits to PostgreSQL.
  5. Green Confirmation Banner renders: `Daily Log Successfully Logged to Fleet Ledger!`.
* **Routing & UI State**:
  - Route: `/staff`
  - Form State: `submittedLog` populated, form fields reset.
* **Elements & Contents Displayed**:
  - Success Banner with checkmark icon (`CheckCircle2`).
  - Shift Receipt ID: `#LOG-2026-9921`.
  - Machine hour meter updated notification: `Komatsu PC-200 hour meter updated to 351.0 hrs`.
* **Database Mapping & Mutations**:
  - `INSERT INTO public.staff_logs (staff_id, equipment_id, start_meter, end_meter, work_description, fuel_amount, fuel_proof_image, materials_received, materials_proof_image, date_submitted) VALUES (auth.uid(), '11111111-1111-1111-1111-111111111101', 342.5, 351.0, 'Excavated hard basalt rock at Quarry Face #3...', 75.0, '/uploads/fuel_receipt_001.jpg', 'Received 20L Tellus S2...', '/uploads/voucher_001.jpg', NOW()) RETURNING id;`
  - `UPDATE public.physical_assets SET current_hour_meter = 351.0, updated_at = NOW() WHERE id = '11111111-1111-1111-1111-111111111101';`
  - Database trigger `trg_evaluate_maintenance_limits` executes on `physical_assets` to evaluate service limits.
  - Tables Affected: `public.staff_logs` (Insert), `public.physical_assets` (Update).
* **Security & Privacy Audit**:
  - Protected by RLS: `Staff can insert logs and view own`.
  - Verified user ID bound via `auth.uid()`.
* **UX & Logic Audit**:
  - Provides immediate verification that the submission was recorded without network loss.

---

### FLOW-090: Operator Reviews Summary of the Submitted Log in Confirmation Banner
* **User Role**: Operator
* **User Intention**: Verify that all numbers entered were accurate before walking away from the machine.
* **UI Click Sequence**:
  1. On `/staff`, inspect the generated receipt card below the success banner.
  2. Details displayed:
     - `Asset: Komatsu PC-200 Heavy Excavator`
     - `Hours Billed: 8.5 Operating Hours`
     - `Fuel Added: 75.0 Litres`
     - `Logged By: Emanuel Kiprono`
     - `Timestamp: 06 Oct 2026, 17:45 EAT`
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Structured receipt card mimicking a physical quarry docket.
* **Database Mapping & Mutations**:
  - Reads returning row from insertion.
* **Security & Privacy Audit**:
  - View own submission.
* **UX & Logic Audit**:
  - Operator can screenshot receipt for personal work record.

---

### FLOW-091: Operator Resets Form to Submit a Second Shift Log for a Different Machine
* **User Role**: Operator
* **User Intention**: Submit a second log because the operator drove both an excavator and a tipper truck on the same day.
* **UI Click Sequence**:
  1. Under the submitted log banner, click button `[+ Log Another Machine / Shift]` (`id="btn-log-another-machine"`).
  2. Confirmation banner clears and fresh form displays.
  3. Select Machine: `Isuzu FVZ 34 Heavy Tipper Truck`.
  4. Start meter automatically populates: `512.8 hrs`.
* **Routing & UI State**:
  - Route: `/staff`
* **Elements & Contents Displayed**:
  - Clean form inputs ready for next entry.
* **Database Mapping & Mutations**:
  - Reads start meter for newly selected machine.
* **Security & Privacy Audit**:
  - Authenticated session preserved.
* **UX & Logic Audit**:
  - Retains operator profile info; only clears machine-specific fields.

---

### FLOW-092: Operator Switches to 'INQUIRIES' Tab to View Active Field Bookings
* **User Role**: Operator
* **User Intention**: Check which client site or quarry location their excavator is scheduled for tomorrow.
* **UI Click Sequence**:
  1. At top of `/staff`, click tab `[Assigned Inquiries & Bookings]` (`id="tab-operator-inquiries"`).
  2. View switches from LOG form to Inquiries list.
* **Routing & UI State**:
  - Route: `/staff?tab=INQUIRIES`
  - Component State: `activeTab = 'INQUIRIES'`.
* **Elements & Contents Displayed**:
  - Cards showing active field assignments:
    - Client: `Mutuma Roadworks Ltd`
    - Machine: `Komatsu PC-200 Heavy Excavator`
    - Booking Period: `10 Oct - 15 Oct 2026`
    - Job Site: `Nkubu Quarry, Meru`
    - Contact: `WhatsApp Client (+254 712 345678)`
* **Database Mapping & Mutations**:
  - `SELECT r.id, r.client_name, r.booking_period, r.status, r.notes, p.name as equipment_name, p.model FROM public.reservations r JOIN public.physical_assets p ON r.physical_asset_id = p.id WHERE r.status = 'CONFIRMED' ORDER BY r.booking_period ASC;`
  - Table: `public.reservations` (Read).
* **Security & Privacy Audit**:
  - Financial rates (`daily_rate`, `total_amount`) are HIDDEN from operators. Only job site details, machine model, and operational dates are displayed.
* **UX & Logic Audit**:
  - One-click button allows operator to open WhatsApp to message client site supervisor for directions.

---

### FLOW-093: Operator Navigates to Staff Profile Page
* **User Role**: Operator
* **User Intention**: Inspect their operator profile, registered driver permits, phone number, and account status.
* **UI Click Sequence**:
  1. In sidebar, click `Staff Profile & Permits` (`id="nav-staff-profile"`).
  2. Route navigates to `/staff/profile`.
  3. Profile card and certifications load.
* **Routing & UI State**:
  - Current Route: `/staff/profile`
  - Sidebar Nav: "Staff Profile & Permits" active.
* **Elements & Contents Displayed**:
  - Header: `OPERATOR PROFILE & CREDENTIALS`.
  - Back link: `[<- Back to Operator Log Form]`.
  - Operator Avatar with initials `EK`.
  - Name: `Emanuel Kiprono`.
  - Role: `Field Machinery Operator`.
  - Email: `ekiprono@hilosgeht.co.ke`.
  - Phone: `+254 719 882233`.
  - Certified Equipment Badges: `Komatsu PC-200 Certified`, `JCB Backhoe Certified`, `Class BCE Heavy Plant License`.
* **Database Mapping & Mutations**:
  - `SELECT id, full_name, email, phone_number, role, account_status FROM public.profiles WHERE id = auth.uid();`
  - Table: `public.profiles` (Read).
* **Security & Privacy Audit**:
  - Self-service read policy: `auth.uid() = id`. Cannot view other operators' profiles.
* **UX & Logic Audit**:
  - Highlighting safety compliance and license status.

---

### FLOW-094: Operator Views Personal Badge, Email, Phone, and Role Status
* **User Role**: Operator
* **User Intention**: Verify their contact phone number is updated for emergency quarry recall.
* **UI Click Sequence**:
  1. On `/staff/profile`, check contact card.
  2. Phone number displays: `+254 719 882233`.
  3. Status badge: `ACTIVE OPERATOR` (Green checkmark).
* **Routing & UI State**:
  - Route: `/staff/profile`
* **Elements & Contents Displayed**:
  - Read-only verified contact card.
  - Support contact notice: "To update your legal name or driving license, contact HLG Admin at hilosgehtinfo@gmail.com".
* **Database Mapping & Mutations**:
  - Profile read query.
* **Security & Privacy Audit**:
  - Zero sensitive hashes returned.
* **UX & Logic Audit**:
  - Clean card design with clear typography.

---

### FLOW-095: Operator Attempts to Access Unauthorized '/admin' Route and Receives 403 Guard
* **User Role**: Operator (Security Boundary Test)
* **User Intention**: Attempt to navigate directly to `/admin` or `/admin/financials` by typing URL into browser address bar.
* **UI Click Sequence**:
  1. Operator types `https://hilosgeht.co.ke/admin` into address bar.
  2. Next.js middleware and client page security guard evaluate `hlg_role` and JWT claims.
  3. Guard intercepts request.
  4. Screen displays Access Restriction Card:
     `"Access Restricted to Central Administrators"`
     `"System telemetry gateway settings, financial revenues, and fleet configurations are restricted to HLG Chief Administrators."`
  5. Provides primary button: `[Return to Operator Daily Log ->]`.
* **Routing & UI State**:
  - Route: `/admin` (Intercepted)
  - Intercept State: `role === 'OPERATOR'` renders Restriction View.
* **Elements & Contents Displayed**:
  - Red danger shield icon (`AlertTriangle`).
  - Clear, polite access denied explanation.
  - Safe navigation link back to `/staff`.
* **Database Mapping & Mutations**:
  - Blocked before database query execution.
* **Security & Privacy Audit**:
  - RLS and frontend guards ensure complete compartmentalization between Admin financial data and Operator field interfaces.
* **UX & Logic Audit**:
  - User is not left on a broken blank screen; clear guidance is given.

---

### FLOW-096: Operator Clicks 'Log Out' Button in Sidebar and Session is Cleared
* **User Role**: Operator
* **User Intention**: Securely end shift session on shared quarry tablet so the night operator can sign in.
* **UI Click Sequence**:
  1. In sidebar, locate bottom section: `Emanuel Kiprono (OPERATOR)`.
  2. Click `[Sign Out]` button with exit icon (`id="btn-operator-logout"`).
  3. Browser clears local storage keys `hlg_user` and `hlg_role`.
  4. Next.js router navigates to `/login`.
* **Routing & UI State**:
  - Source: `/staff`
  - Target: `/login`
  - Storage State: `localStorage.clear()` for session keys.
* **Elements & Contents Displayed**:
  - Login page loads with empty credential fields.
  - Toast message: `You have successfully logged out.`
* **Database Mapping & Mutations**:
  - Invalidates active JWT token session.
* **Security & Privacy Audit**:
  - Prevents subsequent users of shared device from accessing prior user's account.
* **UX & Logic Audit**:
  - Back button after logout will not restore protected dashboard state (redirects to `/login`).

---

### FLOW-097: Admin Attempts to Access Operator Log and Receives Administrative Header
* **User Role**: Admin
* **User Intention**: Dispatcher visits `/staff` or `/dashboard/operator/log` to submit a test log or record a shift on behalf of an offline driver.
* **UI Click Sequence**:
  1. Admin navigates to `/staff`.
  2. System detects `hlg_role = 'ADMIN'`.
  3. Page renders with administrative capability banner:
     `"Admin Override Mode: Logging shift as Central Dispatcher"`.
  4. Staff Member selector dropdown appears, allowing Admin to attribute the log to any registered operator.
* **Routing & UI State**:
  - Route: `/staff`
  - Admin State: Can select `staff_id` from dropdown.
* **Elements & Contents Displayed**:
  - Blue Admin Override Banner.
  - Operator attribution selector: `[Select Operator: Brian K. / Emanuel Kiprono]`.
* **Database Mapping & Mutations**:
  - `INSERT INTO public.staff_logs (staff_id, equipment_id, ...)` using chosen operator ID.
  - Tables: `public.staff_logs` (Insert).
* **Security & Privacy Audit**:
  - Admin full access policy `public.authorize('ADMIN')` permits cross-operator logging.
* **UX & Logic Audit**:
  - Prevents Admins from being locked out of field submission screens when assisting operators over the radio.

---

### FLOW-098: Unauthenticated User Attempts to Visit '/admin' and is Redirected to '/login'
* **User Role**: Anonymous Visitor / Attacker
* **User Intention**: Try to access private command dashboard without logging in.
* **UI Click Sequence**:
  1. Visitor opens browser and enters `https://hilosgeht.co.ke/admin`.
  2. Middleware checks for authentication token / session cookie.
  3. Missing session detected.
  4. User is redirected to `/login?redirect=/admin`.
* **Routing & UI State**:
  - Source: `/admin`
  - Target: `/login?redirect=/admin`
* **Elements & Contents Displayed**:
  - Login screen with notice: `Please sign in to access the Command Hub.`
* **Database Mapping & Mutations**:
  - Zero database access.
* **Security & Privacy Audit**:
  - Strict middleware route guarding on all `/admin/*` and `/staff/*` paths.
* **UX & Logic Audit**:
  - Once signed in, user is automatically returned to their originally requested URL (`/admin`).

---

### FLOW-099: User Submits Invalid Credentials on '/login' and Sees Clear Error Toast
* **User Role**: Operator or Admin
* **User Intention**: User accidentally enters wrong password.
* **UI Click Sequence**:
  1. On `/login`, enter username `AdminHLG`.
  2. Enter password `WrongPassword123`.
  3. Click `[Sign In to Command Hub]`.
  4. Form shakes subtly with error animation.
  5. Alert message renders:
     `"Invalid Credentials: Username or password does not match HLG records. For assistance, contact Dispatch at 0717 186396."`
* **Routing & UI State**:
  - Route: `/login`
  - Error State: `error = 'Invalid credentials'`.
* **Elements & Contents Displayed**:
  - Red error container with warning icon (`AlertCircle`).
  - Password field cleared; username retained.
* **Database Mapping & Mutations**:
  - Failed authentication attempt.
* **Security & Privacy Audit**:
  - Generic error message does not disclose whether the username or password specifically was incorrect (prevents user enumeration).
  - Rate limiting protects against brute force attacks.
* **UX & Logic Audit**:
  - Focus auto-restores to password field so user can retype immediately.

---

### FLOW-100: Admin Triggers Manual Cache Refresh on Dashboard Metrics Header
* **User Role**: Admin (Chief Dispatcher)
* **User Intention**: Force an immediate live refresh of fleet GPS meters, inquiries, and quarry logs without doing a full browser page reload.
* **UI Click Sequence**:
  1. On `/admin`, locate the `[Refresh Live Data]` button in top header (`id="btn-refresh-dashboard"`).
  2. Click button.
  3. Refresh icon spins (`animate-spin`).
  4. System executes parallel API re-fetch:
     - `/api/v1/analytics/overview`
     - `/api/v1/analytics/ai-insights`
     - `/api/v1/equipment`
     - `/api/v1/inquiries`
  5. KPI numbers pulse gently with new values.
  6. Toast displays: `Fleet telematics and dispatch ledger refreshed (0.2s)`.
* **Routing & UI State**:
  - Route: `/admin`
* **Elements & Contents Displayed**:
  - Spinning refresh indicator.
  - Live timestamp update: `Last sync: 13:25:00 EAT (Live)`.
* **Database Mapping & Mutations**:
  - Executes fresh `SELECT` queries across core tables.
* **Security & Privacy Audit**:
  - Authenticated Admin read request.
* **UX & Logic Audit**:
  - Non-blocking asynchronous update preserves user scroll position and active view state.
