# 🛡️ ScamCheck

### AI-Assisted Job & Internship Opportunity Verification Platform

> **Helping students identify suspicious job and internship opportunities before they lose money or share sensitive information.**

---

## 🏆 Hackathon Team

**Team Name:** X-CEPTION  
**Team ID:** `HS2026-188`

### 👥 Team Members

| # | Name |
|---|---|
| 1 | Vignesh G |
| 2 | Rishi R |
| 3 | Prathap M |
| 4 | Pragadeesh S |

---

## 🔗 Live Demo

**Production:**  
https://x-ception.vercel.app/

---

# 📌 Problem Statement

Students increasingly receive job and internship opportunities through platforms such as LinkedIn, WhatsApp, Telegram, email, and other online channels.

While many opportunities are legitimate, fraudulent recruiters and fake job offers can look convincing. Students may encounter:

- Fake internship offers
- Impersonated companies
- Fake recruiters
- Upfront registration or processing fees
- Suspicious websites and domains
- Requests for sensitive personal information
- Urgent payment demands
- Fake offer letters
- Unofficial recruitment channels

Students often do not have a simple and centralized way to verify whether an opportunity is trustworthy before responding, paying money, or sharing sensitive information.

### The Core Problem

There is a need for a **student-friendly opportunity verification platform** that can analyze different forms of job and internship evidence and provide an understandable, evidence-backed risk assessment.

---

# 💡 Proposed Solution

## ScamCheck

**ScamCheck** is an AI-assisted opportunity verification platform designed to help students evaluate suspicious job and internship opportunities.

Instead of relying on a simple "scam" or "not scam" prediction, ScamCheck analyzes multiple evidence sources and explains **why an opportunity may require caution**.

Users can submit:

- 🔗 Job or internship URL
- 📸 Screenshot of a job/message/offer
- 📝 Pasted opportunity text
- 📄 Offer-letter evidence

ScamCheck then analyzes the available evidence using multiple verification and intelligence layers.

---

# 🔍 How ScamCheck Works

```text
                 USER
                  │
                  ▼
        ┌─────────────────────┐
        │  Evidence Intake    │
        └──────────┬──────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
      URL      Screenshot      Text
       │           │           │
       ▼           ▼           ▼
   Domain      OCR / Image    Content
 Intelligence  Analysis      Analysis
       │           │           │
       └───────────┼───────────┘
                   ▼
        ┌─────────────────────┐
        │ Entity Extraction   │
        │ Company / Recruiter │
        │ URL / Email / Phone │
        └──────────┬──────────┘
                   ▼
        ┌─────────────────────┐
        │ Verification Engine │
        └──────────┬──────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    Company     Recruiter    Threat
 Verification  Verification Intelligence
       │           │           │
       └───────────┼───────────┘
                   ▼
        ┌─────────────────────┐
        │ Signal Correlation  │
        └──────────┬──────────┘
                   ▼
        ┌─────────────────────┐
        │ Deterministic Risk  │
        │       Engine        │
        └──────────┬──────────┘
                   ▼
        ┌─────────────────────┐
        │ AI-Assisted Analysis│
        └──────────┬──────────┘
                   ▼
        ┌─────────────────────┐
        │ Unified ScamCheck   │
        │       Report        │
        └─────────────────────┘
