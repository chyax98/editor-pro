/**
 * @jest-environment jsdom
 */
import { App, DataAdapter } from "obsidian";
import { TemplateManagerRenderer } from "../src/features/templates/template-manager-renderer";
import EditorProPlugin from "../src/main";
import { UserTemplate } from "../src/config";

// Jest will use __mocks__/obsidian.ts automatically

// Polyfill Obsidian's HTMLElement extensions
declare global {
    interface HTMLElement {
        empty(): void;
        addClass(...classes: string[]): void;
        createDiv(o?: any): HTMLElement;
        createEl(tag: string, o?: any, callback?: (el: HTMLElement) => void): HTMLElement;
    }
}

HTMLElement.prototype.empty = function () {
    this.innerHTML = "";
};

HTMLElement.prototype.addClass = function (...classes: string[]) {
    this.classList.add(...classes);
};

HTMLElement.prototype.createDiv = function (o?: any) {
    return this.createEl("div", o);
};

HTMLElement.prototype.createEl = function (tag: string, o?: any, callback?: (el: HTMLElement) => void) {
    const el = document.createElement(tag);
    if (o?.cls) {
        if (Array.isArray(o.cls)) el.classList.add(...o.cls);
        else el.className = o.cls;
    }
    if (o?.text) el.textContent = o.text;
    if (o?.attr) {
        for (const key in o.attr) {
            if (key === 'style') el.setAttribute('style', o.attr[key]);
            else el.setAttribute(key, String(o.attr[key]));
        }
    }
    this.appendChild(el);
    if (callback) callback(el);
    return el;
};

describe("TemplateManagerRenderer", () => {
    let app: App;
    let plugin: EditorProPlugin;
    let renderer: TemplateManagerRenderer;
    let container: HTMLElement;
    let adapter: DataAdapter;
    let renderCallback: jest.Mock;

    beforeEach(() => {
        app = new App();
        adapter = app.vault.adapter; // From our updated mock
        plugin = {
            settings: {}, // No longer has userTemplates
            manifest: { id: "editor-pro" },
            saveSettings: jest.fn().mockResolvedValue(undefined)
        } as unknown as EditorProPlugin;
        renderCallback = jest.fn();

        container = document.createElement("div");
        renderer = new TemplateManagerRenderer(app, plugin, renderCallback);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should handle missing presets folder gracefully", async () => {
        // Setup: Folder does NOT exist
        jest.spyOn(adapter, "exists").mockResolvedValue(false);
        const mkdirSpy = jest.spyOn(adapter, "mkdir").mockResolvedValue(undefined);
        // List returns empty
        jest.spyOn(adapter, "list").mockResolvedValue({ files: [], folders: [] });

        await renderer.render(container);

        // Assert: mkdir should NOT be called (lazy init)
        expect(mkdirSpy).not.toHaveBeenCalled();
        // Assert: Container shows empty state
        expect(container.textContent).toContain("暂无保存的模板");
    });

    test("should list and render templates from file system", async () => {
        const mockTemplate: UserTemplate = {
            id: "1234567890",
            name: "My Custom Template",
            type: "full",
            data: { enableHomepage: true },
            created: Date.now(),
            description: "A test description"
        };
        const mockJson = JSON.stringify(mockTemplate);
        const mockPath = ".obsidian/plugins/editor-pro/presets/my_custom_template.json";

        // Setup: Folder exists, List returns 1 file, Read returns content
        jest.spyOn(adapter, "exists").mockResolvedValue(true);
        jest.spyOn(adapter, "list").mockResolvedValue({
            files: [mockPath],
            folders: []
        });
        jest.spyOn(adapter, "read").mockImplementation(async (path) => {
            if (path === mockPath) return mockJson;
            return "";
        });

        await renderer.render(container);

        // Assert: Read was called
        expect(adapter.read).toHaveBeenCalledWith(mockPath);

        // Assert: UI renders the template card
        const cardText = container.textContent || "";
        expect(cardText).toContain("My Custom Template");
        expect(cardText).toContain("全量"); // Type label
        expect(cardText).toContain("A test description");
    });

    test("should verify integrity of loaded JSON files", async () => {
        const invalidJson = "{ invalid: json ";
        const invalidPath = "presets/bad.json";
        const validPath = "presets/good.json";
        const validTemplate: UserTemplate = {
            id: "1", name: "Valid", type: "homepage", data: {}, created: 0, description: ""
        };

        jest.spyOn(adapter, "exists").mockResolvedValue(true);
        jest.spyOn(adapter, "list").mockResolvedValue({
            files: [invalidPath, validPath],
            folders: []
        });
        jest.spyOn(adapter, "read").mockImplementation(async (path) => {
            if (path === invalidPath) return invalidJson;
            if (path === validPath) return JSON.stringify(validTemplate);
            return "";
        });

        const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => { });

        await renderer.render(container);

        // Should handle error gracefully without crashing
        expect(container.textContent).toContain("Valid");
        expect(consoleSpy).toHaveBeenCalled(); // Warn about bad json
    });
});
