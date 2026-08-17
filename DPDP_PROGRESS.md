# DPDP Act 2023 Compliance Implementation Progress

**Project:** S.S. Pharmacy Admin Portal  
**Branch:** `compliance/dpdp`  
**Start Date:** August 18, 2026  
**Compliance Deadline:** May 13, 2027 (Full DPDP Rules 2025 Enforcement)

---

## Executive Summary

This document tracks the implementation of India's **Digital Personal Data Protection Act, 2023 (DPDP Act)** and **DPDP Rules 2025** compliance for the S.S. Pharmacy e-commerce and admin portal.

### Key Legal Requirements
Based on research from official government sources and compliance guides:

1. **Consent Management**: Explicit, informed, granular consent required before data collection
2. **Privacy Notice**: Clear notice in prescribed format (English + Hindi minimum)
3. **Data Principal Rights**: Access, correction, erasure, withdrawal of consent
4. **Breach Notification**: 72 hours to Data Protection Board + affected individuals
5. **Grievance Redressal**: 90-day response timeline, designated contact
6. **Data Minimization**: Collect only necessary data for stated purpose
7. **Purpose Limitation**: Data used only for disclosed purpose
8. **Retention Limits**: Define and enforce data retention periods
9. **Security Safeguards**: Reasonable technical and organizational measures

**Penalties**: Up to ₹250 crore for non-compliance (Schedule 1 penalties, effective May 2027)

---

## 1. DATA AUDIT - PERSONAL DATA COLLECTION POINTS

### 1.1 Customer-Facing Data Collection

#### ✅ **Checkout/Order Placement** (`src/app/(public)/checkout/page.tsx`, `/api/orders/place`)
- **Data Collected**: 
  - Name (mandatory)
  - Phone number (mandatory)
  - Email (optional)
  - Shipping address, city, state, pincode (mandatory)
  - Gift message (optional)
  - Payment method selection
  - Cart items (product IDs, quantities)
- **Purpose**: Order fulfillment, delivery, payment processing
- **Storage**: `orders` table (Supabase PostgreSQL)
- **Retention**: 7 years (invoicing/tax compliance)
- **Consent Status**: ❌ NO explicit consent checkbox

#### ✅ **Contact/Inquiry Form** (`src/components/sections/InquiryForm.tsx`, `/api/inquiries`)
- **Data Collected**:
  - Name (mandatory)
  - Email (mandatory)
  - Company (optional)
  - Phone (optional)
  - Requirement/message (mandatory)
- **Purpose**: Business inquiry response, customer support
- **Storage**: `inquiries` table
- **Retention**: 2 years
- **Consent Status**: ❌ NO explicit consent checkbox

#### ✅ **Order Tracking** (`/api/orders/track`)
- **Data Collected**: Order number + phone number for verification
- **Purpose**: Order status lookup
- **Storage**: Query only, no new data stored
- **Consent Status**: N/A (lookup only)

#### ✅ **Distributor Applications** (if exists)
- **Purpose**: Partnership evaluation
- **Consent Status**: ❌ NO explicit consent checkbox

### 1.2 Admin Portal Data Collection

#### ✅ **Admin Login** (`src/components/admin/LoginForm.tsx`, `/api/auth/unified-login`)
- **Data Collected**:
  - Email (mandatory)
  - Password (hashed with bcryptjs)
  - MFA secrets (encrypted with AES-256-GCM)
  - Login timestamps, IP addresses (audit trail)
- **Purpose**: Authentication, security, audit compliance
- **Storage**: `admin_users`, `audit_logs` tables
- **Retention**: Audit logs - 3 years (compliance), MFA - until disabled
- **Consent Status**: N/A (employment/operational necessity)

#### ✅ **Push Notification Subscriptions** (`/api/notifications/subscribe`)
- **Data Collected**:
  - Push subscription endpoint
  - P256DH key, Auth key (Web Push encryption)
  - Admin ID
- **Purpose**: Order notifications, system alerts
- **Storage**: `push_subscriptions` table
- **Retention**: Until unsubscribed
- **Consent Status**: ✅ User-initiated via UI prompt (implicit consent)

---

## 2. THIRD-PARTY SERVICES & TRACKERS AUDIT

### 2.1 Analytics & Tracking Services

#### ❌ **Google Analytics 4** (`src/app/layout.tsx`)
- **Data Tracked**: Page views, user interactions, device info, IP addresses
- **Purpose**: Website analytics, performance monitoring
- **Privacy Policy**: https://policies.google.com/privacy
- **Consent Status**: ⚠️ **CRITICAL NON-COMPLIANCE**
  - Currently loads **unconditionally** on page load
  - NO consent banner gate
  - NO opt-in mechanism
  - **DPDP Violation**: Non-essential tracking without consent

**Current Implementation:**
```typescript
{gaId && (
  <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
)}
```

**Required Fix:** Gate behind consent, load only after user accepts "Analytics & Performance" consent.

#### ❌ **Microsoft Clarity** (`src/app/layout.tsx`)
- **Data Tracked**: Session recordings, heatmaps, user interactions
- **Purpose**: UX analysis, conversion optimization
- **Privacy Policy**: https://privacy.microsoft.com/
- **Consent Status**: ⚠️ **CRITICAL NON-COMPLIANCE**
  - Currently loads **unconditionally**
  - NO consent banner gate
  - Session recordings = highly invasive tracking
  - **DPDP Violation**: Non-essential tracking without explicit consent

**Required Fix:** Gate behind consent, explicit opt-in required for session recording.

### 2.2 Essential Third-Party Services

#### ✅ **Supabase** (Database & Authentication)
- **Data Processor**: Supabase Inc. (US-based, GDPR-compliant)
- **Purpose**: Database hosting, authentication backend
- **Data**: All personal data (orders, inquiries, admin users)
- **DPA Required**: YES - Data Processing Agreement needed
- **Consent Status**: N/A (essential for service delivery)

#### ✅ **Geoapify** (Optional - Maps API)
- **Purpose**: Pincode/location lookup
- **Data Shared**: Pincode, GPS coordinates (if user provides)
- **Consent Status**: N/A (user-initiated, no tracking)

#### ✅ **Twilio** (SMS - Optional)
- **Purpose**: Order SMS notifications
- **Data**: Phone number, message content
- **Consent Status**: Implied consent via order placement + SMS opt-in

#### ✅ **Resend** (Transactional Email)
- **Purpose**: Order confirmations, admin notifications
- **Data**: Email addresses, order details
- **Consent Status**: N/A (transactional necessity)

### 2.3 Font & CDN Services

#### ✅ **Google Fonts** (`fonts.googleapis.com`)
- **Privacy Concern**: IP address logged by Google
- **Fix Options**:
  - Self-host fonts (recommended)
  - OR disclose in privacy notice as essential service
- **Current Status**: Loaded from Google CDN

---

## 3. COOKIE CONSENT IMPLEMENTATION STATUS

### Current Cookie Banner (`src/components/layout/CookieConsent.tsx`)

#### ⚠️ **DPDP NON-COMPLIANCE ISSUES:**

1. **Binary Choice Problem**:
   - Current: "Accept" vs "Essential Only"
   - DPDP Requires: Granular, per-purpose consent
   - Missing: Analytics consent, Marketing consent, Personalization consent

2. **Pre-Ticked/Default Consent**:
   - Current implementation doesn't track granular consent
   - Loads GA/Clarity immediately without waiting for consent
   - **Violation**: Scripts load before user accepts

3. **Consent Withdrawal**:
   - No mechanism to withdraw/modify consent post-acceptance
   - DPDP Requires: Easy withdrawal, same effort as giving consent

4. **Consent Record**:
   - Stored only in localStorage (not auditable)
   - No database record of consent timestamp, purpose, version
   - **Violation**: Cannot prove consent if challenged

### Required Cookie Categories (DPDP Compliance)

1. **Essential Cookies** (No consent required):
   - Session management (`admin-auth-token`)
   - Cart persistence (`ss_cart`)
   - CSRF protection
   - Security (rate limiting)

2. **Analytics & Performance** (Consent required):
   - Google Analytics
   - Microsoft Clarity
   - Performance monitoring

3. **Functional** (Consent required):
   - Currency preference (`ssp_currency`)
   - Language selection
   - PWA install preferences

4. **Marketing** (Consent required):
   - Currently NONE (future: retargeting pixels, affiliate tracking)

---

## 4. COMPLIANCE IMPLEMENTATION CHECKLIST

### Phase 1: Critical Compliance (1-2 Weeks) ⚠️ HIGH PRIORITY

- [x] Create compliance branch `compliance/dpdp`
- [ ] **Privacy Notice Page** (`/privacy-policy`)
  - [ ] English version (primary)
  - [ ] Hindi version (mandatory under DPDP)
  - [ ] Sections: Data collected, purposes, retention, third parties, rights, grievance
  - [ ] Legal review marker: `[LEGAL REVIEW REQUIRED]`
- [ ] **Consent Management System**
  - [ ] Database schema: `data_consents` table
  - [ ] Granular consent tracking (purpose-wise)
  - [ ] Consent version control
  - [ ] Timestamp, IP, user agent logging
- [ ] **Consent Checkboxes at Data Entry**
  - [ ] Checkout form: Order processing consent
  - [ ] Inquiry form: Communication consent
  - [ ] Admin signup: Terms acceptance
  - [ ] Unticked by default (DPDP requirement)
- [ ] **Tracker Consent Gate**
  - [ ] Refactor cookie banner for granular consent
  - [ ] Conditional GA/Clarity loading
  - [ ] Consent preference center UI
- [ ] **Grievance Officer Contact**
  - [ ] Add to Privacy Policy
  - [ ] Add to website footer
  - [ ] Email: `grievance@sspharmacy.com` (placeholder)
  - [ ] 90-day response SLA

### Phase 2: Data Subject Rights (Week 3)

- [ ] **Data Rights Request Form** (`/data-rights-request`)
  - [ ] Access request: Download my data
  - [ ] Correction request: Update my data
  - [ ] Erasure request: Delete my data (Right to be Forgotten)
  - [ ] Consent withdrawal: Revoke consent
  - [ ] Authentication: Order number + phone or email verification
- [ ] **Data Export Functionality**
  - [ ] API: `/api/data-export`
  - [ ] Format: JSON or CSV
  - [ ] Include: Orders, inquiries, profile data
- [ ] **Data Erasure Workflow**
  - [ ] Soft delete (retain for legal obligations)
  - [ ] Hard delete after retention period
  - [ ] Anonymization of analytics data

### Phase 3: Legal Documentation (Week 4)

- [ ] **Terms of Service Update** (`/terms-of-service`)
  - [ ] Add DPDP-compliant data protection clause
  - [ ] Define user obligations
  - [ ] Limitation of liability
  - [ ] Governing law: India
  - [ ] Legal review marker
- [ ] **Data Retention Policy** (Internal document)
  - [ ] Orders: 7 years (tax/invoicing law)
  - [ ] Inquiries: 2 years
  - [ ] Audit logs: 3 years
  - [ ] Marketing consents: Until withdrawn
- [ ] **Data Processing Agreements (DPAs)**
  - [ ] Supabase DPA
  - [ ] Twilio DPA (if using SMS)
  - [ ] Resend DPA

### Phase 4: Breach Response (Week 4)

- [ ] **Breach Runbook** (`BREACH_RUNBOOK.md`)
  - [ ] 72-hour timeline flowchart
  - [ ] Notification templates (Board + Users)
  - [ ] Incident response team roles
  - [ ] CERT-In coordination (6-hour deadline)
  - [ ] Data Protection Board reporting format
  - [ ] Communication scripts
- [ ] **Breach Detection Mechanisms**
  - [ ] Database audit logging
  - [ ] Anomaly detection alerts
  - [ ] Failed login monitoring
  - [ ] Data export audit trail

### Phase 5: Security Hardening (Week 5)

- [ ] Flag and fix security gaps:
  - [ ] ⚠️ Captcha verification (current: client-side trust)
  - [ ] ⚠️ Rate limiter fails open (should fail closed)
  - [ ] ⚠️ HTTPS enforcement (verify production config)
  - [ ] ⚠️ Session data in localStorage (migrate to HTTP-only cookies)
  - [ ] ⚠️ Password reset flow (implement secure token-based reset)
- [ ] **Encryption Audit**
  - [ ] At-rest: Verify Supabase encryption
  - [ ] In-transit: Force HTTPS, HSTS headers
  - [ ] Application-level: MFA secrets (currently AES-256-GCM ✅)

---

## 5. TECHNICAL DECISIONS LOG

### Decision 1: Consent Storage Architecture
**Date:** Aug 18, 2026  
**Decision:** Store consent records in database (`data_consents` table) instead of localStorage only  
**Rationale:**
- DPDP requires auditable proof of consent
- localStorage is client-side only, can be cleared
- Database provides: timestamp, IP, user agent, consent version, purposes
- Enables compliance reporting for DPB audits

**Schema:**
```sql
CREATE TABLE data_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL, -- email or phone or session_id
  consent_type TEXT NOT NULL, -- 'order_processing', 'marketing', 'analytics'
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_version TEXT NOT NULL, -- privacy policy version
  ip_address INET,
  user_agent TEXT,
  withdrawal_timestamp TIMESTAMPTZ,
  metadata JSONB
);
```

### Decision 2: Third-Party Tracker Loading Strategy
**Date:** Aug 18, 2026  
**Decision:** Implement opt-in consent before loading GA/Clarity  
**Rationale:**
- DPDP Rules 2025 mandate explicit consent for non-essential processing
- Session recording (Clarity) is highly invasive, requires informed consent
- GA tracks PII (IP addresses), requires consent under DPDP
- Penalty risk: ₹50-250 crore for tracking without consent

**Implementation:**
1. Refactor `src/app/layout.tsx` to conditionally load scripts
2. Store consent in database + localStorage (dual persistence)
3. Check consent status before initializing trackers
4. Provide "Manage Cookies" link in footer

### Decision 3: Grievance Officer Designation
**Date:** Aug 18, 2026  
**Decision:** Designate internal contact (placeholder) until formal appointment  
**Rationale:**
- DPDP Section 9: Every Data Fiduciary must publish contact details
- 90-day grievance resolution timeline (DPDP Rules 2025)
- Placeholder: `grievance@sspharmacy.com`
- **Action Required**: Company must formally designate Grievance Officer

### Decision 4: Data Retention Periods
**Date:** Aug 18, 2026  
**Decision:** Align retention with sectoral laws + data minimization  
**Rationale:**
- Orders: 7 years (Income Tax Act, 1961 - Section 6 requires invoice retention)
- Inquiries: 2 years (business necessity)
- Audit logs: 3 years (security + compliance)
- Marketing consents: Until withdrawn
- DPDP Rule: Sector-specific retention laws override erasure requests

### Decision 5: Hindi Privacy Notice Requirement
**Date:** Aug 18, 2026  
**Decision:** Implement English + Hindi bilingual privacy notice  
**Rationale:**
- DPDP Act Section 7(5): Notice must be in 22 scheduled Indian languages if requested
- Practical compliance: English (default) + Hindi (most widely spoken)
- Future: Add regional languages based on user geography (Telugu for Andhra Pradesh)
- **Action Required**: Translate privacy notice to Hindi, legal review both versions

---

## 6. SECURITY GAPS FLAGGED

### 🔴 Critical Security Issues (DPDP Breach Risk)

#### 1. **Session Data in localStorage**
- **Issue**: Admin tokens stored in localStorage (XSS vulnerability)
- **Location**: `src/app/admin/AdminLayoutClient.tsx`, `src/components/admin/LoginForm.tsx`
- **Code**:
  ```typescript
  localStorage.setItem('sspharmacy-admin-token', token);
  localStorage.setItem('sspharmacy-admin-session', JSON.stringify(sessionPayload));
  ```
- **DPDP Risk**: If XSS occurs, attacker gains admin access, potential data breach
- **Fix**: Remove localStorage tokens, rely solely on HTTP-only cookies
- **Priority**: HIGH

#### 2. **Rate Limiter Fails Open**
- **Issue**: On database failure, rate limiter allows requests
- **Location**: `src/lib/rate-limit.ts`
- **Code**:
  ```typescript
  catch (err) {
    console.error('[DbRateLimiter] Error:', err);
    return { remainingPoints: this.points, msBeforeNext: 0 }; // ⚠️ ALLOWS REQUEST
  }
  ```
- **DPDP Risk**: Brute force attacks on login, bulk data extraction
- **Fix**: Fail closed or implement in-memory fallback (Redis)
- **Priority**: HIGH

#### 3. **Captcha Verification Trust**
- **Issue**: Captcha validation relies on encrypted client token, but implementation could be bypassed
- **Location**: `src/lib/auth.ts` - `verifyCaptchaToken()`
- **DPDP Risk**: Automated account creation, spam submissions
- **Fix**: Add server-side rate limiting as secondary control (already exists ✅), consider CAPTCHA service (hCaptcha/reCAPTCHA)
- **Priority**: MEDIUM

#### 4. **HTTPS Enforcement**
- **Issue**: Development mode allows HTTP
- **Location**: `next.config.ts`, `src/proxy.ts`
- **DPDP Risk**: Personal data transmitted in cleartext
- **Fix**: Enforce HTTPS in production via middleware, HSTS headers (already set ✅)
- **Priority**: VERIFY (check production deployment)

#### 5. **No Password Reset Flow**
- **Issue**: No secure password reset mechanism visible
- **DPDP Risk**: Admins locked out use insecure workarounds, potential social engineering
- **Fix**: Implement token-based password reset with email verification
- **Priority**: MEDIUM

#### 6. **Console Logging in Production**
- **Issue**: 100+ console.log statements may leak PII
- **Location**: Throughout codebase
- **DPDP Risk**: PII exposure in browser console, audit trail gaps
- **Fix**: Remove client-side console statements, implement server-side audit logging
- **Priority**: MEDIUM (covered in main audit report)

---

## 7. LAWYER REVIEW REQUIRED

### Documents Pending Legal Review

1. **Privacy Policy / Privacy Notice** (`/privacy-policy`)
   - [ ] English version
   - [ ] Hindi translation
   - [ ] Marker: `[LEGAL REVIEW REQUIRED]` in source
   - **Review Focus**: DPDP Act compliance, accuracy of data processing descriptions, third-party disclosures

2. **Terms of Service** (`/terms-of-service`)
   - [ ] Data protection clause
   - [ ] Governing law (Indian jurisdiction)
   - [ ] Limitation of liability
   - **Review Focus**: Enforceability, consumer protection law alignment

3. **Consent Language**
   - [ ] Checkout consent checkbox text
   - [ ] Inquiry form consent text
   - [ ] Cookie consent modal text
   - **Review Focus**: DPDP "clear and plain language" requirement, no legal jargon

4. **Data Rights Request Form**
   - [ ] Instructions for erasure requests
   - [ ] Exceptions (legal retention requirements)
   - **Review Focus**: Compliance with DPDP Section 13 (Data Principal Rights)

5. **Breach Notification Templates**
   - [ ] User notification email template
   - [ ] Data Protection Board notification template
   - **Review Focus**: DPDP Rules 2025 breach reporting format compliance

### Legal Questions for Counsel

1. **Consent Granularity**: Is per-purpose consent (analytics, marketing, functional) sufficient, or do we need sub-purpose breakdowns?
2. **Parental Consent**: Do we sell to minors? If yes, need verifiable parental consent mechanism (DPDP Section 10).
3. **Cross-Border Data Transfers**: Supabase stores data in Singapore region - does this require additional consent or DPB notification?
4. **Significant Data Fiduciary**: Do we meet threshold? If yes:
   - Need Data Protection Officer (DPO) appointment
   - Annual DPIA (Data Protection Impact Assessment)
   - Independent audit requirement
5. **Sectoral Law Interactions**: How do Drugs and Cosmetics Act, 1940 requirements interact with DPDP erasure rights?

---

## 8. IMPLEMENTATION SUMMARY

### What Has Been Built (Audit Phase)

1. ✅ **DPDP Compliance Branch**: `compliance/dpdp` created
2. ✅ **Comprehensive Data Audit**: Identified all personal data collection points
3. ✅ **Third-Party Service Inventory**: Cataloged all external services and tracking
4. ✅ **Security Gap Analysis**: Flagged 6 critical/medium security issues
5. ✅ **Technical Decisions Log**: Documented architectural choices for consent management
6. ✅ **Legal Review Checklist**: Prepared documents for lawyer review
7. ✅ **This Progress Document**: DPDP_PROGRESS.md

### What Needs to Be Built (Implementation Phase)

#### Critical Path (Blocking Launch):
1. ❌ Privacy Policy page (EN + HI)
2. ❌ Granular consent management system
3. ❌ Consent checkboxes at all data entry points
4. ❌ Gated tracker loading (GA/Clarity opt-in)
5. ❌ Grievance officer contact publication
6. ❌ Data rights request form
7. ❌ Terms of Service with data protection clause
8. ❌ Breach runbook (BREACH_RUNBOOK.md)

#### High Priority (Post-Launch):
9. ❌ Fix security gaps (localStorage tokens, rate limiter, etc.)
10. ❌ Data export API functionality
11. ❌ Consent withdrawal workflow
12. ❌ Password reset flow for admins
13. ❌ Supabase DPA execution

#### Medium Priority (Compliance Maintenance):
14. ❌ Annual DPIA (if Significant Data Fiduciary)
15. ❌ DPO appointment (if required)
16. ❌ Regional language translations (Telugu, Tamil, Kannada)
17. ❌ Consent analytics dashboard (for audit)
18. ❌ Automated data retention enforcement

---

## 9. OPEN ITEMS & NEXT STEPS

### Immediate Actions (This Week)

1. **Implement Privacy Policy Page**
   - Draft English version based on DPDP template
   - Include all required sections (data, purposes, rights, third parties, retention, grievance)
   - Add `[LEGAL REVIEW REQUIRED]` markers
   - Create Hindi translation (use professional translator, not just Google Translate)

2. **Database Schema for Consent**
   - Create `data_consents` table migration
   - Implement consent recording API (`/api/consent/record`)
   - Add consent validation middleware

3. **Refactor Cookie Banner**
   - Granular consent options (Essential, Analytics, Functional)
   - Store consent in database + localStorage
   - Conditional script loading based on consent

4. **Add Consent Checkboxes**
   - Checkout form: "I consent to order processing" (unticked default)
   - Inquiry form: "I consent to being contacted" (unticked default)
   - Link to Privacy Policy from each checkbox

5. **Create Breach Runbook**
   - 72-hour timeline checklist
   - Notification templates (Board, Users, Media)
   - Incident response team contact list
   - CERT-In reporting procedure (6-hour deadline)

### Decisions Needed from Business

1. **Grievance Officer Appointment**: Who will be designated?
2. **Data Protection Officer**: Do we need one? (depends on volume/revenue thresholds)
3. **Legal Counsel Engagement**: Which law firm for DPDP compliance review?
4. **Budget for Compliance Tools**: Consent management platform (CMP) or build in-house?
5. **Timeline**: When is production launch? Full compliance required before launch.

### Risks & Blockers

- **Blocker 1**: No legal counsel review yet - cannot finalize privacy policy language
- **Blocker 2**: Grievance officer not designated - cannot publish contact details
- **Risk 1**: If launched without consent management, penalties up to ₹250 crore
- **Risk 2**: Google Analytics/Clarity currently non-compliant - immediate compliance gap
- **Risk 3**: No breach response plan - could exceed 72-hour notification deadline

---

## 10. COMPLIANCE TIMELINE ESTIMATE

### Week 1 (Current): Audit & Planning ✅
- Data audit complete
- Third-party service mapping complete
- Security gap identification complete
- Documentation structure ready

### Week 2: Core Compliance Implementation
- Privacy policy page (EN + HI)
- Consent management database + API
- Consent checkboxes on forms
- Gated tracker loading

### Week 3: Data Rights & Legal Docs
- Data rights request form
- Data export API
- Terms of Service update
- Breach runbook creation

### Week 4: Security Hardening & Testing
- Fix localStorage token issue
- Fix rate limiter fail-open issue
- End-to-end consent flow testing
- Legal review coordination

### Week 5: Launch Preparation
- Legal counsel final approval
- Grievance officer designation
- DPAs with third parties
- Production deployment checklist

**Target Compliance Date:** September 15, 2026  
**DPDP Full Enforcement Date:** May 13, 2027 (7 months buffer)

---

## 11. REFERENCES & RESOURCES

### Official Sources
1. [DPDP Act 2023 (eGazette)](https://egazette.gov.in/WriteReadData/2023/247847.pdf)
2. [DPDP Rules 2025 Notification](https://www.meity.gov.in/)
3. [Data Protection Board of India](https://www.dpb.gov.in/) (when established)

### Compliance Guides
4. [EY India - DPDP Act 2023 Compliance Guide](https://www.ey.com/en_in/insights/cybersecurity/decoding-the-digital-personal-data-protection-act-2023)
5. [DSCI Summary of DPDP Provisions](https://www.dsci.in/)
6. [Grant Thornton - Privacy Compliance Guide 2025](https://grantthornton.in/)

### Technical Resources
7. [DPDP Breach Notification Timeline](https://certbar.com/blog/leadership/dpdp-breach-notification-72-hour-playbook)
8. [Consent Management Best Practices](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/india-data-privacy-laws)

---

**Document Status:** Living document - Updated as implementation progresses  
**Last Updated:** August 18, 2026  
**Next Review:** August 25, 2026 (Post-Privacy Policy Implementation)
