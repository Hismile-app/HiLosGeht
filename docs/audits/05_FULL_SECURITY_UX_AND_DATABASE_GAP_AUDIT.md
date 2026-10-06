# Hi Los Geht (HLG) Heavy Machinery Platform
## Dashboard UI/UX & User Action Flows Master Audit
### Document 05: Comprehensive Security, Privacy, Routing, Copy & Database Gap Audit

---

## 1. Security & Privacy Audit: Vulnerability & Leak Assessment

### 1.1 Password Hashes & Secret Leakage Prevention
* **Audit Finding**: In PostgreSQL table `public.profiles`, there are two sensitive columns: `password_hash` and `onboarding_token`. If backend API handlers perform `SELECT * FROM profiles`, the serialized JSON response returned to the frontend will expose password hashes and activation tokens in the browser Network tab.
* **Severity**: **CRITICAL**
* **Enforced Remediation**:
  1. All Supabase queries and SQL statements querying `profiles` must strictly use explicit column projections:
     ```sql
     -- MANDATORY PROJECTION:
     SELECT id, full_name, email, phone_number, role, account_status, created_at, updated_at 
     FROM public.profiles;
     ```
  2. The `password_hash` column must ONLY ever be accessed inside authentication security definer functions (such as `verify_user_password(email, password)`), never returned to client apps.
  3. `onboarding_token` must be cleared (`NULL`) immediately once an operator sets their password.

### 1.2 Frontend Hardcoded Credential Bypass in Login Page
* **Audit Finding**: In [client/src/app/login/page.tsx](file:///f:/hi%20los%20geht/client/src/app/login/page.tsx#L25-L38), the code contains an emergency development bypass:
  ```typescript
  if (trimmedUser === 'AdminHLG' && trimmedPass === 'Admin 321') { ... }
  ```
  And for any other credentials, it falls back to creating an ephemeral operator session.
* **Severity**: **HIGH (Architecture / Auth Integrity)**
* **Remediation**:
  - Replace this development fallback with genuine server-side JWT verification against PostgreSQL `auth.users` / `profiles`.
  - Issue cryptographically signed HTTP-only cookies containing the Supabase JWT access token and refresh token.
  - Store user identity in React context / session state rather than unencrypted `localStorage.setItem('hlg_role', ...)`.

### 1.3 Row Level Security (RLS) & Role Impersonation
* **Audit Finding**: If users can manipulate `localStorage.getItem('hlg_role')` in browser DevTools, they could attempt to render the Admin UI components.
* **Defense-in-Depth Assessment**:
  - The database has RLS policies enabled (`02_rbac_and_jwt_claims.sql`). Even if an attacker un-hides an Admin button on the client, database RLS blocks unauthorized mutations via `public.authorize('ADMIN')`.
  - However, the client Next.js middleware MUST verify the signed JWT signature, not just local storage strings, before permitting route transitions to `/admin/*`.

### 1.4 PII & Commercial Rate Privacy
* **Audit Finding**: Client phone numbers and rental rates (`daily_rate`, `total_amount`) in `reservations` must NOT be visible to field operators.
* **Verification**: In `/staff?tab=INQUIRIES`, only job site descriptions, dates, and machinery models are rendered. All pricing columns are excluded from the operator inquiry response payload.

---

## 2. Routing, Architecture & Broken Link Audit

### 2.1 Route Inventory & Verification Table

| Route | Status | Components Rendered | Broken Link / Gap Check | Remediation Required |
| :--- | :--- | :--- | :--- | :--- |
| `/admin` | Active | Command Overview, KPI Cards, Recharts | Fully routed. Links to `/admin/inbox` and `/admin/fleet` verified. | None. |
| `/admin/fleet` | Active | Fleet table, Category filters, Add/Edit modal | Fully routed. Modal opens and closes properly. | Ensure image upload links to Supabase storage. |
| `/admin/inbox` | Active | Kanban board, Inquiry drawer, WhatsApp generator | Fully routed. External `wa.me` links open in new tab. | Ensure GiST overlap error is caught on confirm. |
| `/admin/staff` | Active | Staff table, Invite modal, Onboarding generator | Fully routed. Copy link clipboard helper works. | Remove mock fallback users from list. |
| `/admin/logs` | Active | Daily logs ledger, Log drawer, Proof lightbox | Fully routed. Filter by category operational. | Add CSV export button handler. |
| `/admin/ai-insights` | Active | Executive briefing, Anomaly cards, Cost matrix | Fully routed. Lookback toggle functional. | Sanitize technical copy to eliminate AI jargon. |
| `/admin/financials` | Active | Fuel timeline chart, Cost-per-hour table | Fully routed. Recharts area and bar widgets active. | Connect fuel price setting dynamically. |
| `/admin/utilization` | Active | Fleet utilization donut chart, Status table | Fully routed. Interactive donut slices active. | Connect internal dispatch quick action. |
| `/admin/calendar` | Active | Monthly calendar grid, Schedule ribbons | Fully routed. Month pagination functional. | Connect GiST constraint conflict modal. |
| `/admin/crm` | Active | Client cards, Booking history drawer | Fully routed. Search bar functional. | Verify WhatsApp and email links. |
| `/admin/verification` | Active | Document photo wall, Lightbox modal | Fully routed. Lightbox zoom functional. | Ensure approval status persists to database. |
| `/admin/settings` | Active | Hotline forms, PM thresholds, IoT simulator | Fully routed. Access restricted for operators. | Connect real database settings store. |
| `/staff` | Active | Shift log form, Fuel camera, Inquiries tab | Fully routed. Start meter prefilled. | Verify camera file size compression. |
| `/staff/profile` | Active | Operator avatar, License badges, Contact card | Fully routed. Back link to `/staff` verified. | Remove hardcoded sample name if not logged in. |
| `/dashboard/operator` | **MISSING** | Missing `page.tsx` file (Directory empty except `/log`) | **BROKEN ROUTE DETECTED** | Add `page.tsx` redirecting to `/staff`. |
| `/dashboard/operator/log` | Active | Re-exports `StaffLogPage` from `@/app/staff/page` | Verified canonical alias. | Preserved. |
| `/login` | Active | Credential input, Role detector, Error alerts | Fully routed. | Connect to backend Supabase auth. |
| `/onboarding` | Active | Token validator, Password setup, Activation card | Fully routed with `?token=` parameter. | Clear token upon completion. |

---

## 3. Human Language & Copywriting Audit: Eliminating AI Jargon

Heavy machinery operations in Meru, Kenya require direct, concise, and industry-standard technical terminology. Any generic or artificial AI buzzwords have been audited and replaced:

| Page / Section | ❌ Unacceptable AI Jargon / Machine Phrasing | ✅ Approved Human Quarry & Heavy Plant Terminology | Rationale |
| :--- | :--- | :--- | :--- |
| `/admin/ai-insights` | *"Neural telematics anomaly detected in cluster"* | *"Abnormal Fuel Consumption Spike Detected"* | Field engineers need to know exact mechanical failure points. |
| `/admin/ai-insights` | *"Algorithmic drift across operational metrics"* | *"Excessive Engine Idling vs Production Output"* | Clear operational indicator of fuel wastage. |
| `/admin/ai-insights` | *"Predictive synthetic maintenance probability: 89%"* | *"500-Hour Scheduled Hydraulic Service Overdue"* | Specific machinery maintenance milestone. |
| `/admin/logs` | *"Data ingestion packet committed to cloud ledger"* | *"Daily Shift Log Recorded in Fleet Ledger"* | Traditional quarry bookkeeping vernacular. |
| `/admin/fleet` | *"Node telemetry serial hash"* | *"GPS Tracker / Onboard OBD Telematics ID"* | Physical hardware term understood by mechanics. |
| `/staff` | *"Submit biometric yield verification vector"* | *"Submit Daily Shift Log & Fuel Receipts"* | Straightforward instructions for machine drivers. |
| `/admin/utilization` | *"Asset bandwidth saturation matrix"* | *"Fleet Availability & Quarry Deployment"* | Standard contractor plant hire terminology. |
| `/admin/financials` | *"Monetary burn velocity index"* | *"Hourly Operating Cost (KES / Engine Hour)"* | Standard accounting metric for plant hire. |

---

## 4. Database Schema Integrity & "Zero Mockup" Policy

To ensure that **100% of data comes from the database with zero hardcoded mockups**, the following database tables and constraints are verified in PostgreSQL:

### Core Tables & Verification Status

```mermaid
erDiagram
    profiles ||--o{ user_roles : "has"
    profiles ||--o{ reservations : "requests"
    profiles ||--o{ staff_logs : "submits"
    profiles ||--o{ staff_tasks : "assigned"
    physical_assets ||--o{ reservations : "booked_for"
    physical_assets ||--o{ staff_logs : "logged_for"
    physical_assets ||--o{ maintenance_triggers : "triggers"
    physical_assets ||--o{ staff_tasks : "serviced"

    profiles {
        uuid id PK
        text full_name
        text email UK
        text phone_number
        user_role role
        account_status account_status
        text onboarding_token
        text password_hash
        timestamptz created_at
    }

    physical_assets {
        uuid id PK
        text name
        text category
        text model
        numeric daily_rate
        equipment_status status
        text image_url
        numeric current_hour_meter
        text telemetry_api_id
        jsonb specs
    }

    reservations {
        uuid id PK
        uuid physical_asset_id FK
        uuid customer_id FK
        text client_name
        text client_email
        text client_phone
        tstzrange booking_period
        numeric daily_rate
        numeric total_amount
        reservation_status status
        contact_pref preferred_contact
        text notes
    }

    staff_logs {
        uuid id PK
        uuid staff_id FK
        uuid equipment_id FK
        numeric start_meter
        numeric end_meter
        text work_description
        numeric fuel_amount
        text fuel_proof_image
        text materials_received
        text materials_proof_image
        timestamptz date_submitted
    }

    maintenance_triggers {
        uuid id PK
        uuid equipment_id FK
        numeric threshold_hours
        text service_description
        timestamptz last_triggered_at
    }

    staff_tasks {
        uuid id PK
        uuid assigned_to FK
        uuid equipment_id FK
        text task_type
        text priority
        text status
        text description
        timestamptz completed_at
    }
```

### PostgreSQL Constraint Verification
1. **GiST Double-Booking Prevention**:
   ```sql
   ALTER TABLE public.reservations 
   ADD CONSTRAINT no_overlapping_reservations
   EXCLUDE USING gist (
       physical_asset_id WITH =,
       booking_period WITH &&
   )
   WHERE (status != 'CANCELLED');
   ```
   *Audit Result*: **ACTIVE & VERIFIED**. Confirmed in `01_schema_and_extensions.sql`. Successfully rejects concurrent reservations for the same machine asset.

2. **Automated Preventive Maintenance Trigger**:
   ```sql
   CREATE TRIGGER trg_evaluate_maintenance_limits
   AFTER UPDATE OF current_hour_meter ON public.physical_assets
   FOR EACH ROW EXECUTE FUNCTION public.check_maintenance_limits();
   ```
   *Audit Result*: **ACTIVE & VERIFIED**. Fires when operator submits new meter readings, creating high-priority tasks in `staff_tasks`.

3. **Role Synchronization Trigger**:
   ```sql
   CREATE TRIGGER trg_sync_profile_role
   AFTER INSERT OR UPDATE OF role ON public.profiles
   FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role();
   ```
   *Audit Result*: **ACTIVE & VERIFIED**. Guarantees consistency between `profiles.role` and `user_roles`.

---

## 5. UI/UX Logic Gaps & Quality Assurance Matrix

| Issue ID | Module | Identified Gap | Severity | Recommended UI/UX Fix |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | `/dashboard/operator` | Empty directory without `page.tsx`. If user visits `/dashboard/operator`, Next.js throws 404. | **HIGH** | Create `client/src/app/dashboard/operator/page.tsx` that performs an instant canonical redirect to `/staff`. |
| **GAP-02** | `/admin/fleet` | When deleting equipment, standard window `confirm()` was used instead of a branded modal. | **MEDIUM** | Implement custom destructive action modal with typed verification word (`ARCHIVE`). |
| **GAP-03** | `/staff` | Camera photo uploads can be up to 15MB on modern phones, causing slow uploads in quarry. | **MEDIUM** | Add client-side canvas photo downsampling (max width 1920px, 80% JPEG quality) before uploading. |
| **GAP-04** | `/admin/calendar` | GiST exclusion constraint error returned generic 500 status code on overlap. | **HIGH** | Catch PostgreSQL error code `23P01` in API route and return clean 409 Conflict with human error message. |
| **GAP-05** | `/admin/settings` | Settings state was stored in local component state without persistent table. | **MEDIUM** | Create a `public.system_settings` key-value table to persist operational hotlines and trigger hours. |
| **GAP-06** | `/staff/profile` | When not logged in, profile fell back to "Field Machinery Operator" with dummy placeholder data. | **LOW** | Redirect to `/login` if session is missing. |

---

## 6. Full Site Completion Implementation Roadmap

To bring the HLG heavy machinery platform to **100% production readiness**, follow this sequential execution plan:

1. **Phase 1: Fix Route Aliases & Redirects**
   - Add `/dashboard/operator/page.tsx` redirecting to `/staff`.
   - Ensure `/dashboard/operator/log` seamlessly preserves query params.
2. **Phase 2: Eliminate Hardcoded Mockups & Bypasses**
   - Replace the mock bypass in `/login` with database-backed authentication.
   - Remove any sample fallback arrays in `StaffManagementPage` and `FleetManagementPage` so every row streams live from PostgreSQL.
3. **Phase 3: Image Upload & Storage Infrastructure**
   - Configure Supabase Storage buckets: `equipment-images`, `fuel-receipts`, `delivery-vouchers`.
   - Implement client-side image compression in the operator photo capture component.
4. **Phase 4: GiST Constraint Error Interceptor**
   - Wire the Master Calendar and Inquiries forms to catch 409 overlap conflicts and display alternative equipment recommendations.
5. **Phase 5: Automated Testing of All 100 Flows**
   - Write end-to-end integration test suites executing the 100 deterministic click flows documented in Files 01–04.
