import { App, Editor, TFile, Notice } from "obsidian";

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

async function handleSmartImagePasteImpl(app: App, editor: Editor, fileInfo: { file: TFile | null } | null, evt: ClipboardEvent): Promise<boolean> {
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

	let targetPath: string;
	try {
		targetPath = await app.fileManager.getAvailablePathForAttachment(filename, activeFile?.path);
	} catch (error) {
		console.error('[Editor Pro] Failed to get available path for attachment:', error);
		throw new Error('无法获取附件保存路径');
	}

	const data = await image.arrayBuffer();
	let created: TFile;
	try {
		created = await app.vault.createBinary(targetPath, data);
	} catch (error) {
		console.error('[Editor Pro] Failed to create image file:', error);
		throw new Error('创建图片文件失败');
	}

	editor.replaceSelection(`![[${created.path}]]`);
	return true;
}

export async function handleSmartImagePaste(app: App, editor: Editor, fileInfo: { file: TFile | null } | null, evt: ClipboardEvent): Promise<boolean> {
	try {
		return await handleSmartImagePasteImpl(app, editor, fileInfo, evt);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		new Notice(`Editor Pro：图片粘贴失败 - ${message}`);
		console.error('[Editor Pro] Image paste error:', error);
		return false;
	}
}
