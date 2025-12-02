# Feature Roadmap for SwiftServiceCRM

This document captures the next set of capabilities requested for the CRM. Each section lists outcomes, suggested data model updates, and UI/API work so changes can be implemented iteratively without disrupting the existing dashboards.

## Lead & Pipeline Management
- Add a `leads` table with contact info, source, status (New → Contacted → Qualified → Won/Lost), and follow-up reminders.
- Build a Leads page with Kanban and list views plus bulk actions (assign owner, move stage, add tasks).
- Auto-convert Won leads into customers/jobs and link historical activity to the new records.
- Add follow-up sequences (email/SMS) and a tasks sidebar so reps can log calls and schedule reminders.

## Quotes → Invoices → Payments
- Introduce `invoices` linked to jobs/quotes with statuses (Draft, Sent, Partially Paid, Paid, Overdue) and line items.
- Generate invoices from approved quotes; support online approvals with e-signatures and customer-facing links.
- Connect to payment providers (Stripe/Square) to capture card payments and reconcile them as `transactions`.
- Add aging views (current, 30/60/90) and payment history on the Finances page.

## Advanced Scheduling & Field Operations
- Extend jobs with crew assignments, time windows, route order, and GPS-friendly addresses.
- Add recurring jobs and templates for common services to accelerate scheduling.
- Support job checklists, photo uploads, time tracking, and customer signatures for mobile crews.
- Optimize routes daily and surface drive-time estimates on the Schedule page.

## Customer Experience
- Launch a secure customer portal tied to `customers` that exposes quotes, invoices, job status, and rebooking.
- Add post-job satisfaction surveys/NPS and store results on the customer record for retention scoring.
- Provide a self-service scheduling flow with preferred windows and upsell prompts.

## Analytics & Finances
- Build profitability dashboards combining revenue from jobs/quotes with expenses from `transactions` and COGS categories.
- Add budget vs. actuals, cash-flow forecasting, and margin by job type/crew.
- Create dashboards for quote conversion rate, pipeline velocity, schedule utilization, and churn risk.

## Automation & Integrations
- Add webhooks/Zapier connectors for new leads, quote approvals, job status changes, and payments.
- Offer template libraries for quotes/services with guardrails for pricing consistency.
- Add calendar sync for crews and reminder emails/SMS for customers.

## Security & Team Workflows
- Extend `users` with roles/permissions (admin, dispatcher, field tech) and enforce role-based access in the UI/API.
- Add MFA and audit logging for sensitive actions (payments, data exports, role changes).
- Provide organization-level settings for branding, portal domains, and notification rules.

## Suggested Delivery Order
1. **Leads foundation**: schema + basic Kanban/list UI + conversion into customers/jobs.
2. **Invoice/payments**: schema, quote-to-invoice flow, payment capture, and finance aging views.
3. **Field ops**: crew assignments, recurring jobs, checklists, photos, signatures, and routing data.
4. **Customer portal**: authentication, read-only views for quotes/invoices/jobs, and approvals/payments.
5. **Analytics**: profitability and pipeline dashboards with export options.
6. **Automation/security**: webhooks, templates, calendar sync, roles/permissions, MFA, and audit logs.
