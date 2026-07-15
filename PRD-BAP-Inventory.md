# PRD — Consumable Materials (BAP) Inventory System for the Bench Work Lab

**Politeknik Negeri Bengkalis**

| Field | Value |
|---|---|
| Product Name | SI-BAP (Consumable Materials Inventory System) |
| Document Version | 1.1 |
| Date | 15 July 2026 |
| Product Owner | Abiyyu RZ |
| Unit | Bench Work Lab, Politeknik Negeri Bengkalis |
| Status | Draft ready for implementation (tool-agnostic) |

> This document is written to be **tool-agnostic**. It can be handed to any AI coding assistant (Claude Code, Cursor, Lovable, Bolt, v0, GitHub Copilot) or to a human development team. The technology stack in Section 10 is a recommendation, not a hard requirement. The data model, roles, features, and business rules are the parts that must stay constant regardless of the tools you choose.

---

## 1. Executive Summary

SI-BAP is a web application for recording, managing, and monitoring the inventory of consumable materials (Bahan Habis Pakai / BAP) and equipment in the Bench Work Lab at Politeknik Negeri Bengkalis. Materials and equipment are currently tracked manually, which makes it hard to know remaining stock, the usage history per practical session, and when materials should be reordered. The application provides centralized recording, tracking of incoming and outgoing stock, low-stock warnings, usage history per semester, and a summary dashboard. It has two user roles, admin and user, with a login page as the entry gate.

## 2. Background and Problem

The Bench Work Lab uses consumable materials such as drill bits, sandpaper, and electrodes whose quantity decreases every time a practical session is held. Without a digital recording system, several problems arise. Managers do not know the accurate remaining stock, so materials often run out unexpectedly during a session. There is no history that links material usage with a specific semester, equipment, and practical hours. Usage reports for procurement requests are hard to produce because the data is scattered. SI-BAP is designed to solve these problems with a single database that admins and users can access according to their permissions.

## 3. Goals and Success Metrics

The primary goal is to provide accurate and auditable BAP inventory records, to speed up the material usage request process for users, and to give early warnings when stock is low. Success is measured by several indicators. Every material and piece of equipment in the lab is recorded in the system, with remaining stock updated automatically on each transaction. The time to produce a per-semester usage report drops from hours to minutes through the export feature. Materials no longer run out undetected because of the minimum-stock warning. Every usage is recorded completely, including the user, date, semester, related equipment, and practical hours.

## 4. Scope

### 4.1 In Scope

The application covers login authentication for two roles, management of master data for consumable materials and equipment, tracking of incoming and outgoing stock with automatic remaining-stock calculation, material usage requests by users with an admin approval flow, low-stock warnings, usage history per practical session and per semester, a summary dashboard, and report export to PDF and Excel.

### 4.2 Out of Scope (for version 1.0)

Version 1.0 does not include integration with the campus academic system, automatic purchasing or procurement to vendors, a native mobile application, physical barcode or QR scanning, and notifications via email or WhatsApp. These are recorded as candidates for future development in the roadmap section.

## 5. User Roles and Permissions

The system has two roles. The **admin** is the lab manager or technician who is fully responsible for the data. An admin can add, edit, and delete material and equipment data, record incoming stock, approve or reject usage requests from users, set minimum stock thresholds, manage user accounts, view all history, access the dashboard, and export reports.

The **user** is a student, lecturer, or teaching assistant who uses the materials. A user can view and search all inventory data, submit material usage requests that then await admin approval, view the status and history of their own requests, and export reports. A user cannot modify master data or approve requests.

The following permission matrix summarizes the authority of each role.

| Feature | User | Admin |
|---|---|---|
| Login and logout | Yes | Yes |
| View and search inventory data | Yes | Yes |
| Add / edit / delete material and equipment | No | Yes |
| Record incoming stock | No | Yes |
| Request material usage (outgoing stock) | Yes (needs approval) | Yes (direct) |
| Approve / reject usage requests | No | Yes |
| Set minimum stock threshold | No | Yes |
| View low-stock warnings | Yes (read only) | Yes |
| View usage history | Own history | All |
| Summary dashboard | Yes (condensed) | Yes (full) |
| Manage user accounts | No | Yes |
| Export reports PDF / Excel | Yes | Yes |

## 6. Functional Requirements

### 6.1 Authentication and Account Management

The application provides a login page with email and password. After a successful login, the system redirects the user to a page matching their role. The admin can create new user accounts, change roles, reset passwords, and deactivate accounts. Login sessions must be secure and expire automatically after a period of inactivity. Admin routes must be protected on the server side so that a regular user cannot access them even if they know the URL.

### 6.2 Master Data Management

The admin manages two master entities: consumable materials and equipment. Each material record contains a sequence number, material name, related equipment, semester, practical hours, quality, unit, current stock, and minimum stock threshold. Records can be added through a form, edited, and deleted. The system validates that required fields are not empty and that numeric values are not negative.

### 6.3 Incoming and Outgoing Stock Tracking

Every transaction updates the remaining stock automatically. Incoming stock is recorded by the admin when materials are added, for example a new purchase, capturing the quantity and date. Outgoing stock occurs when a usage request is approved, and the remaining stock decreases by the used amount. The system stores each transaction as an immutable history record; corrections are made through an adjustment transaction rather than by editing figures, so the audit trail stays intact.

### 6.4 Usage Requests by Users

A user fills out a usage request form containing the material used, quantity, equipment, semester, practical hours, and the practical date. A request has a status of pending, approved, or rejected. The admin views the list of pending requests, then approves or rejects them with an optional note. On approval, the material stock decreases automatically and the transaction is recorded in the history. If stock is insufficient, the system prevents approval and shows a warning.

### 6.5 Low-Stock Warnings

The admin sets a minimum threshold for each material. When the remaining stock reaches or falls below that threshold, the material is flagged as critical stock. The system shows a visual warning on the dashboard and in the inventory list, and provides a dedicated list of materials that need to be reordered soon.

### 6.6 Usage History per Practical Session

The system keeps a complete log of every usage, containing who used it, which material, the quantity, equipment, semester, practical hours, and date. History can be filtered by date range, semester, material, or user. This history is the basis for usage reports and per-semester material demand analysis.

### 6.7 Summary Dashboard

The dashboard shows key indicators at a glance, including the total number of material types, the number of materials with critical stock, total usage in the current period, and the number of requests awaiting approval. It also presents a chart of material usage per semester and a list of the most frequently used materials. The user version shows the relevant summary without sensitive management data.

### 6.8 Search, Filter, and Export

All lists support text search and filtering by important columns such as semester, quality, and stock status. Both inventory data and usage reports can be exported to PDF for archiving and to Excel for further processing.

## 7. Data Model

The structure follows the requested fields and is extended where needed so that stock tracking works. The following are the main tables. Types are written generically (uuid, text, integer, numeric, enum, timestamp) so they map cleanly onto any relational database such as PostgreSQL, MySQL, or SQLite.

### 7.1 Table `users`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Full name |
| email | text | Unique, used for login |
| role | enum | `admin` or `user` |
| is_active | boolean | Account active status |
| created_at | timestamp | Creation time |

### 7.2 Table `equipment`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| equipment_name | text | Equipment name |
| description | text | Optional description |
| created_at | timestamp | Creation time |

### 7.3 Table `materials` (consumable materials / BAP)

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| no | serial / integer | Display sequence number |
| material_name | text | Consumable material name |
| equipment_id | uuid | Relation to `equipment` |
| semester | integer | Semester of use |
| practical_hours | numeric | Related practical hours |
| quality | enum | e.g. `good`, `fair`, `poor` |
| unit | text | e.g. piece, sheet, meter, kg |
| stock | numeric | Current remaining stock |
| min_stock | numeric | Low-stock warning threshold |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### 7.4 Table `stock_transactions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| material_id | uuid | Relation to `materials` |
| type | enum | `in`, `out`, `adjustment` |
| quantity | numeric | Stock movement amount |
| date | date | Transaction date |
| recorded_by | uuid | Relation to `users` |
| note | text | Optional note |
| created_at | timestamp | Creation time |

### 7.5 Table `usage_requests`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| material_id | uuid | Relation to `materials` |
| equipment_id | uuid | Relation to `equipment` |
| user_id | uuid | Requester (relation to `users`) |
| quantity | numeric | Requested amount |
| semester | integer | Practical semester |
| practical_hours | numeric | Practical hours |
| practical_date | date | Date of the practical session |
| status | enum | `pending`, `approved`, `rejected` |
| admin_note | text | Admin reason or note |
| processed_by | uuid | Admin who processed it |
| created_at | timestamp | Request time |

Relationships are as follows. One equipment relates to many materials. One material relates to many stock transactions and many usage requests. One user relates to many requests and many transactions. The stock value on the `materials` table is updated automatically from the accumulation of stock transactions.

## 8. Main User Flows

The login flow starts with the user opening the app, entering email and password, and the system verifying and redirecting to a dashboard matching their role. The admin adds a material by opening the master data menu, filling in the material form, saving, and the material appears in the list with an initial stock. A user submits a usage request by searching for a material, opening the request form, filling in the quantity and session details, and sending a pending request. The admin processes a request from the pending list, checks stock availability, approves or rejects it, and if approved the stock decreases and the history is recorded. The export flow starts from a list or report page, selecting filters, pressing the export button, and the system produces a PDF or Excel file.

## 9. Non-Functional Requirements

The application must be responsive and accessible from both desktop and mobile browsers, since sessions take place in the lab. Main page load time should be under three seconds on the campus connection. Data must be secure, with hashed passwords and role-based access enforced on the server side, not only in the interface. The interface uses clear and consistent language. The system must maintain stock integrity so that negative stock cannot arise from concurrent transactions. The database should be backed up periodically.

## 10. Recommended Architecture and Technology

Because you want this to stay flexible and not be tied to a single build tool, the stack below is a **recommendation with alternatives**, not a requirement. Any of these paths satisfies the requirements above.

The recommended default is a JavaScript full-stack: a React-based framework such as Next.js (App Router) with TypeScript for both pages and API, Tailwind CSS with a component library such as shadcn/ui for a clean interface, and a managed backend such as Supabase that provides PostgreSQL, authentication, and row-level security in one free tier. PDF export can use jsPDF or react-pdf, Excel export can use SheetJS, and dashboard charts can use Recharts. Deployment can target Vercel, Netlify, or Railway, all of which offer free tiers.

A common alternative for campus environments is a PHP stack: Laravel with MySQL, deployable on shared hosting or cPanel. Another alternative is a decoupled setup with a React or Vue frontend and a separate Node/Express or Python (Django/FastAPI) backend with any SQL database.

Whatever stack you pick, keep these constants: the data model in Section 7, the permission matrix in Section 5, role-based access enforced on the server, and the stock-integrity rules in Section 12. Because the data model uses generic types, migrating between stacks later does not require redesigning it.

## 11. Page Structure

The application consists of the following pages: a login page as the entry gate; a dashboard as the main page after login; a consumable materials list with search, filter, and an export button; a material detail and form page for the admin; an equipment list with its form for the admin; a usage request page for users to create and track requests; a request approval page for the admin; a usage history page with filtering and export; a critical stock warning page; a user management page for the admin; and a profile page to change account data and password.

## 12. Key Business Rules

The system enforces several rules to keep data consistent. Stock must never be negative, so a request that exceeds available stock cannot be approved. Only admins can modify master data and approve requests. Every stock change must go through a recorded transaction; stock figures must not be edited directly. A request that has already been approved or rejected cannot be changed again, only reversed through an adjustment transaction by an admin. The material sequence number is unique and continuous.

## 13. Acceptance Criteria

The product is considered complete for version 1.0 when a user can log in and be routed by role; the admin can fully manage material and equipment data; stock decreases automatically when a request is approved and increases when incoming stock is recorded; materials below the minimum threshold appear as warnings; a user can submit a usage request and track its status; usage history is stored and filterable; the dashboard shows correct indicators and charts; and reports can be exported to PDF and Excel. All admin routes must be inaccessible to regular users.

## 14. Future Development Roadmap

Once version 1.0 is stable, future work can include QR or barcode scanning to speed up input, email or WhatsApp notifications when stock is critical, integration with the academic practical schedule, a procurement module linking critical stock to a purchasing process, and a mobile app for recording directly on the lab floor.

## 15. Implementation Notes (Tool-Agnostic)

Build the application according to this document. Start by setting up the database schema in Section 7, together with role-based access control that distinguishes admin and user per the matrix in Section 5. Then implement authentication, and build features in order following Section 6: master data, stock tracking, usage requests, low-stock warnings, history, dashboard, and export. Use clear, consistent labels throughout the interface; the app may be presented in Indonesian or English depending on the audience. Ensure every stock change goes through a recorded transaction and that stock is never negative. Include seed data for testing, at minimum a few pieces of equipment, ten materials, and several transactions. Create one admin account and one user account for initial testing.

If you are using an AI coding assistant, feed it this document section by section rather than all at once, and verify each module works before moving to the next.
