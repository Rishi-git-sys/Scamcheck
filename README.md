# ScamCheck

## AI-Assisted Job & Internship Opportunity Verification System

ScamCheck is an **individual web-based project** designed to help students evaluate potentially suspicious job and internship opportunities before applying, making payments, or sharing sensitive information.

The project is currently at **35% development progress**, representing the initial working implementation and prototype stage. The remaining work focuses on completing and validating the full verification workflow.

The system combines URL analysis, company verification, recruiter verification, evidence analysis, OCR, threat intelligence, risk assessment, and AI-assisted explanation into a centralized workflow.

> **Important:** ScamCheck is a decision-support system. Its results are indicators for further verification and should not be treated as a definitive guarantee that an opportunity is legitimate or fraudulent.

---

## Project Information

| Detail | Information |
|---|---|
| **Project Type** | Individual Project |
| **Project Name** | ScamCheck |
| **Development Progress** | **35%** |
| **Domain** | AI + Cybersecurity |
| **Developer** | Rishi R |
| **Primary Users** | Students and job/internship seekers |

---

# 1. Project Overview

### Objective

Students often need to verify job and internship opportunities using multiple websites and sources. ScamCheck reduces this manual effort by bringing important verification stages into one application and presenting the findings in an understandable report.

The system is designed to move beyond a simple `SCAM / NOT SCAM` answer and provide risk-oriented signals and explanations.

### Problem Statement

> **Students need a simple and explainable way to evaluate unfamiliar internship and job opportunities because verifying company identity, recruiter information, links, opportunity content, and other warning signals manually can be time-consuming and inconsistent.**

---

# 2. Development Progress — 35%

The current project represents the **35% development milestone** required for the initial project stage.

| Work Area | Current Status | Progress Stage |
|---|---|---|
| Problem identification | Completed | ✅ |
| Problem statement | Completed | ✅ |
| Solution ideation | Completed | ✅ |
| Project architecture | Completed | ✅ |
| Next.js + TypeScript setup | Completed | ✅ |
| Initial UI / prototype | Implemented | ✅ |
| Authentication | Implemented | ✅ |
| Dashboard structure | Implemented | ✅ |
| URL analysis foundation | Implemented / being refined | 🔄 |
| Evidence/OCR foundation | Implemented / being refined | 🔄 |
| Company verification | In development | 🔄 |
| Recruiter verification | In development | 🔄 |
| Threat intelligence integration | In development | 🔄 |
| Risk engine refinement | In development | 🔄 |
| Final report refinement | In development | 🔄 |
| Full user validation | Pending | ⏳ |
| Final production release | Pending | ⏳ |

### 35% Milestone Goal

The 35% milestone establishes the project's foundation:

```text
Problem Definition
       ↓
Solution Design
       ↓
Technology Selection
       ↓
Project Architecture
       ↓
Initial Application
       ↓
Prototype / Core Features
       ↓
        35%
       ↓
Further Development
       ↓
Testing & Validation
       ↓
Final System
```

> **Note:** The 35% figure represents the current development milestone, not a claim that every listed feature is production-complete.

---

# 3. Problem Context

Students receive opportunities through career portals, professional networks, email, messaging platforms, social media, and direct recruiter communication.

Potential warning signs include:

- Registration, training, or security-deposit requests
- Suspicious links or domains
- Inconsistent company information
- Unverifiable recruiter details
- Suspicious contact information
- Misleading offer-letter content
- Unrealistic opportunity claims

The practical challenge is not only scam detection; it is performing a multi-step verification process quickly and consistently.

---

# 4. Proposed Solution

ScamCheck accepts opportunity evidence and combines multiple analysis stages into a single workflow.

### Supported Evidence

- Job or internship URLs
- Screenshots and images
- Pasted opportunity text
- Offer-letter or document evidence

### Verification Areas

1. URL and domain analysis
2. Company verification
3. Recruiter verification
4. Opportunity/content analysis
5. Screenshot/document analysis
6. OCR-based text extraction
7. Threat intelligence
8. Risk signal aggregation
9. AI-assisted explanation
10. Final verification report

---

# 5. System Workflow

```text
                         USER
                           |
                           v
                +---------------------+
                |   Evidence Intake   |
                +----------+----------+
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
            URL        Screenshot       Text
             |             |             |
             v             v             v
       URL Analysis       OCR       Content Analysis
             |             |             |
             +-------------+-------------+
                           |
                           v
             +---------------------------+
             | Company Verification      |
             | Recruiter Verification    |
             +-------------+-------------+
                           |
                           v
                +----------------------+
                | Threat Intelligence  |
                +----------+-----------+
                           |
                           v
                  +----------------+
                  |   Risk Engine  |
                  +--------+-------+
                           |
                           v
              +-------------------------+
              | AI-Assisted Explanation |
              +------------+------------+
                           |
                           v
                  +----------------+
                  | Unified Report |
                  +----------------+
```

---

# 6. User Research and Empathy

The user-research stage focuses on understanding how students discover opportunities, what they verify, where uncertainty occurs, and what support they need before proceeding.

### User Journey Map

| Stage | User Action | User Question | Pain Point | Opportunity |
|---|---|---|---|---|
| Discover | Finds an opportunity | Is this legitimate? | Unknown source | Early verification |
| Inspect | Reads the opportunity | Does anything look unusual? | Warning signs may be subtle | Signal detection |
| Verify | Checks company/recruiter | Can I verify this? | Information is distributed | Centralized verification |
| Decide | Chooses whether to proceed | Should I continue? | Low confidence | Explainable risk assessment |
| Act | Applies, pauses, or rejects | What should I do next? | Consequences of wrong decisions | Clear evidence and caution indicators |

### Academic Research Evidence

Actual interviews, observations, photographs, and participant feedback should be maintained as genuine project evidence and anonymized before publication.

Recommended structure:

```text
research/
├── interviews/
├── observations/
├── journey-map/
└── photographs/
```

> **Academic integrity:** Do not fabricate interview transcripts, observations, tester feedback, or other research evidence.

---

# 7. Ideation

### Solution Directions Considered

1. Manual opportunity verification checklist
2. Company information verification
3. Recruiter verification
4. Suspicious URL/domain analysis
5. Screenshot and document evidence analysis
6. Risk scoring and signal aggregation
7. AI-assisted explanation
8. Centralized verification dashboard

### Selected Concept

**ScamCheck** — a centralized web application that accepts opportunity evidence and combines multiple verification signals into an explainable, risk-oriented report.

### Key Design Decision

A purely AI-based scam classification was not selected because AI output can be unsupported or incorrect. ScamCheck instead combines structured verification signals with AI-assisted explanation.

---

# 8. AI Interaction Audit

AI was used as an assistive tool during ideation and development. AI suggestions were reviewed against project requirements, repository implementation, and available evidence.

```text
AI Prompt
    |
    v
AI Suggestion
    |
    v
Human Review
    |
    v
Technical / Evidence Verification
    |
    +----> Adopt
    +----> Modify
    +----> Reject
    |
    v
Implementation
```

### AI Usage Principles

- AI output is not automatically treated as factual evidence.
- Technical suggestions are checked against the implementation.
- Unsupported claims are rejected or corrected.
- AI does not independently determine whether an opportunity is fraudulent.
- Human judgment remains important for final decisions.

### AI Prompt Register

The academic submission should record the **actual prompts used during development**, together with the resulting decision and implementation.

| # | Actual Prompt | Suggestion | Decision | Verification / Reason | Result |
|---|---|---|---|---|---|
| 1 | Actual project prompt | Architecture suggestion | Adopt / Modify / Reject | Project review | Implementation |
| 2 | Actual project prompt | OCR suggestion | Adopt / Modify / Reject | Testing | Implementation |
| 3 | Actual project prompt | Risk-analysis suggestion | Adopt / Modify / Reject | Verification | Implementation |

---

# 9. Technical Architecture

### Application Layer

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

### API Layer

```text
src/app/api/
├── analyze-ai/
├── analyze-evidence/
├── analyze-url/
└── verify-company/
```

### Intelligence and Processing Layer

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

---

# 10. Implemented Features

- **URL Analysis** — `/api/analyze-url`
- **Evidence Analysis** — `/api/analyze-evidence`
- **AI-Assisted Analysis** — `/api/analyze-ai`
- **Company Verification** — `/api/verify-company`
- **Recruiter Verification** — dedicated recruiter-verification module
- **Threat Intelligence** — threat-intel and url-intelligence modules
- **Risk Processing** — risk and risk-engine modules
- **OCR Support** — Tesseract.js with English trained data
- **Authentication** — Supabase-based login, signup, dashboard, and protected routes
- **Reporting** — structured analysis and report workflow

---

# 11. Prototype

The prototype is designed to let a student move from opportunity submission to an understandable analysis result through one workflow.

### Prototype Areas

- Landing page
- Login
- Signup
- Dashboard
- Opportunity checking
- Analysis result
- Final report

Recommended evidence structure:

```text
prototype/
├── landing-page.png
├── login.png
├── signup.png
├── dashboard.png
├── check-opportunity.png
├── analysis-result.png
└── report.png
```

---

# 12. Prototype Validation

Prototype validation should use real testers where required by the academic evaluation.

For each tester, record:

- Participant ID
- User type
- Task
- Observed behaviour
- Feedback
- Issue identified
- Change made
- Retest result

### Validation Flow

```text
Prototype
    |
    v
User Testing
    |
    v
Observed Problem
    |
    v
Design / Feature Change
    |
    v
Retest
```

> Do not replace real tester feedback with invented statements.

---

# 13. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Authentication / Data | Supabase |
| Icons | Lucide React |
| OCR | Tesseract.js |
| Linting | ESLint 9 + eslint-config-next |
| Package Management | npm |
| Version Control | Git / GitHub |

---

# 14. Repository Structure

```text
Scamcheck/
├── .env.example
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── eng.traineddata
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── proxy.ts
├── public/
├── scripts/
│   ├── debug-screenshot-analysis.ts
│   ├── run-all-tests.ts
│   ├── test-ocr-all-scenarios.ts
│   ├── test-ocr.ts
│   ├── test-server-ocr-flow.ts
│   ├── test-tesseract-local.ts
│   └── verify-tesseract-paths.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── report/
│   │   └── signup/
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── types/
└── supabase/
```

---

# 15. Installation and Setup

### Prerequisites

- Node.js LTS
- npm
- Git
- Supabase project and required credentials

### Clone

```bash
git clone https://github.com/Rishi-git-sys/Scamcheck.git
cd Scamcheck
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in the required environment variables.

> **Never commit real API keys, tokens, passwords, or other secrets.**

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

# 16. Testing

The repository contains OCR and analysis-flow testing scripts:

```text
scripts/run-all-tests.ts
scripts/test-ocr.ts
scripts/test-ocr-all-scenarios.ts
scripts/test-server-ocr-flow.ts
scripts/test-tesseract-local.ts
scripts/verify-tesseract-paths.ts
```

### Test Matrix

| Test Area | Input | Expected Result |
|---|---|---|
| URL analysis | Job/internship URL | URL and domain signals are analyzed |
| Evidence analysis | Screenshot / offer evidence | Evidence is processed |
| OCR | Clear image | Text is extracted |
| Company verification | Company information | Verification result is returned |
| Authentication | Valid credentials | User can authenticate |
| Invalid URL | Invalid URL | Graceful error handling |
| Risk analysis | Multiple signals | Risk-oriented assessment is generated |

Actual pass/fail values should be recorded from the latest test execution before final submission.

---

# 17. Risk Assessment

ScamCheck is designed to combine multiple categories of evidence rather than rely on a single signal.

```text
URL Signals
     +
Company Signals
     +
Recruiter Signals
     +
Content Signals
     +
Evidence Signals
     +
Threat Intelligence
     |
     v
Risk Processing
     |
     v
Explainable Assessment
```

A warning signal does not automatically prove that an opportunity is fraudulent.

---

# 18. Limitations

1. Assessment quality depends on available evidence.
2. External information can change over time.
3. Legitimate opportunities can contain unusual characteristics.
4. Sophisticated scams may avoid obvious warning signals.
5. False positives and false negatives are possible.
6. OCR accuracy depends on image quality and layout.
7. AI-generated explanations may contain errors.
8. External services can have availability or rate-limit constraints.
9. ScamCheck cannot guarantee that an opportunity is legitimate or fraudulent.

---

# 19. Privacy, Security and Responsible AI

### Privacy

- Avoid collecting unnecessary personal information.
- Anonymize academic research participants.
- Do not publish participant names, phone numbers, or email addresses.
- Restrict access to submitted evidence appropriately.

### Security

- Store credentials in environment variables.
- Use `.env.local` for local secrets.
- Never commit production keys.
- Validate user-provided inputs.
- Handle external service failures safely.

### Responsible AI

- AI output is not automatically treated as factual evidence.
- Unsupported claims are verified, rejected, or corrected.
- Risk explanations communicate uncertainty.
- Human judgment remains essential.

---

# 20. Future Enhancements

- Expanded company verification sources
- Improved recruiter verification
- More domain reputation and historical intelligence
- Multilingual OCR
- Improved document analysis
- Browser extension
- Mobile application
- Community scam reporting
- Shared threat intelligence
- Historical case database
- Evidence provenance and audit trails
- Improved automated evaluation

---

# 21. Academic Documentation

Academic evidence can be maintained separately from the technical README:

```text
docs/
└── academic-submission.md
```

The academic document should contain the actual:

- User research
- Interview transcripts
- Observation logs
- User journey evidence
- Ideation records
- AI prompts and decisions
- AI correction/hallucination examples
- Prototype screenshots
- Real tester feedback
- Validation results
- Iteration evidence

All research evidence must be genuine and anonymized before publication.

---

## Academic Submission Checklist

- [ ] Actual interview transcripts collected and anonymized
- [ ] Observation logs completed
- [ ] User journey map completed
- [ ] Research photographs / visual evidence added
- [ ] Problem statement linked to research findings
- [ ] Actual AI prompts recorded
- [ ] Adopted AI suggestions documented
- [ ] Rejected AI suggestions documented
- [ ] AI correction examples documented
- [ ] Prototype screenshots added
- [ ] Feedback from real testers collected where required
- [ ] Changes from tester feedback documented
- [ ] Final testing evidence recorded
- [ ] Installation instructions verified
- [ ] No secrets or personal information committed

---

# Conclusion

ScamCheck addresses a practical problem faced by students: determining whether unfamiliar job and internship opportunities deserve further investigation.

At the current **35% development milestone**, the project establishes its core architecture, application foundation, prototype, and initial verification capabilities. Further development will complete the remaining verification, validation, testing, and refinement stages.

By combining URL intelligence, evidence analysis, company and recruiter verification, OCR, threat intelligence, risk processing, and AI-assisted explanation, ScamCheck aims to provide a centralized and explainable verification workflow.

**Faster → More structured → More explainable → Easier to act on**

---

## Project Repository

https://github.com/Rishi-git-sys/Scamcheck
