# ScamCheck

## AI-Assisted Job & Internship Opportunity Verification System

ScamCheck is an **individual web-based project** that helps students evaluate potentially suspicious job and internship opportunities before applying, making payments, or sharing sensitive information.

**Current development stage: 35%**

> ScamCheck is a decision-support system. Its results are indicators for further verification and are not a definitive guarantee that an opportunity is legitimate or fraudulent.

---

## Project Information

| Detail | Information |
|---|---|
| Project Type | Individual Project |
| Project Name | ScamCheck |
| Developer | Rishi R |
| Development Stage | 35% |
| Domain | AI + Cybersecurity |
| Target Users | Students and job/internship seekers |

---

## 1. Problem Statement

Students receive job and internship opportunities through career portals, professional networks, email, messaging platforms, and social media. Verifying company identity, recruiter information, links, opportunity content, and warning signals manually can be time-consuming and inconsistent.

**Problem:** Students need a simple and explainable way to evaluate unfamiliar job and internship opportunities before deciding whether to proceed.

---

## 2. Proposed Solution

ScamCheck brings multiple verification steps into one application. Users can provide opportunity information such as URLs, screenshots, text, or offer-letter evidence and receive a structured risk-oriented assessment.

### Main Verification Areas

- URL and domain analysis
- Company verification
- Recruiter verification
- Opportunity/content analysis
- Screenshot and evidence analysis
- OCR-based text extraction
- Threat intelligence
- Risk signal aggregation
- AI-assisted explanation
- Final report

---

## 3. Current Progress — 35%

The current milestone focuses on establishing the core project foundation and initial working prototype.

| Work Area | Status |
|---|---|
| Problem definition | ✅ Completed |
| Solution ideation | ✅ Completed |
| Project architecture | ✅ Completed |
| Next.js + TypeScript setup | ✅ Completed |
| Initial UI / prototype | ✅ Implemented |
| Authentication | ✅ Implemented |
| Dashboard | ✅ Implemented |
| URL analysis foundation | 🔄 In development |
| Evidence / OCR foundation | 🔄 In development |
| Company verification | 🔄 In development |
| Recruiter verification | 🔄 In development |
| Threat intelligence | 🔄 In development |
| Risk engine refinement | 🔄 In development |
| Final validation | ⏳ Pending |

The remaining work will focus on completing the verification pipeline, improving reliability, testing, and user validation.

---

## 4. System Workflow

```text
User
  |
  v
Evidence Intake
  |
  +----------------+----------------+
  |                |                |
  v                v                v
 URL           Screenshot          Text
  |                |                |
  v                v                v
URL Analysis      OCR        Content Analysis
  |                |                |
  +----------------+----------------+
                   |
                   v
        Company / Recruiter
            Verification
                   |
                   v
        Threat Intelligence
                   |
                   v
             Risk Engine
                   |
                   v
        AI-Assisted Explanation
                   |
                   v
             Final Report
```

---

## 5. Key Features

### URL Analysis

Analyzes submitted job or internship URLs and relevant domain signals.

### Evidence Analysis

Processes opportunity evidence supplied by the user.

### Company Verification

Checks available company-related information as part of the verification workflow.

### Recruiter Verification

Provides recruiter-related verification functionality.

### OCR

Uses Tesseract.js to extract text from supported screenshots and images.

### Threat Intelligence

Uses threat-intelligence and URL-intelligence modules to support investigation.

### Risk Engine

Combines available verification signals into a risk-oriented assessment.

### AI-Assisted Explanation

Uses AI to help explain structured analysis results rather than relying on AI alone for the final decision.

### Authentication

Uses Supabase for authentication and application data functionality.

---

## 6. Technical Architecture

### Application

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

### API Routes

```text
src/app/api/
├── analyze-ai/
├── analyze-evidence/
├── analyze-url/
└── verify-company/
```

### Core Modules

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

## 7. Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Web framework |
| React 19 | User interface |
| TypeScript 5 | Application development |
| Tailwind CSS 4 | Styling |
| Supabase | Authentication and data |
| Tesseract.js | OCR |
| Lucide React | Icons |
| ESLint 9 | Code quality |
| npm | Package management |
| Git / GitHub | Version control |

---

## 8. Project Structure

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

## 9. Installation

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

### Environment Variables

```bash
cp .env.example .env.local
```

Configure the required environment variables in `.env.local`.

> **Never commit API keys, passwords, tokens, or other secrets.**

### Run the Project

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## 10. Testing

The repository contains testing scripts for OCR and analysis flows:

```text
scripts/run-all-tests.ts
scripts/test-ocr.ts
scripts/test-ocr-all-scenarios.ts
scripts/test-server-ocr-flow.ts
scripts/test-tesseract-local.ts
scripts/verify-tesseract-paths.ts
```

### Initial Test Areas

- URL analysis
- Evidence analysis
- OCR
- Company verification
- Authentication
- Invalid input handling
- Risk analysis

Actual test results should be recorded from the latest test execution.

---

## 11. Prototype

The current prototype includes the main application flow:

- Landing page
- Login
- Signup
- Dashboard
- Opportunity checking
- Analysis result
- Report

Recommended screenshot directory:

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

## 12. Responsible AI and Security

### Responsible AI

- AI output is treated as assistance, not automatic evidence.
- Structured verification signals remain important.
- Unsupported AI claims should be verified or rejected.
- Human judgment remains necessary.

### Security and Privacy

- Keep secrets in environment variables.
- Do not commit production credentials.
- Avoid unnecessary personal information.
- Anonymize research participants before publication.
- Do not publish sensitive user evidence.

---

## 13. Limitations

- Results depend on the available evidence and external information.
- False positives and false negatives are possible.
- External data can change over time.
- OCR accuracy depends on image quality.
- AI-generated explanations can contain errors.
- ScamCheck cannot guarantee that an opportunity is genuine or fraudulent.

---

## 14. Future Enhancements

- Improved company and recruiter verification
- Expanded domain reputation intelligence
- Better document and screenshot analysis
- Multilingual OCR
- Browser extension
- Mobile application
- Community reporting
- Historical scam intelligence
- Improved testing and evaluation

---

## 15. Academic Documentation

Academic evidence should be maintained separately from this technical README when required.

```text
docs/
└── academic-submission.md
```

The academic documentation can contain genuine:

- User research
- Interview records
- Observation logs
- Ideation evidence
- Actual AI prompts and decisions
- Prototype screenshots
- Real tester feedback
- Validation results

> **Academic integrity:** Do not fabricate interviews, observations, tester feedback, photographs, or AI evidence.

---

## Conclusion

ScamCheck is an individual project currently at the **35% development milestone**. The current stage establishes the project architecture, application foundation, prototype, and initial verification capabilities.

The next development stages will focus on completing the verification workflow, improving the risk assessment, testing the system, and validating it with real users.

**Faster → More structured → More explainable → Easier to act on**

---

## Repository

https://github.com/Rishi-git-sys/Scamcheck
