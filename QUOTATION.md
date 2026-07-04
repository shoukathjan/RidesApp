# Project Quotation — UseMe Ride-Hailing Platform

**Quotation No:** UM-Q-2026-001
**Date:** 26 June 2026
**Valid Until:** 26 July 2026 (30 days)

**From:** [Your Company Name]
[Address] · [Phone] · [Email] · [GSTIN]

**To:** [Client Name]
[Client Company] · [Address]

---

## 1. Overview

Development of **UseMe**, a status-based ride-hailing platform consisting of three applications backed by a shared real-time server:

- **Customer App** (Android/iOS) — book scheduled rides, live booking-status updates.
- **Driver App** (Android/iOS) — registration, subscriptions, nearby ride requests, navigation.
- **Admin Website** — driver approvals, subscription & fare management, dashboard.

A common **Backend** (REST API + Socket.IO real-time server + database + payment/storage integrations) powers all three and is **included** in the pricing below.

---

## 2. Pricing

| # | Deliverable | Amount (INR) |
|---|-------------|-------------:|
| 1 | Customer Mobile App (React Native) | 2,50,000 |
| 2 | Driver Mobile App (React Native) | 2,50,000 |
| 3 | Admin Website (React) | 60,000 |
| 4 | Backend — API, Socket.IO, Database, Razorpay & Storage integration | Included |
| | **Subtotal** | **5,60,000** |
| | GST @ 18% | 0 |
| | **Total Payable** | **5,60,000** |

> GST is shown at 18% with a NIL amount for now and will be applied as applicable at the time of invoicing.

**Total in words:** Rupees Five Lakh Sixty Thousand Only.

---

## 3. Payment Terms

- **50% Advance** — ₹2,80,000 — payable on confirmation, to commence work.
- **50% on Delivery** — ₹2,80,000 — payable on final delivery and handover.

---

## 4. What's Included

**Customer App**
- Phone/OTP login, Home, Search Pickup & Destination (current-location based)
- Vehicle selection (Auto / Bike / Car / Truck), scheduled pickup time, fare estimate
- Book ride, live booking-status updates via Socket.IO, ride history, profile, notifications

**Driver App**
- Phone/OTP login, registration with document upload, approval flow
- Subscription purchase (Razorpay) per vehicle type, dashboard, go online/offline
- Nearby ride requests (radius-based), accept/reject, start/complete, Google Maps navigation
- Ride history, earnings, profile

**Admin Website**
- Admin login & dashboard
- Driver approvals (document review), subscription plan & fare-rate management
- Subscriptions overview, global settings (request radius)

**Backend (included)**
- REST API, Socket.IO real-time booking events
- Database, authentication, Razorpay payment & cloud storage integration

---

## 5. Not Included (Third-Party / Client-Borne Costs)

The following are billed directly by their providers and are **not** part of this quotation:

- Razorpay transaction/gateway fees
- Cloud hosting & storage (e.g. AWS/S3) charges
- SMS/OTP gateway charges (e.g. MSG91/Twilio)
- Google Maps / Places API usage (if enabled later)
- Apple Developer (₹/yr) & Google Play Console (one-time) account fees
- Domain, SSL, and email services

---

## 6. Scope Boundaries

This platform provides **status-based updates only**. It does **not** include embedded maps, live driver-location tracking, polyline/route rendering, or continuous-ETA features. Driver navigation opens the installed Google Maps app.

Any feature outside the agreed scope will be quoted separately as a change request.

---

## 7. Acceptance

Kindly confirm acceptance by signing below or replying via email.

**For [Your Company Name]**          **Accepted by [Client Name]**

_______________________              _______________________
Name / Signature / Date               Name / Signature / Date
