import { Editor } from 'obsidian';
import { CommandFeature, EditorProPlugin } from '../../core/FeatureRegistry';
import { smartToggle } from '../formatting/smart-toggle';

/**
 * Smart Toggle feature - Intelligent markdown formatting toggle
 * P0 test coverage: Partial (smart-toggle.test.ts exists)
 */
export class SmartToggleFeature extends CommandFeature {
    readonly id = 'smart-toggle';
    readonly name = 'Smart Toggle (Intelligent markdown formatting)';

    protected registerCommands(plugin: EditorProPlugin): void {
        const settings = plugin.settings as { enableSmartToggle?: boolean };

        if (!settings.enableSmartToggle) {
            return;
        }

        const formats = [
            { id: 'smart-bold', marker: '**', name: 'Bold', errorMsg: '加粗失败' },
            { id: 'smart-italic', marker: '*', name: 'Italic', errorMsg: '斜体失败' },
            { id: 'smart-strikethrough', marker: '~~', name: 'Strikethrough', errorMsg: '删除线失败' },
            { id: 'smart-highlight', marker: '==', name: 'Highlight', errorMsg: '高亮失败' },
            { id: 'smart-code', marker: '`', name: 'Code', errorMsg: '行内代码失败' },
        ] as const;

        for (const format of formats) {
            const nameMap: Record<string, string> = {
                'Bold': '加粗',
                'Italic': '斜体',
                'Strikethrough': '删除线',
                'Highlight': '高亮',
                'Code': '行内代码',
            };
            const chineseName = nameMap[format.name] || format.name;

            plugin.addCommand({
                id: format.id,
                name: `智能${chineseName}`,
                editorCallback: (editor: Editor) => {
                    // Safe execute wrapper could be added here
                    smartToggle(editor, { marker: format.marker, name: format.name });
                },
            });
        }
    }
}
