import { requestUrl } from "obsidian";

/**
 * Check if a URL is safe to fetch.
 * Blocks private/local addresses to prevent SSRF attacks.
 */
function isSafeUrl(urlStr: string): boolean {
	try {
		const url = new URL(urlStr);

		// Only allow http and https protocols
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return false;
		}

		// Block private/local IPs (IPv4)
		const hostname = url.hostname;
		const privateIpPatterns = [
			/^127\./, // Loopback (127.0.0.0/8)
			/^10\./, // Private Class A (10.0.0.0/8)
			/^172\.(1[6-9]|2\d|3[01])\./, // Private Class B (172.16.0.0/12)
			/^192\.168\./, // Private Class C (192.168.0.0/16)
			/^169\.254\./, // Link-local (169.254.0.0/16)
			/^::1$/, // IPv6 loopback
			/^fc00:/i, // IPv6 private (fc00::/7)
			/^fe80:/i, // IPv6 link-local (fe80::/10)
			/^localhost$/i, // localhost hostname
			/^0\.0\.0\.0$/, // All interfaces
		];

		for (const pattern of privateIpPatterns) {
			if (pattern.test(hostname)) {
				return false;
			}
		}

		// Also block internal TLDs commonly used for development
		const internalTlds = [
			".local",
			".example",
			".test",
			".localhost",
			".invalid",
		];
		if (internalTlds.some((tld) => hostname.endsWith(tld))) {
			return false;
		}

		return true;
	} catch {
		// Invalid URL
		return false;
	}
}

export function isHttpUrl(text: string): boolean {
	const t = text.trim();
	if (!t) return false;
	if (/\s/.test(t)) return false;
	return /^https?:\/\/\S+$/i.test(t);
}

export function extractTitleFromClipboardHtml(
	html: string,
	url: string,
): string | null {
	try {
		const anchorMatch = html.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);
		if (anchorMatch) {
			// If the href exists and doesn't match, ignore it.
			const hrefMatch = anchorMatch[0].match(
				/href\s*=\s*["']([^"']+)["']/i,
			);
			const href = hrefMatch?.[1] ?? "";
			if (!href || href === url) {
				const raw = anchorMatch[1] ?? "";
				const text = raw.replace(/<[^>]+>/g, "").trim();
				if (text) return text;
			}
		}

		const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
		if (titleMatch) {
			const raw = titleMatch[1] ?? "";
			const text = raw.replace(/<[^>]+>/g, "").trim();
			return text || null;
		}

		return null;
	} catch {
		return null;
	}
}

export function sanitizeLinkTitle(title: string): string {
	return title.replace(/\s+/g, " ").trim();
}

export async function fetchPageTitle(url: string): Promise<string | null> {
	// SSRF protection: validate URL before fetching
	if (!isSafeUrl(url)) {
		return null;
	}

	try {
		const res = await requestUrl({ url, method: "GET", throw: false });
		const html = res.text ?? "";
		const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
		if (!m) return null;
		const raw = m[1] ?? "";
		const text = raw.replace(/<[^>]+>/g, "");
		const decoded = text
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&nbsp;/g, " ");
		const title = sanitizeLinkTitle(decoded);
		return title || null;
	} catch {
		return null;
	}
}
