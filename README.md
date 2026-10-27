# ScamCheck — Job & Internship Verification

ScamCheck helps students and job seekers assess suspicious job offers, internships, recruiters, and application links before paying fees or sharing sensitive information. It organizes available evidence and risk indicators into a structured assessment.

> **Disclaimer:** ScamCheck supports decisions; it cannot guarantee an opportunity is genuine or fraudulent. Verify important findings with trusted sources.

## Project Overview

- **Type:** Individual web application
- **Developer:** Rishi R
- **Domain:** AI-assisted opportunity verification
- **Users:** Students, graduates, and job/internship seekers
- **Status:** Core application and prototype established; verification capabilities remain in development

## 1. Problem Statement

Fraudulent job and internship offers appear on social media, messaging apps, email, and job portals. Applicants may be pressured to pay registration or training fees, open suspicious links, or disclose personal and financial information. Manually checking a company, recruiter, website, and offer can be difficult and time-consuming.

ScamCheck aims to make these checks easier by organizing opportunity evidence and risk indicators in one workflow.

## 2. Proposed Solution

Users can submit opportunity details such as a URL, pasted text, or supported screenshot. The application processes available evidence and presents findings to help users identify warning signs and decide what to verify next.

Planned verification areas:
- URL and domain analysis
- Opportunity text and offer-letter evidence
- OCR text extraction from screenshots
- Company and recruiter information
- Threat-intelligence signals where available
- Risk-signal aggregation and AI-assisted explanation
- Structured analysis reports

Accuracy depends on supplied evidence, external information, and implemented functionality.

## 3. Objectives

1. Help users recognize common warning signs in job and internship offers.
2. Organize multiple evidence types in a single workflow.
3. Explain risk indicators in understandable language.
4. Encourage verification through official company websites and trusted contact channels.
5. Handle user evidence and configuration data responsibly.

## 4. System Workflow

1. **Submit evidence:** Provide a URL, text, or supported screenshot.
2. **Process input:** Validate the input and extract relevant information; supported images may use OCR.
3. **Analyze signals:** Available URL, content, company, recruiter, and threat-intelligence checks contribute to the assessment.
4. **Assess risk:** Combine available indicators into a risk-oriented result.
5. **Explain findings:** AI-assisted output may summarize findings and suggest verification steps.
6. **Review report:** Independently confirm important claims before taking action.

## 5. Key Modules

- **URL analysis:** Examines submitted links and domain indicators.
- **Evidence analysis:** Processes supplied opportunity text or evidence where supported.
- **OCR:** Uses Tesseract.js to extract text from supported images.
- **Company verification:** Supports investigation of company information.
- **Recruiter verification:** Organizes recruiter-related checks.
- **Threat intelligence:** Supports relevant reputation or threat signals.
- **Risk engine:** Aggregates available indicators into a risk-oriented assessment.
- **AI-assisted explanation:** Explains findings but does not replace verification.
- **Authentication and data:** Supabase libraries support authentication and data integration.

Some modules remain under development. Their presence in the design does not mean every check is complete or independently validated.

## 6. Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Web framework and API routes |
| React 19 | User interface |
| TypeScript 5 | Typed application code |
| Tailwind CSS 4 | Styling |
| Supabase | Authentication and data services |
| Tesseract.js | OCR and image text extraction |
| Lucide React | Interface icons |
| ESLint 9 | Code linting |
| npm | Dependency management |
| Git and GitHub | Version control |

## 8. Installation and Execution

**Prerequisites:** Node.js LTS, npm, Git, and a Supabase project with required environment values.

Clone and install:

```bash
git clone https://github.com/Rishi-git-sys/Scamcheck.git
cd Scamcheck
npm install
```

Create a local environment file in Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Set the required values in `.env.local` using your Supabase configuration and any credentials needed by enabled features. Never commit API keys, passwords, access tokens, or production secrets.

Start development:

```bash
npm run dev
```

Build and run:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

Testing should cover valid and invalid inputs, inaccessible URLs, low-quality screenshots, OCR extraction, missing configuration, authentication, error handling, and consistent risk explanations. Record results only after executing the scripts; the existence of a test script does not mean it passed.

## 10. Security, Privacy, and Responsible AI

- Keep secrets in environment variables or a secrets manager.
- Validate and safely handle user input.
- Avoid collecting unnecessary personal information.
- Protect private evidence; do not publish sensitive screenshots or offer letters.
- Treat external data and AI summaries as untrusted until checked.
- Explain contributing risk signals where possible.
- Handle unavailable evidence and external services clearly.
- Do not label a company or person fraudulent based on one weak indicator.

## 10. Limitations

Results depend on supplied evidence, the quality of external information, and implemented modules. OCR may misread text. Legitimate opportunities may trigger warnings, while fraudulent ones may evade detection. Company details and domains can change, and AI explanations can be wrong. ScamCheck cannot guarantee an opportunity is safe or fraudulent.

## 11. Future Improvements

- Complete and test the verification pipeline
- Improve company and recruiter evidence checks
- Expand domain reputation and threat-intelligence sources
- Improve screenshot and document extraction
- Make risk factors more transparent
- Add multilingual support where feasible
- Strengthen testing and gather genuine user feedback
- Consider a browser extension or mobile-friendly workflow
- Add privacy-conscious historical and community reporting

## Conclusion

ScamCheck aims to help students evaluate opportunities through a structured and explainable workflow. It is intended to surface warning signs, organize evidence, and guide users toward further checks—not to make unqualified claims about legitimacy. Continued implementation, testing, and user validation are necessary before relying on results in real-world decisions.

**Repository:** https://github.com/Rishi-git-sys/Scamcheck
