import { App, TFile, Notice, parseFrontMatterTags } from "obsidian";

export class TagManager {
    constructor(private app: App) { }

    /**
     * Get all unique tags from the vault
     */
    getAllTags(): string[] {
        // Use obsidian internal API to get tag cache? 
        // app.metadataCache.getTags() returns Record<string, number>
        // Key includes hash like "#tag"
        // @ts-ignore
        const tagCache = this.app.metadataCache.getTags();
        return Object.keys(tagCache);
    }

    /**
     * Rename a tag globally
     * @param oldTag Full tag with hash, e.g. "#old"
     * @param newTag Full tag with hash, e.g. "#new"
     */
    async renameTag(oldTag: string, newTag: string) {
        const files = this.app.vault.getMarkdownFiles();
        let updatedCount = 0;

        // Clean tags (remove hash for comparison if needed, but cache has hash)
        // Ensure inputs start with #
        if (!oldTag.startsWith('#')) oldTag = '#' + oldTag;
        if (!newTag.startsWith('#')) newTag = '#' + newTag;

        // Iterate all files
        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (!cache) continue;

            // Check if file contains the tag
            // 1. Inline tags
            const hasInline = cache.tags?.some(t => t.tag === oldTag || t.tag.startsWith(oldTag + '/'));

            // 2. Frontmatter tags
            // MetadataCache.frontmatter tags are usually raw strings or arrays
            const frontmatterTags = parseFrontMatterTags(cache.frontmatter);
            const hasFrontmatter = frontmatterTags?.some(t => '#' + t === oldTag || ('#' + t).startsWith(oldTag + '/'));

            if (hasInline || hasFrontmatter) {
                await this.processFile(file, oldTag, newTag);
                updatedCount++;
            }
        }

        new Notice(`已重命名标签 ${oldTag} -> ${newTag} (涉及 ${updatedCount} 个文件)`);
    }

    private async processFile(file: TFile, oldTag: string, newTag: string) {
        const content = await this.app.vault.read(file);
        let newContent = content;

        // 1. Replace Inline Tags: #old -> #new
        // Regex needs to be careful: 
        // #old should match, #old/child should match (and become #new/child)
        // #oldshouldNOTmatch
        // So validation: #old(\s|$|[punctuation])

        // Escape regex special chars in tag name just in case
        const escapedOld = oldTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Regex for inline tags: 
        // Look for literal #old followed by word boundary or slash?
        // Actually, in Obsidian valid tag chars are limited.
        // But simply replacing strings is safer for maintaining context.

        // Strategy: 
        // Replace #old/ with #new/ (for nested)
        // Replace #old with #new (exact match or end of tag)

        // A simpler regex strategy:
        // Match `#old` where next char is NOT a valid tag char (unless it is /)
        // Valid tag chars: letter, number, underscore, hyphen, forward slash.
        // Wait, if it is forward slash, it is a nested child, so we SHOULD replace the prefix.

        // So: Match `#old`
        // We replace all occurrences of `oldTag` with `newTag`?
        // If I have #oldTag and #oldTagIsGreat
        // replacing #oldTag will break #oldTagIsGreat

        // So we need to match `#oldTag` followed by (non-tag-char OR slash)
        // Actually, if it is slash, we replace it too (prefix rename).
        // So we just need to ensure we don't match mid-word.
        // The start is # so it's fine.
        // The end must be checked.

        const regex = new RegExp(`(${escapedOld})(?![\\w\\u00C0-\\uFFFF-])`, 'g');
        // valid tag chars: alphanumeric, unicode, -, _, /
        // The lookahead should negate valid tag chars.
        // But wait!, `/` IS a valid tag char. 
        // If we want to rename `#parent` to `#newparent`, and we have `#parent/child`.
        // We match `#parent`. The next char is `/`.
        // If we exclude `/` from lookahead, then it matches.
        // `#parent` -> `#newparent/child`. Correct.

        // So lookahead should be: NOT (word char or - or _). / is allowed to follow.
        // Actually, if it is followed by _, it is a different tag.

        // Correct regex: replace `oldTag` if not followed by valid tag part chars (word, -, _). 
        // BUT `oldTag` itself might contain `/`. 

        newContent = newContent.replace(regex, newTag);

        // 2. Replace Frontmatter Tags
        // Frontmatter is tricky because it's YAML.
        // Ideally we use a YAML parser or standard replacement if format is standard.
        // But Obsidian users write YAML in many ways:
        // tags: tag1, tag2
        // tags: [tag1, tag2]
        // tags:
        //   - tag1

        // A simple text replacement might work if the tag name is unique enough? 
        // No, "tag1" without hash might appear in text.
        // Frontmatter tags usually don't have hash, unless user added it quotes.

        // Safer approach: Use `app.fileManager.processFrontMatter` API!
        // This is safe and robust.

        // So:
        // Step 1: Text replace for body (excluding frontmatter? or including?)
        // If we use string replace on body, we might accidentally touch frontmatter.
        // But `processFrontMatter` handles frontmatter.
        // We should ONLY do text replace on the BODY essentially.
        // But `vault.read()` gives full content.

        // Split content into Frontmatter and Body
        const cache = this.app.metadataCache.getFileCache(file);
        let bodyStart = 0;
        if (cache?.frontmatterPosition) {
            bodyStart = cache.frontmatterPosition.end.offset;
        }

        // Process Body
        const body = newContent.substring(bodyStart);
        const frontmatterPart = newContent.substring(0, bodyStart);

        const newBody = body.replace(regex, newTag);

        // We only modify file if body changed, OR if we plan to modify frontmatter.
        if (body !== newBody) {
            // We can't write partially.
            // We will combine them.
            newContent = frontmatterPart + newBody;
            await this.app.vault.modify(file, newContent);
        }

        // Process Frontmatter via API
        // Note: modify() above is async, might conflict with processFrontMatter if executed immediately?
        // Obsidian queues file writes?
        // Better to wait for modify to finish (we awaited).

        await this.app.fileManager.processFrontMatter(file, (fm) => {
            if (fm.tags) {
                // Determine raw name without hash
                const oldRaw = oldTag.substring(1); // "old"
                const newRaw = newTag.substring(1); // "new"

                const processArray = (arr: string[]) => {
                    return arr.map(t => {
                        if (t === oldRaw) return newRaw;
                        if (t.startsWith(oldRaw + '/')) return t.replace(oldRaw + '/', newRaw + '/');
                        return t;
                    });
                };

                if (Array.isArray(fm.tags)) {
                    fm.tags = processArray(fm.tags);
                } else if (typeof fm.tags === 'string') {
                    // "tag1, tag2"
                    // @ts-ignore
                    const arr = fm.tags.split(',').map((s: string) => s.trim());
                    const newArr = processArray(arr);
                    fm.tags = newArr; // API might convert it to list or comma string? 
                    // Usually API converts string list to array when modified.
                }
            }
        });
    }
}
