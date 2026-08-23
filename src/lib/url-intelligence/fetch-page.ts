import { FetchPageResult } from "./types";
import { validateAndNormalizeUrl } from "./validate-url";
import { extractTextFromHtml } from "./parse-page";

const MAX_FETCH_TIMEOUT_MS = 8000;
const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1 MB
const MAX_REDIRECTS = 3;

export async function safelyFetchPage(initialUrl: string): Promise<FetchPageResult> {
  let currentUrl = initialUrl;
  let redirectCount = 0;
  const redirectHosts: string[] = [];

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const validation = validateAndNormalizeUrl(currentUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        success: false,
        originalUrl: initialUrl,
        finalUrl: currentUrl,
        redirectCount,
        redirectHosts,
        https: currentUrl.startsWith("https://"),
        error: validation.error || "URL failed validation during navigation.",
      };
    }

    const targetUrl = validation.normalizedUrl;
    const parsed = new URL(targetUrl);
    redirectHosts.push(parsed.hostname);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        redirect: "manual", // Handle redirects manually for SSRF security and tracking
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ScamCheck/1.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeoutId);

      // Handle 3xx Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          return {
            success: false,
            originalUrl: initialUrl,
            finalUrl: targetUrl,
            redirectCount,
            redirectHosts,
            https: targetUrl.startsWith("https://"),
            statusCode: response.status,
            error: "Redirect location header missing.",
          };
        }

        // Resolve relative redirects
        const nextUrl = new URL(location, targetUrl).toString();
        redirectCount++;
        currentUrl = nextUrl;
        continue;
      }

      const contentType = (response.headers.get("content-type") || "").toLowerCase();

      // Check for non-HTML binary types
      const isHtml =
        contentType.includes("text/html") ||
        contentType.includes("application/xhtml+xml") ||
        contentType.includes("text/plain");

      if (!isHtml) {
        return {
          success: false,
          originalUrl: initialUrl,
          finalUrl: targetUrl,
          finalHostname: parsed.hostname,
          redirectCount,
          redirectHosts,
          https: targetUrl.startsWith("https://"),
          statusCode: response.status,
          contentType,
          error: "The submitted URL does not contain a directly analyzable HTML page.",
        };
      }

      // Stream content with max payload protection
      const reader = response.body?.getReader();
      if (!reader) {
        return {
          success: false,
          originalUrl: initialUrl,
          finalUrl: targetUrl,
          redirectCount,
          redirectHosts,
          https: targetUrl.startsWith("https://"),
          error: "Unable to read response body.",
        };
      }

      let totalBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_PAYLOAD_BYTES) {
            reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }

      const merged = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      const htmlContent = textDecoder.decode(merged);
      const extractedText = extractTextFromHtml(htmlContent);

      return {
        success: true,
        originalUrl: initialUrl,
        finalUrl: targetUrl,
        finalHostname: parsed.hostname,
        redirectCount,
        redirectHosts,
        https: targetUrl.startsWith("https://"),
        statusCode: response.status,
        contentType,
        html: htmlContent,
        extractedText,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isAbort = err.name === "AbortError";
      return {
        success: false,
        originalUrl: initialUrl,
        finalUrl: targetUrl,
        finalHostname: parsed.hostname,
        redirectCount,
        redirectHosts,
        https: targetUrl.startsWith("https://"),
        error: isAbort
          ? "Request timed out while connecting to the target page."
          : "Unable to establish a secure connection to the specified website.",
      };
    }
  }

  return {
    success: false,
    originalUrl: initialUrl,
    finalUrl: currentUrl,
    redirectCount,
    redirectHosts,
    https: currentUrl.startsWith("https://"),
    error: "Too many redirects encountered during verification.",
  };
}
