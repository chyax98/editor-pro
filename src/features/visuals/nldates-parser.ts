import { moment } from "obsidian";

export interface NLDateResult {
	date: moment.Moment;
	text: string; // 匹配到的原始文本
	formatted: string; // 格式化后的字符串
}

export class NLDateParser {
	/**
	 * 解析自然语言日期字符串
	 * @param input 例如 "今天", "下周三", "3天后"
	 * @param format 输出格式，默认 YYYY-MM-DD
	 */
	static parse(
		input: string,
		format: string = "YYYY-MM-DD",
	): NLDateResult | null {
		const text = input.trim().toLowerCase();
		const today = moment();
		let target: moment.Moment | null = null;

		// 1. 基础词汇
		if (["今天", "today", "now"].includes(text)) {
			target = today.clone();
		} else if (["明天", "tmr", "tomorrow"].includes(text)) {
			target = today.clone().add(1, "d");
		} else if (["后天", "dat"].includes(text)) {
			target = today.clone().add(2, "d");
		} else if (["昨天", "ytd", "yesterday"].includes(text)) {
			target = today.clone().subtract(1, "d");
		}

		// 2. 相对天数 (X天后, X days later)
		// Regex: (\d+)\s*(天|d)(后|later)?
		else if (/^(\d+)\s*(天|d)(后|later)?$/.test(text)) {
			const match = text.match(/^(\d+)/);
			if (match && match[1]) {
				const days = parseInt(match[1]);
				target = today.clone().add(days, "d");
			}
		}
		// X天前
		else if (/^(\d+)\s*(天|d)(前|ago)$/.test(text)) {
			const match = text.match(/^(\d+)/);
			if (match && match[1]) {
				const days = parseInt(match[1]);
				target = today.clone().subtract(days, "d");
			}
		}

		// 3. 星期 (周X, 下周X)
		// Chinese weekmap
		const weekMap: Record<string, number> = {
			一: 1,
			二: 2,
			三: 3,
			四: 4,
			五: 5,
			六: 6,
			日: 7,
			天: 7,
		};

		// 下周X
		if (text.startsWith("下周")) {
			const dayChar = text.replace("下周", "");
			if (weekMap[dayChar]) {
				const day = weekMap[dayChar];
				// Logic: Next week's day.
				// If today is Monday(1), next week Monday is +7
				// simple logic: add 7 days to today, then isoWeekday
				// Or: isoWeekday(day).add(1, 'w')
				target = today.clone().add(1, "w").isoWeekday(day);
			}
		}
		// 周X / 星期X (Target: upcoming day)
		else if (text.startsWith("周") || text.startsWith("星期")) {
			const dayChar = text.replace("周", "").replace("星期", "");
			if (weekMap[dayChar]) {
				const day = weekMap[dayChar];
				const currentDay = today.isoWeekday();

				// If target day > current day, it's this week.
				// If target day <= current day, it's next week? Or just passed?
				// Interpret as "Upcoming":
				if (day > currentDay) {
					target = today.clone().isoWeekday(day);
				} else {
					target = today.clone().add(1, "w").isoWeekday(day);
				}
			}
		}

		if (target) {
			return {
				date: target,
				text: input,
				formatted: target.format(format),
			};
		}

		return null;
	}
}
