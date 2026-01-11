import { requestUrl } from "obsidian";

export function isHttpUrl(text: string): boolean {
	const t = text.trim();
	if (!t) return false;
	if (/\s/.test(t)) return false;
	return /^https?:\/\/\S+$/i.test(t);
}

export function extractTitleFromClipboardHtml(html: string, url: string): string | null {
	try {
		const anchorMatch = html.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i);
		if (anchorMatch) {
			// If the href exists and doesn't match, ignore it.
			const hrefMatch = anchorMatch[0].match(/href\s*=\s*["']([^"']+)["']/i);
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
