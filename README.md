# ScamCheck

## AI-Assisted Job & Internship Opportunity Verification System

ScamCheck is a web-based opportunity verification system developed to help students assess potentially suspicious job and internship opportunities before taking actions such as applying, making payments, or sharing sensitive information.

The project combines evidence intake, URL analysis, company verification, recruiter verification, threat intelligence, risk assessment, OCR-supported evidence processing, and AI-assisted analysis into a single workflow. The implementation is a Next.js application using TypeScript, React, Supabase, Tailwind CSS, Lucide React, and Tesseract.js. The repository contains dedicated API routes and library modules for the major analysis stages.

> **Important:** ScamCheck is a decision-support system. Its assessment should be treated as an indicator for further verification, not as a definitive legal or security guarantee that an opportunity is genuine or fraudulent.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Problem Context](#2-problem-context)
- [3. Empathy Portfolio](#3-empathy-portfolio)
- [4. Defined Problem Statement](#4-defined-problem-statement)
- [5. Ideation](#5-ideation)
- [6. AI Interaction Audit](#6-ai-interaction-audit)
- [7. Proposed Solution](#7-proposed-solution)
- [8. System Workflow](#8-system-workflow)
- [9. Technical Architecture](#9-technical-architecture)
- [10. Implemented Features](#10-implemented-features)
- [11. Prototype](#11-prototype)
- [12. Prototype Validation](#12-prototype-validation)
- [13. Technology Stack](#13-technology-stack)
- [14. Repository Structure](#14-repository-structure)
- [15. Installation and Setup](#15-installation-and-setup)
- [16. Testing](#16-testing)
- [17. Limitations](#17-limitations)
- [18. Future Enhancements](#18-future-enhancements)
- [19. Privacy and Responsible AI](#19-privacy-and-responsible-ai)
- [20. Team](#20-team)

---

# 1. Project Overview

### Project Name
**ScamCheck**

### Project Type
College Academic Project

### Domain
Artificial Intelligence · Cybersecurity · Web Application · Opportunity Verification

### Primary Users
Students evaluating job and internship opportunities received through online channels.

### Objective

The objective of ScamCheck is to provide students with a centralized and understandable way to inspect opportunity evidence and identify warning signals that may justify additional verification.

The project moves beyond a simple binary `scam / not scam` response. The intended output is an explainable assessment that connects detected signals to the final risk-oriented result.

---

# 2. Problem Context

Students may receive job and internship opportunities through career portals, professional networks, email, messaging platforms, social media, and direct recruiter communication.

An opportunity can appear credible while still containing signals that deserve investigation. Examples include unusual payment requests, suspicious links or domains, inconsistent company information, unverifiable recruiter details, and misleading offer content.

The practical problem is therefore not only scam detection. It is the difficulty of carrying out a **multi-step verification process quickly and consistently**.

ScamCheck is designed to reduce that verification burden by bringing several analysis stages into one application.

### Problem Characteristics

- Information may arrive in different forms, including URLs, screenshots, text, or offer-letter evidence.
- Relevant verification information can be distributed across different sources.
- Students may not know which signals deserve attention.
- A single unexplained classification is not sufficient for an informed decision.

---

# 3. Empathy Portfolio

The academic evaluation requires research evidence that demonstrates how the problem was understood from the user's perspective.

## 3.1 Research Objective

The research stage should document how students discover opportunities, what they currently verify, where they experience uncertainty, and what support they need before deciding whether to proceed.

## 3.2 Interview Evidence

> **Evidence placeholder:** Add the actual raw interview transcripts collected during the project. Do not replace these with fabricated responses.

Recommended structure:

### Interview 1

**Participant:** `[Participant ID only]`  
**Context:** `[Student background / relevant experience]`

**Interviewer:** `[Actual question]`  
**Participant:** `[Actual response]`

**Interviewer:** `[Actual question]`  
**Participant:** `[Actual response]`

### Interview 2

**Participant:** `[Participant ID only]`

`[Insert actual transcript]`

### Interview 3

**Participant:** `[Participant ID only]`

`[Insert actual transcript]`

### Privacy Rule

Remove names, phone numbers, email addresses, institution-specific identifiers, screenshots containing personal data, and other personally identifiable information before publishing research evidence.

---

## 3.3 Observation Logs

> **Evidence placeholder:** Add the actual observation notes from the research process.

| Observation | Observed Behaviour | Interpretation | Design Implication |
|---|---|---|---|
| `[Observation 1]` | `[Behaviour]` | `[Interpretation]` | `[Implication]` |
| `[Observation 2]` | `[Behaviour]` | `[Interpretation]` | `[Implication]` |
| `[Observation 3]` | `[Behaviour]` | `[Interpretation]` | `[Implication]` |

Typical areas to document include how users check the company website, recruiter identity, domain names, reviews, payment requests, offer details, and contact information.

---

## 3.4 User Journey Map

| Stage | User Action | User Question | Pain Point | Opportunity |
|---|---|---|---|---|
| Discover | Finds an opportunity | "Is this legitimate?" | Unknown source | Early verification |
| Inspect | Reads the opportunity | "Does anything look unusual?" | Warning signs may be subtle | Signal detection |
| Verify | Checks company/recruiter information | "Can I verify this organization/person?" | Information is distributed | Centralized verification |
| Decide | Chooses whether to proceed | "Should I continue?" | Low confidence | Explainable risk assessment |
| Act | Applies, pauses, or rejects | "What should I do next?" | Consequences of a wrong decision | Clear evidence and caution indicators |

> The final academic submission should connect this journey map to the actual user research rather than treating it as a generic assumption.

---

## 3.5 Photographic and Visual Evidence

> **Evidence placeholder:** Add photographs or screenshots showing the actual research and design process.

Suggested repository location:

```text
research/
├── interviews/
├── observations/
├── journey-map/
└── photographs/
```

Use consented and privacy-safe evidence only.

---

# 4. Defined Problem Statement

## 4.1 Precise Problem Statement

**Students need a simple and explainable way to evaluate unfamiliar internship and job opportunities because verifying company identity, recruiter information, links, opportunity content, and other warning signals manually can be time-consuming and inconsistent.**

## 4.2 Evidence-to-Problem Traceability

The defined problem should be traceable through the following chain:

```text
User Research
     ↓
Observed Behaviours
     ↓
Recurring Pain Points
     ↓
User Need
     ↓
Defined Problem Statement
     ↓
ScamCheck Requirements
```

## 4.3 Research Evidence Mapping

> Fill this table with actual research references.

| Research Evidence | Finding | Impact on Problem Definition |
|---|---|---|
| `[Interview reference]` | `[Finding]` | `[Impact]` |
| `[Observation reference]` | `[Finding]` | `[Impact]` |
| `[Interview / observation reference]` | `[Finding]` | `[Impact]` |

---

# 5. Ideation

## 5.1 Solution Directions Considered

The ideation phase explored several directions related to opportunity verification:

1. Manual opportunity verification checklist.
2. Company information verification.
3. Recruiter verification.
4. Suspicious URL and domain analysis.
5. Screenshot and document evidence analysis.
6. Risk scoring and signal aggregation.
7. AI-assisted explanation of analysis results.
8. A centralized verification dashboard.

## 5.2 Selected Concept

The selected concept was **ScamCheck**, a centralized web application that accepts opportunity evidence and combines multiple verification signals into an explainable risk-oriented report.

The choice aligns with the central user need: reducing the effort required to perform an initial investigation while keeping the result understandable.

## 5.3 Rejected or Modified Ideas

> **Evidence placeholder:** Document the actual ideas rejected or modified during ideation.

| Idea | Decision | Reason | Final Outcome |
|---|---|---|---|
| `[Idea]` | Rejected | `[Reason]` | Not implemented |
| `[Idea]` | Modified | `[Reason]` | `[Modified concept]` |
| `[Idea]` | Rejected | `[Reason]` | Not implemented |

---

# 6. AI Interaction Audit

AI was used as an **assistive tool** during ideation and development. AI suggestions were not treated as automatically correct. Human review, project requirements, repository code, and available evidence were used to decide what was adopted, modified, rejected, or corrected.

## 6.1 AI Usage Principles

The project follows this interaction model:

```text
AI Prompt
   ↓
AI Suggestion
   ↓
Human Review
   ↓
Technical / Evidence Verification
   ↓
Adopt / Modify / Reject
   ↓
Implementation
```

## 6.2 Prompt Register

> **Evidence placeholder:** Replace this table with the actual prompts used during the project.

| # | Actual Prompt | AI Suggestion | Decision | Reason | Result in Project |
|---|---|---|---|---|---|
| 1 | `[Prompt]` | `[Suggestion]` | Adopted | `[Reason]` | `[Implementation]` |
| 2 | `[Prompt]` | `[Suggestion]` | Modified | `[Reason]` | `[Implementation]` |
| 3 | `[Prompt]` | `[Suggestion]` | Rejected | `[Reason]` | Not implemented |

## 6.3 Adopted AI Suggestions

For every adopted suggestion, document:

- **Prompt:** `[Actual prompt]`
- **Suggestion:** `[AI suggestion]`
- **Human evaluation:** `[Why it was useful]`
- **Verification:** `[How it was checked]`
- **Implementation:** `[What was actually implemented]`

## 6.4 Rejected AI Suggestions

AI-generated ideas were rejected when they were outside the project scope, technically unsuitable, redundant, unverifiable, or inconsistent with project requirements.

## 6.5 Hallucination and Correction Log

> **Evidence placeholder:** Add actual examples of incorrect or unsupported AI output encountered during the project.

| AI Output / Claim | Issue | Verification Method | Correction | Final Decision |
|---|---|---|---|---|
| `[Claim]` | `[Incorrect / unsupported detail]` | `[How checked]` | `[Corrected information]` | `[Rejected / corrected]` |
| `[Claim]` | `[Issue]` | `[How checked]` | `[Correction]` | `[Decision]` |

### Human Oversight

The README deliberately distinguishes AI assistance from system-of-record information. AI-generated text should not be presented as evidence merely because an AI model produced it.

---

# 7. Proposed Solution

## 7.1 Solution Overview

ScamCheck provides a centralized workflow for analyzing suspicious job and internship opportunities.

The current repository implements dedicated application routes and library modules for multiple analysis stages, including:

- URL analysis
- Evidence analysis
- AI-assisted analysis
- Company verification
- Recruiter verification
- Threat intelligence
- Risk processing
- Reporting
- Authentication and user access
- OCR-supported evidence processing

These implementation areas are represented directly in the repository under `src/app/api` and `src/lib`.

## 7.2 Supported Evidence Types

The project is designed to work with multiple forms of opportunity evidence, including:

- Job or internship URLs
- Screenshots and images
- Pasted opportunity text
- Offer-letter or document evidence

The exact behaviour depends on the analysis route and the evidence supplied by the user.

---

# 8. System Workflow

```text
                       USER
                         │
                         ▼
              ┌─────────────────────┐
              │   Evidence Intake   │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
         URL         Screenshot         Text
          │              │              │
          ▼              ▼              ▼
      URL Analysis      OCR        Content Analysis
          │              │              │
          └──────────────┼──────────────┘
                         ▼
              Entity / Signal Extraction
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Company        Recruiter       Threat / URL
    Verification    Verification     Intelligence
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                Signal Correlation
                         │
                         ▼
                 Risk Assessment
                         │
                         ▼
               AI-Assisted Analysis
                         │
                         ▼
                Unified Report
```

The workflow is designed so that AI assistance complements structured analysis rather than replacing the application's verification and risk-processing logic.

---

# 9. Technical Architecture

## 9.1 Application Layer

ScamCheck is implemented as a Next.js application with TypeScript and React.

## 9.2 API Layer

The repository contains dedicated API routes for:

```text
src/app/api/
├── analyze-ai/
├── analyze-evidence/
├── analyze-url/
└── verify-company/
```

Additional verification logic is organized in reusable library modules.

## 9.3 Intelligence and Processing Layer

The repository contains separate modules for:

```text
src/lib/
├── ai/
├── analytics/
├── company-intelligence/
├── content-intelligence/
├── evidence/
├── recruiter-verification/
├── report/
├── risk/
├── risk-engine/
├── security/
├── supabase/
├── threat-intel/
└── url-intelligence/
```

This separation supports a modular implementation in which different intelligence and verification responsibilities remain independently organized.

---

# 10. Implemented Features

## 10.1 URL Analysis

The `/api/analyze-url` route provides a dedicated entry point for URL-related analysis.

## 10.2 Evidence Analysis

The `/api/analyze-evidence` route handles evidence-oriented analysis, supporting the broader multi-input verification workflow.

## 10.3 AI-Assisted Analysis

The `/api/analyze-ai` route provides an application-level AI analysis path.

## 10.4 Company Verification

The `/api/verify-company` route provides a dedicated company verification path.

## 10.5 Recruiter Verification

The repository contains a dedicated `recruiter-verification` library module for recruiter-related checks.

## 10.6 Threat Intelligence

The `threat-intel` and `url-intelligence` modules provide dedicated areas for threat and URL-related intelligence.

## 10.7 Risk Processing

The repository separates `risk` and `risk-engine` modules, supporting risk-oriented processing as an explicit system component.

## 10.8 OCR Support

The project includes Tesseract.js and local OCR-related scripts. The repository also includes `eng.traineddata` for English OCR support.

## 10.9 Authentication and User Access

The application contains login, signup, authentication callback, dashboard, and protected application flows. Supabase SSR and Supabase client libraries are included in the dependency configuration.

---

# 11. Prototype

## 11.1 Prototype Goal

The prototype focuses on validating whether a student can move from opportunity submission to an understandable analysis result through a single application workflow.

## 11.2 Prototype Areas

The repository contains application routes/pages for:

- Landing page
- Login
- Signup
- Dashboard
- Opportunity checking
- Report presentation

## 11.3 Prototype Evidence

> **Evidence placeholder:** Add screenshots of the actual prototype and label each screen.

Suggested structure:

```text
prototype/
├── landing-page.png
├── login.png
├── dashboard.png
├── check-opportunity.png
├── analysis-result.png
└── report.png
```

---

# 12. Prototype Validation

The academic requirement specifies feedback from at least three real testers. This README therefore reserves an explicit validation record for each participant.

> **Do not replace real user feedback with invented statements.**

## Tester 1

**Participant ID:** `[T1]`  
**User Type:** `[Student / other]`  
**Task:** `[Task given to tester]`

**Observed Behaviour:** `[Actual observation]`  
**Feedback:** `[Actual feedback]`  
**Issue Identified:** `[Issue]`  
**Change Made:** `[Change]`

## Tester 2

**Participant ID:** `[T2]`  
**User Type:** `[Student / other]`  
**Task:** `[Task given to tester]`

**Observed Behaviour:** `[Actual observation]`  
**Feedback:** `[Actual feedback]`  
**Issue Identified:** `[Issue]`  
**Change Made:** `[Change]`

## Tester 3

**Participant ID:** `[T3]`  
**User Type:** `[Student / other]`  
**Task:** `[Task given to tester]`

**Observed Behaviour:** `[Actual observation]`  
**Feedback:** `[Actual feedback]`  
**Issue Identified:** `[Issue]`  
**Change Made:** `[Change]`

## Validation Summary

| Validation Area | Tester 1 | Tester 2 | Tester 3 | Final Result |
|---|---|---|---|---|
| Understands project purpose | `[ ]` | `[ ]` | `[ ]` | `[Result]` |
| Can submit evidence | `[ ]` | `[ ]` | `[ ]` | `[Result]` |
| Understands risk result | `[ ]` | `[ ]` | `[ ]` | `[Result]` |
| Understands explanations | `[ ]` | `[ ]` | `[ ]` | `[Result]` |
| Knows what to verify next | `[ ]` | `[ ]` | `[ ]` | `[Result]` |

## Iteration Traceability

```text
Prototype
   ↓
User Testing
   ↓
Observed Problem
   ↓
Design / Feature Change
   ↓
Retest
```

Documenting this loop demonstrates that validation was used to improve the system rather than being treated as a final checklist item.

---

# 13. Technology Stack

The dependency configuration identifies the following major technologies:

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Authentication / Data | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Icons | Lucide React |
| OCR | Tesseract.js |
| Linting | ESLint 9 + `eslint-config-next` |
| Package Management | npm |
| Version Control | Git / GitHub |

These technologies are taken from the current repository dependency configuration rather than inferred from the project description.

---

# 14. Repository Structure

```text
Scamcheck/
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── eng.traineddata
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── proxy.ts
│
├── public/
│
├── scripts/
│   ├── debug-screenshot-analysis.ts
│   ├── run-all-tests.ts
│   ├── test-ocr-all-scenarios.ts
│   ├── test-ocr.ts
│   ├── test-server-ocr-flow.ts
│   ├── test-tesseract-local.ts
│   └── verify-tesseract-paths.ts
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-ai/
│   │   │   ├── analyze-evidence/
│   │   │   ├── analyze-url/
│   │   │   └── verify-company/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── report/
│   │   └── signup/
│   │
│   ├── components/
│   ├── context/
│   ├── lib/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── company-intelligence/
│   │   ├── content-intelligence/
│   │   ├── evidence/
│   │   ├── recruiter-verification/
│   │   ├── report/
│   │   ├── risk/
│   │   ├── risk-engine/
│   │   ├── security/
│   │   ├── supabase/
│   │   ├── threat-intel/
│   │   └── url-intelligence/
│   │
│   └── types/
│
└── supabase/
```

The structure above reflects the repository's current organization.

---

# 15. Installation and Setup

## 15.1 Prerequisites

- Node.js
- npm
- Git
- Required Supabase configuration
- Any external service credentials required by the configured environment

## 15.2 Clone the Repository

```bash
git clone https://github.com/Rishi-git-sys/Scamcheck.git
cd Scamcheck
```

## 15.3 Install Dependencies

```bash
npm install
```

## 15.4 Configure Environment Variables

Create a local environment file based on the repository template.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Then populate the required values.

**Never commit real API keys, passwords, tokens, or other secrets.**

## 15.5 Run the Development Server

```bash
npm run dev
```

Open the local development address displayed by Next.js.

## 15.6 Production Build

```bash
npm run build
npm start
```

## 15.7 Linting

```bash
npm run lint
```

---

# 16. Testing

The repository contains dedicated scripts for OCR and broader test execution.

Available scripts include:

```text
scripts/run-all-tests.ts
scripts/test-ocr.ts
scripts/test-ocr-all-scenarios.ts
scripts/test-server-ocr-flow.ts
scripts/test-tesseract-local.ts
scripts/verify-tesseract-paths.ts
scripts/debug-screenshot-analysis.ts
```

The project therefore includes explicit support for validating OCR-related behaviour and analysis flows instead of relying exclusively on manual testing.

## Recommended Academic Test Matrix

| Test Area | Input | Expected Result | Actual Result |
|---|---|---|---|
| URL analysis | `[URL]` | `[Expected]` | `[Actual]` |
| Evidence analysis | `[Screenshot / text]` | `[Expected]` | `[Actual]` |
| Company verification | `[Company]` | `[Expected]` | `[Actual]` |
| Risk assessment | `[Test case]` | `[Expected]` | `[Actual]` |
| OCR | `[Image]` | `[Expected extracted text]` | `[Actual extracted text]` |
| Authentication | `[Login test]` | `[Expected]` | `[Actual]` |
| Error handling | `[Invalid input]` | `[Expected]` | `[Actual]` |

Only verified test results should be entered in the final submission.

---

# 17. Limitations

ScamCheck has several practical limitations:

1. The quality of a risk assessment depends on the quality and availability of evidence.
2. External information can change over time.
3. A legitimate opportunity may contain unusual characteristics, creating false positives.
4. A sophisticated fraudulent opportunity may avoid obvious warning signals, creating false negatives.
5. OCR quality can vary with image quality, layout, and text clarity.
6. AI-generated analysis can contain errors and must remain subject to verification.
7. The system should not be interpreted as a definitive guarantee of legitimacy or fraud.

---

# 18. Future Enhancements

Potential extensions include:

- Broader company and recruiter verification sources.
- Expanded domain reputation and historical intelligence.
- Improved document and screenshot analysis.
- More multilingual OCR and text processing.
- Browser extension support.
- Mobile application support.
- User reporting and community intelligence.
- Historical case analysis for model evaluation.
- More systematic benchmarking of risk-engine performance.
- Stronger evidence provenance and audit trails.

Future work should be prioritized according to validated user needs and measurable technical requirements.

---

# 19. Privacy and Responsible AI

ScamCheck deals with potentially sensitive opportunity evidence. Responsible handling is therefore part of the project design.

### Privacy

- Avoid collecting unnecessary personal information.
- Do not publish participant-identifying research material.
- Keep credentials and secrets out of source control.
- Limit access to submitted evidence appropriately.

### Responsible AI

- AI output should not automatically be treated as factual evidence.
- Unsupported claims should be verified or rejected.
- Risk assessments should communicate uncertainty appropriately.
- The system should avoid presenting probabilistic or incomplete analysis as certainty.
- Human judgment remains important for high-impact decisions.

---

# 20. Team

| # | Name |
|---|---|
| 1 | Vignesh G |
| 2 | Rishi R |
| 3 | Prathap M |
| 4 | Pragadeesh S |

### Team Project Context

**ScamCheck** was originally developed as a team project and is now being documented and extended as a college academic project.

---

# Academic Submission Checklist

Before final submission, ensure the repository contains actual evidence for every required evaluation component:

- [ ] Raw interview transcripts
- [ ] Observation logs
- [ ] User journey map
- [ ] Photographic / visual research evidence
- [ ] Defined problem statement linked to research findings
- [ ] Actual AI prompts used during ideation
- [ ] Adopted AI suggestions and reasons
- [ ] Rejected AI suggestions and reasons
- [ ] AI hallucination / correction examples
- [ ] Prototype screenshots
- [ ] Feedback from at least three real testers
- [ ] Changes made from tester feedback
- [ ] Final testing evidence
- [ ] Installation instructions verified against the repository
- [ ] No secrets or personal information committed to GitHub

---

## Project Repository

https://github.com/Rishi-git-sys/Scamcheck
