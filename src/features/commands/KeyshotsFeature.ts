import { Editor } from 'obsidian';
import { CommandFeature, EditorProPlugin } from '../../core/FeatureRegistry';
import { deleteLine, duplicateLine, moveLineDown, moveLineUp, selectLine } from '../editing/keyshots';

/**
 * Keyshots feature - IDE-like line operations
 * P0 test coverage: ✅ (keyshots.test.ts - 61 tests)
 */
export class KeyshotsFeature extends CommandFeature {
    readonly id = 'keyshots';
    readonly name = 'Keyshots (IDE-like line operations)';

    protected registerCommands(plugin: EditorProPlugin): void {
        const settings = plugin.settings as { enableKeyshots?: boolean };

        if (!settings.enableKeyshots) {
            return;
        }

        plugin.addCommand({
            id: 'move-line-up',
            name: '上移当前行 (Move Line Up)',
            editorCallback: (editor: Editor) => moveLineUp(editor)
        });
        plugin.addCommand({
            id: 'move-line-down',
            name: '下移当前行 (Move Line Down)',
            editorCallback: (editor: Editor) => moveLineDown(editor)
        });
        plugin.addCommand({
            id: 'duplicate-line',
            name: '向下复制当前行 (Duplicate Line)',
            editorCallback: (editor: Editor) => duplicateLine(editor)
        });
        plugin.addCommand({
            id: 'delete-line',
            name: '删除当前行 (Delete Line)',
            editorCallback: (editor: Editor) => deleteLine(editor)
        });
        plugin.addCommand({
            id: 'select-line',
            name: '选中当前行 (Select Line)',
            editorCallback: (editor: Editor) => selectLine(editor)
        });
    }
}
