import { Editor } from 'obsidian';
import { CommandFeature, EditorProPlugin } from '../../core/FeatureRegistry';
import { transformEditorText, TextTransform } from '../editing/text-transformer';

/**
 * Text Transformer feature - Text transformation commands
 * P0 test coverage: ✅ (text-transformer.test.ts - 76 tests)
 */
export class TextTransformerFeature extends CommandFeature {
    readonly id = 'text-transformer';
    readonly name = 'Text Transformer (Text transformation commands)';

    protected registerCommands(plugin: EditorProPlugin): void {
        const settings = plugin.settings as { enableTextTransformer?: boolean };

        if (!settings.enableTextTransformer) {
            return;
        }

        const transforms: Array<{ id: string; name: string; type: TextTransform }> = [
            { id: 'text-transform-upper', name: '文本转换：大写 (Uppercase)', type: { type: 'upper' } },
            { id: 'text-transform-lower', name: '文本转换：小写 (Lowercase)', type: { type: 'lower' } },
            { id: 'text-transform-title', name: '文本转换：标题格式 (Title case)', type: { type: 'title' } },
            { id: 'text-transform-sentence', name: '文本转换：句首大写 (Sentence case)', type: { type: 'sentence' } },
            { id: 'text-transform-trim-lines', name: '文本转换：移除行尾空格 (Trim line ends)', type: { type: 'trim-lines' } },
            { id: 'text-transform-remove-blank-lines', name: '文本转换：移除空行 (Remove blank lines)', type: { type: 'remove-blank-lines' } },
            { id: 'text-transform-sort-lines-asc', name: '文本转换：排序行 (Sort lines asc)', type: { type: 'sort-lines' } },
            { id: 'text-transform-sort-lines-desc', name: '文本转换：倒序排序行 (Sort lines desc)', type: { type: 'sort-lines', descending: true } },
            { id: 'text-transform-join-lines', name: '文本转换：合并为一行 (Join lines)', type: { type: 'join-lines' } },
        ];

        for (const transform of transforms) {
            plugin.addCommand({
                id: transform.id,
                name: transform.name,
                editorCallback: (editor: Editor) => transformEditorText(editor, transform.type),
            });
        }
    }
}
