import { App, Editor, TFile } from "obsidian";

function isImageFile(file: File): boolean {
	return file.type.startsWith("image/");
}

function buildBaseName(file: TFile | null): string {
	const now = new Date();
	const yyyy = String(now.getFullYear());
	const mm = String(now.getMonth() + 1).padStart(2, "0");
	const dd = String(now.getDate()).padStart(2, "0");
	const hh = String(now.getHours()).padStart(2, "0");
	const mi = String(now.getMinutes()).padStart(2, "0");
	const ss = String(now.getSeconds()).padStart(2, "0");
	const stem = file?.basename?.trim() ? file.basename.trim() : "note";
	return `${stem}-${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function guessExtension(file: File): string {
	const name = file.name || "";
	const ext = name.includes(".") ? name.split(".").pop() : "";
	if (ext) return ext.toLowerCase();
	if (file.type === "image/png") return "png";
	if (file.type === "image/jpeg") return "jpg";
	if (file.type === "image/gif") return "gif";
	if (file.type === "image/webp") return "webp";
	return "png";
}

export async function handleSmartImagePaste(app: App, editor: Editor, fileInfo: { file: TFile | null } | null, evt: ClipboardEvent): Promise<boolean> {
	const dt = evt.clipboardData;
	if (!dt) return false;

	let image: File | null = null;
	for (const item of Array.from(dt.items ?? [])) {
		if (item.kind !== "file") continue;
		const f = item.getAsFile();
		if (f && isImageFile(f)) {
			image = f;
			break;
		}
	}

	if (!image) return false;

	evt.preventDefault();
	evt.stopPropagation();

	const activeFile = fileInfo?.file ?? null;
	const base = buildBaseName(activeFile);
	const ext = guessExtension(image);
	const filename = `${base}.${ext}`;

	const targetPath = await app.fileManager.getAvailablePathForAttachment(filename, activeFile?.path);
	const data = await image.arrayBuffer();
	const created = await app.vault.createBinary(targetPath, data);

	editor.replaceSelection(`![[${created.path}]]`);
	return true;
}

