
import { App, Modal, Setting } from "obsidian";

export interface TemplateMeta {
    name: string;
    description: string;
    type: "full" | "homepage" | "guardian";
}

export class SaveTemplateModal extends Modal {
    private result: TemplateMeta = {
        name: "",
        description: "",
        type: "full"
    };

    private onSubmit: (result: TemplateMeta) => void | Promise<void>;

    constructor(app: App, onSubmit: (result: TemplateMeta) => void | Promise<void>) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: "保存为新模板" });

        new Setting(contentEl)
            .setName("模板名称")
            .setDesc("给此配置起一个易于识别的名字")
            .addText(text => text
                .setPlaceholder("例如：我的沉浸式写作环境")
                .onChange(value => { this.result.name = value; })
            );

        new Setting(contentEl)
            .setName("描述")
            .setDesc("简单的备注")
            .addText(text => text
                .setPlaceholder("描述...")
                .onChange(value => { this.result.description = value; })
            );

        new Setting(contentEl)
            .setName("模板类型")
            .setDesc("选择保存的范围")
            .addDropdown(drop => drop
                .addOption("full", "全量备份 (所有设置)")
                .addOption("homepage", "仅 Homepage 配置")
                .addOption("guardian", "仅 Vault Guardian 规则")
                .setValue("full")
                .onChange(value => {
                    // Type assertion to specific union type instead of any
                    this.result.type = value as TemplateMeta["type"];
                })
            );

        const btnDiv = contentEl.createDiv({
            attr: { style: "margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;" }
        });

        new Setting(btnDiv)
            .addButton(btn => btn
                .setButtonText("取消")
                .onClick(() => this.close())
            )
            .addButton(btn => btn
                .setButtonText("保存")
                .setCta()
                .onClick(() => {
                    if (!this.result.name) {
                        new Setting(contentEl).setName("错误：名称不能为空").setDesc("").setClass("error-text");
                        return;
                    }
                    // Await the promise or mark as void to satisfy lint
                    void Promise.resolve(this.onSubmit(this.result));
                    this.close();
                })
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
