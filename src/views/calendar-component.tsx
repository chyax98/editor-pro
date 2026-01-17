import * as React from "react";
import { App, moment } from "obsidian";

interface CalendarProps {
	app: App;
}

export const CalendarComponent: React.FC<CalendarProps> = ({ app }) => {
	const [currentDate, setCurrentDate] = React.useState(moment());
	const [dailyNotes, setDailyNotes] = React.useState<Set<string>>(new Set());

	// Effect to scan for existing daily notes
	React.useEffect(() => {
		const updateNotes = () => {
			const files = app.vault.getMarkdownFiles();
			const dates = new Set<string>();
			files.forEach((f) => {
				// Check if valid date
				if (moment(f.basename, "YYYY-MM-DD", true).isValid()) {
					dates.add(f.basename);
				}
			});
			setDailyNotes(dates);
		};

		updateNotes();
		// Register event listener for file changes
		// Use 'create' and 'delete'
		const onRef = app.vault.on("create", updateNotes);
		const onRef2 = app.vault.on("delete", updateNotes);
		// Also rename
		const onRef3 = app.vault.on("rename", updateNotes);

		return () => {
			app.vault.offref(onRef);
			app.vault.offref(onRef2);
			app.vault.offref(onRef3);
		};
	}, [app]);

	const daysInMonth = currentDate.daysInMonth();
	const firstDay = currentDate.clone().startOf("month");
	const startDayOfWeek = firstDay.day(); // 0 = Sunday

	const handlePrev = () =>
		setCurrentDate(currentDate.clone().subtract(1, "month"));
	const handleNext = () =>
		setCurrentDate(currentDate.clone().add(1, "month"));
	const handleToday = () => setCurrentDate(moment());

	const openDailyNote = async (day: number) => {
		const targetDate = currentDate.clone().date(day);
		const filename = targetDate.format("YYYY-MM-DD");
		const path = filename + ".md";

		// Try to find existing file
		const existing = app.metadataCache.getFirstLinkpathDest(filename, "");
		if (existing) {
			await app.workspace.getLeaf().openFile(existing);
		} else {
			// Create new in root (Simplified behavior)
			try {
				const newFile = await app.vault.create(
					path,
					`# ${targetDate.format("YYYY-MM-DD")}\n\n`,
				);
				await app.workspace.getLeaf().openFile(newFile);
			} catch (e) {
				console.error("Failed to create daily note", e);
			}
		}
	};

	const renderDays = () => {
		const days = [];
		// Empty slots
		for (let i = 0; i < startDayOfWeek; i++) {
			days.push(
				<div key={`empty-${i}`} className="calendar-day empty"></div>,
			);
		}
		// Days
		for (let i = 1; i <= daysInMonth; i++) {
			const dateStr = currentDate.clone().date(i).format("YYYY-MM-DD");
			const hasNote = dailyNotes.has(dateStr);
			const isToday = moment().format("YYYY-MM-DD") === dateStr;

			days.push(
				<div
					key={i}
					className={`calendar-day ${hasNote ? "has-note" : ""} ${isToday ? "is-today" : ""}`}
					onClick={() => {
						void openDailyNote(i);
					}}
				>
					<span>{i}</span>
					{hasNote && <div className="dot"></div>}
				</div>,
			);
		}
		return days;
	};

	return (
		<div className="editor-pro-calendar">
			<div className="calendar-header">
				<button onClick={handlePrev}>&lt;</button>
				<button onClick={handleToday} style={{ fontSize: "0.8em" }}>
					{currentDate.format("YYYY MMM")}
				</button>
				<button onClick={handleNext}>&gt;</button>
			</div>
			<div className="calendar-grid-header">
				<div>S</div>
				<div>M</div>
				<div>T</div>
				<div>W</div>
				<div>T</div>
				<div>F</div>
				<div>S</div>
			</div>
			<div className="calendar-grid">{renderDays()}</div>
		</div>
	);
};
