export class Editor {
  private content: string[];
  private cursor: { line: number; ch: number };
  private selection: { from: { line: number; ch: number }; to: { line: number; ch: number } } | null;

  constructor(initialContent: string = '') {
    this.content = initialContent.split('\n');
    this.cursor = { line: 0, ch: 0 };
    this.selection = null;
  }

  getSelection(): string {
    if (!this.selection) return '';
    
    if (this.selection.from.line === this.selection.to.line) {
        return this.content[this.selection.from.line].substring(this.selection.from.ch, this.selection.to.ch);
    }
    
    const lines = [];
    lines.push(this.content[this.selection.from.line].substring(this.selection.from.ch));
    for (let i = this.selection.from.line + 1; i < this.selection.to.line; i++) {
        lines.push(this.content[i]);
    }
    lines.push(this.content[this.selection.to.line].substring(0, this.selection.to.ch));
    
    return lines.join('\n');
  }

  replaceSelection(text: string): void {
      if (!this.selection) {
          // Insert at cursor
          const line = this.content[this.cursor.line];
          this.content[this.cursor.line] = line.slice(0, this.cursor.ch) + text + line.slice(this.cursor.ch);
          
          // If text contains newlines, we need to split the current line
          if (text.includes('\n')) {
              // Re-read the modified line and split it
              const allLines = this.content.join('\n').split('\n');
              this.content = allLines;
              // Updating cursor logic for multiline insert is complex, simplifying:
              this.cursor.ch += text.length; 
          } else {
             this.cursor.ch += text.length;
          }
      } else {
          // Replace selection
          const prefix = this.content[this.selection.from.line].substring(0, this.selection.from.ch);
          const suffix = this.content[this.selection.to.line].substring(this.selection.to.ch);
          
          const newText = prefix + text + suffix;
          const newLines = newText.split('\n');
          
          // Replace lines from 'from' to 'to' with 'newLines'
          this.content.splice(
              this.selection.from.line, 
              this.selection.to.line - this.selection.from.line + 1, 
              ...newLines
          );
          
          // Reset selection and cursor
          this.selection = null;
          // Set cursor to end of inserted text
          const lastInsertedLineIndex = this.selection ? 0 : (this.content.length - 1); // Fallback
          // Actually determining the exact cursor position after multiline replace is tricky in mock,
          // but for now we just need the CONTENT to be correct for tests.
          this.cursor = { line: 0, ch: 0 }; 
      }
  }

  getCursor(pos?: 'from' | 'to' | 'start' | 'end' | 'head'): { line: number; ch: number } {
      if (pos === 'from' && this.selection) {
          return { ...this.selection.from };
      }
      if (pos === 'to' && this.selection) {
          return { ...this.selection.to };
      }
      return { ...this.cursor };
  }

  setCursor(pos: { line: number; ch: number }): void {
      this.cursor = { ...pos };
  }

  somethingSelected(): boolean {
      return this.selection !== null;
  }

  getLine(line: number): string {
    return this.content[line] || '';
  }

  setLine(line: number, text: string): void {
      if (line >= 0 && line < this.content.length) {
          this.content[line] = text;
      }
  }

  lineCount(): number {
      return this.content.length;
  }

  setSelection(from: { line: number; ch: number }, to?: { line: number; ch: number }): void {
      this.selection = { from, to: to || from };
      // Also update cursor to the end of selection
      this.cursor = { ...to || from };
  }

  exec(command: string): void {
      // Mock implementation for toggleFold and other commands
      // For testing purposes, we just track that it was called
  }

  transaction(tx: any, origin?: string): void {
      // Mock implementation for transaction API
      // For replaceSelection
      if (tx.replaceSelection !== undefined) {
          this.replaceSelection(tx.replaceSelection);
      }
      // For changes
      if (tx.changes && Array.isArray(tx.changes)) {
          for (const change of tx.changes) {
              this.replaceRange(change.text, change.from, change.to);
          }
      }
      // For selection
      if (tx.selection) {
          this.setSelection(tx.selection.from, tx.selection.to);
      }
  }

  replaceRange(text: string, from: { line: number; ch: number }, to?: { line: number; ch: number }): void {
      const end = to || from;

      if (from.line === end.line) {
          // Single-line replacement
          const line = this.content[from.line];
          this.content[from.line] = line.slice(0, from.ch) + text + line.slice(end.ch);
      } else {
          // Multi-line replacement
          const newLines = text.split('\n');

          // Get the prefix of the first line (before from.ch)
          const firstLinePrefix = this.content[from.line].slice(0, from.ch);

          // Get the suffix of the last line (after end.ch)
          const lastLineSuffix = this.content[end.line].slice(end.ch);

          // Replace the range from from.line to end.line with new content
          const replacement = [...newLines];
          replacement[0] = firstLinePrefix + replacement[0];
          replacement[replacement.length - 1] = replacement[replacement.length - 1] + lastLineSuffix;

          // Splice the replacement into the content
          this.content.splice(from.line, end.line - from.line + 1, ...replacement);
      }
  }

  // Test helpers
  _setText(text: string) {
      this.content = text.split('\n');
  }
  _getText() {
      return this.content.join('\n');
  }
  _setSelection(from: { line: number, ch: number }, to: { line: number, ch: number }) {
      this.selection = { from, to };
  }
  _setCursor(line: number, ch: number) {
      this.cursor = { line, ch };
  }
}

export class Plugin {}
export class TFile {
  path: string;
  basename: string;
  extension: string;
  constructor(path: string) {
    this.path = path;
    this.basename = path.split('/').pop()?.split('.')[0] || '';
    this.extension = path.split('.').pop() || '';
  }
}

export class Vault {
  listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return { detach: () => {} }; // Dummy EventRef
  }

  trigger(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }
}

export class FileManager {
  async processFrontMatter(file: TFile, fn: (frontmatter: any) => void) {
    // Mock implementation: just call the function with a dummy object
    // In a real test, we might inspect this object
    const frontmatter = {}; 
    fn(frontmatter);
    return Promise.resolve();
  }
}

export class App {
  vault: Vault;
  fileManager: FileManager;
  workspace: any;

  constructor() {
    this.vault = new Vault();
    this.fileManager = new FileManager();
    this.workspace = {
        on: () => ({ detach: () => {} }),
        getActiveViewOfType: () => null
    };
  }
}

export class Notice {
    constructor(message: string) {}
}

export function debounce(func: Function, wait: number, immediate?: boolean) {
    return func; // Execute immediately for tests
}

export class PluginSettingTab {}
export class Setting {}
export class MarkdownView {}
