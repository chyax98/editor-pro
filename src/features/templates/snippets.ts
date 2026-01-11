export interface BuiltinTemplateSnippet {
	id: string;
	name: string;
	aliases: string[];
	template: string;
}

export const BUILTIN_TEMPLATES: BuiltinTemplateSnippet[] = [
	{
		id: "tpl-meeting",
		name: "模板：会议记录 (Meeting notes)",
		aliases: ["meeting", "hy", "hyl", "huiyi"],
		template: `# Meeting - {{date}}

Attendees: {{cursor}}

## Agenda
- 

## Notes
- 

## Action items
- [ ] 
`,
	},
	{
		id: "tpl-project",
		name: "模板：项目计划 (Project plan)",
		aliases: ["project", "xm", "jh"],
		template: `# Project - {{fileName}}

Created: {{now}}

## Goals
- {{cursor}}

## Tasks
- [ ] 

## Risks
- 
`,
	},
];

