export interface InfographicTemplate {
	id: string;
	name: string;
	aliases?: string[];
	body: string;
}

export const INFOGRAPHIC_TEMPLATES: InfographicTemplate[] = [
	{
		id: "list-row-simple-horizontal-arrow",
		name: "流程：横向箭头步骤",
		aliases: ["process", "steps", "lc"],
		body: [
			"infographic list-row-simple-horizontal-arrow",
			"data",
			"  title Getting Started",
			"  items",
			"    - label Step 1",
			"      desc Install dependencies",
			"    - label Step 2",
			"      desc Configure settings",
			"    - label Step 3",
			"      desc Run the app",
		].join("\n"),
	},
	{
		id: "sequence-timeline-simple",
		name: "时间线：Timeline",
		aliases: ["timeline", "time", "tl"],
		body: [
			"infographic sequence-timeline-simple",
			"data",
			"  title Project timeline",
			"  items",
			"    - label Week 1",
			"      desc Kickoff",
			"    - label Week 2",
			"      desc Build MVP",
			"    - label Week 3",
			"      desc Ship",
		].join("\n"),
	},
	{
		id: "chart-column-simple",
		name: "图表：柱状图（Column chart）",
		aliases: ["chart", "bar", "column", "zz"],
		body: [
			"infographic chart-column-simple",
			"data",
			"  title Quarterly sales",
			"  items",
			"    - label Q1",
			"      value 120",
			"    - label Q2",
			"      value 200",
			"    - label Q3",
			"      value 150",
			"    - label Q4",
			"      value 260",
		].join("\n"),
	},
	{
		id: "hierarchy-tree-tech-style-rounded-rect-node",
		name: "层级：组织结构树（Hierarchy tree）",
		aliases: ["hierarchy", "tree", "org", "zzjg"],
		body: [
			"infographic hierarchy-tree-tech-style-rounded-rect-node",
			"data",
			"  title Organization",
			"  items",
			"    - label CEO",
			"      children",
			"        - label Product",
			"          children",
			"            - label Design",
			"            - label Engineering",
			"        - label Marketing",
			"        - label Sales",
		].join("\n"),
	},
];

