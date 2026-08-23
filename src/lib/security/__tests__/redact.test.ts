/**
 * Sensitive Data Redaction Unit Tests
 * Run with: npx tsx src/lib/security/__tests__/redact.test.ts
 */

import { redactSensitiveData, redactEvidenceObject } from "../redact";

export function runRedactTests(): boolean {
  console.log("--- Running Sensitive Data Redaction Unit Tests ---");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ Passed: ${testName}`);
    } else {
      console.error(`✗ Failed: ${testName}`);
    }
  }

  // 1. Aadhaar Redaction
  {
    const raw = "Send your Aadhaar 1234 5678 9012 to proceed with registration.";
    const result = redactSensitiveData(raw);
    assert(!result.redactedText.includes("1234 5678 9012"), "Aadhaar: Number is stripped");
    assert(result.redactedText.includes("[REDACTED-AADHAAR]"), "Aadhaar: Replaced with token");
    assert(result.hasRedactions === true, "Aadhaar: hasRedactions is true");
    assert(result.redactedCategories.includes("Aadhaar"), "Aadhaar: Category logged");
  }

  // 2. PAN Redaction
  {
    const raw = "My PAN card is ABCDE1234F for verification.";
    const result = redactSensitiveData(raw);
    assert(!result.redactedText.includes("ABCDE1234F"), "PAN: Card number is stripped");
    assert(result.redactedText.includes("[REDACTED-PAN]"), "PAN: Replaced with token");
    assert(result.redactedCategories.includes("PAN"), "PAN: Category logged");
  }

  // 3. Bank Account Number Redaction
  {
    const raw = "Transfer to account: 9876543210123 for fees.";
    const result = redactSensitiveData(raw);
    assert(!result.redactedText.includes("9876543210123"), "Bank Account: Number is stripped");
    assert(result.hasRedactions === true, "Bank Account: Redaction detected");
  }

  // 4. OTP and PIN Redaction
  {
    const raw = "Please send the verification OTP: 849201 to recruiter.";
    const result = redactSensitiveData(raw);
    assert(!result.redactedText.includes("849201"), "OTP: Code is stripped");
    assert(result.hasRedactions === true, "OTP: Redaction detected");
  }

  // 5. Password Redaction
  {
    const raw = "Login with password: SecretP@ssword123 to portal.";
    const result = redactSensitiveData(raw);
    assert(!result.redactedText.includes("SecretP@ssword123"), "Password: Cleartext password is stripped");
    assert(result.hasRedactions === true, "Password: Redaction detected");
  }

  // 6. Non-sensitive Text Passes Unaltered
  {
    const raw = "Software Engineer Intern at Microsoft with stipend ₹25,000.";
    const result = redactSensitiveData(raw);
    assert(result.redactedText === raw, "Clean Text: Left unaltered");
    assert(result.hasRedactions === false, "Clean Text: hasRedactions is false");
  }

  // 7. Object Redaction
  {
    const obj = {
      title: "Data Entry",
      content: "Send Aadhaar 9999 8888 7777 and PAN ABCDE9999Z",
      contact: "recruiter@gmail.com",
    };
    const redactedObj = redactEvidenceObject(obj);
    assert(!redactedObj.content.includes("9999 8888 7777"), "Object Redaction: Strips nested Aadhaar");
    assert(!redactedObj.content.includes("ABCDE9999Z"), "Object Redaction: Strips nested PAN");
    assert(redactedObj.contact === "recruiter@gmail.com", "Object Redaction: Preserves contact email");
  }

  console.log(`\n--- Results: ${passed}/${total} tests passed ---`);
  return passed === total;
}

runRedactTests();
