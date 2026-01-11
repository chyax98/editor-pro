import React from "react";
import { App, Menu } from "obsidian";
import { BoardCard, BoardColumn, BoardData } from "../features/board/board-model";
import { ConfirmModal, TextPromptModal } from "../ui/modals";
import { CardModal } from "./card-modal";

type DragState =
	| { type: "card"; cardId: string }
	| { type: "none" };

function getDueBadge(dueDate: string | null): { label: string; cls: string } | null {
	if (!dueDate) return null;
	const iso = `${dueDate}T00:00:00`;
	const time = Date.parse(iso);
	if (Number.isNaN(time)) return { label: dueDate, cls: "invalid" };

	const due = new Date(time);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

	if (dueDay.getTime() < today.getTime()) return { label: dueDate, cls: "overdue" };
	if (dueDay.getTime() === today.getTime()) return { label: dueDate, cls: "today" };
	return { label: dueDate, cls: "upcoming" };
}

function getCardsInColumn(data: BoardData, columnId: string): BoardCard[] {
	const indexById = new Map<string, number>();
	data.cards.forEach((c, i) => indexById.set(c.id, i));

	return data.cards
		.filter((c) => c.columnId === columnId)
		.slice()
		.sort((a, b) => {
			const ao = a.order ?? Number.POSITIVE_INFINITY;
			const bo = b.order ?? Number.POSITIVE_INFINITY;
			if (ao !== bo) return ao - bo;
			return (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0);
		});
}

function normalizeColumnOrder(data: BoardData, columnId: string): BoardData {
	const inCol = getCardsInColumn(data, columnId);
	if (inCol.length === 0) return data;

	const nextCards = data.cards.map((c) => ({ ...c }));
	const cardById = new Map(nextCards.map((c) => [c.id, c] as const));

	inCol.forEach((card, idx) => {
		const target = cardById.get(card.id);
		if (target) target.order = idx;
	});

	return { ...data, cards: nextCards };
}

function moveCardToColumn(data: BoardData, cardId: string, toColumnId: string): BoardData {
	const card = data.cards.find((c) => c.id === cardId);
	if (!card) return data;

	const fromColumnId = card.columnId;
	if (fromColumnId === toColumnId) return data;

	const maxOrder = Math.max(
		-1,
		...data.cards
			.filter((c) => c.columnId === toColumnId)
			.map((c) => c.order ?? -1),
	);

	const nextCards = data.cards.map((c) =>
		c.id === cardId ? { ...c, columnId: toColumnId, order: maxOrder + 1 } : c,
	);

	return normalizeColumnOrder({ ...data, cards: nextCards }, toColumnId);
}

function moveCardBefore(data: BoardData, cardId: string, targetCardId: string): BoardData {
	if (cardId === targetCardId) return data;

	const card = data.cards.find((c) => c.id === cardId);
	const target = data.cards.find((c) => c.id === targetCardId);
	if (!card || !target) return data;

	// If cross-column, first move to the target column.
	let next = data;
	if (card.columnId !== target.columnId) {
		next = moveCardToColumn(next, cardId, target.columnId);
	}

	const columnId = target.columnId;
	const ordered = getCardsInColumn(next, columnId);
	const filtered = ordered.filter((c) => c.id !== cardId);
	const insertIndex = Math.max(0, filtered.findIndex((c) => c.id === targetCardId));
	filtered.splice(insertIndex, 0, { ...card, columnId });

	const nextCards = next.cards.map((c) => ({ ...c }));
	const cardById = new Map(nextCards.map((c) => [c.id, c] as const));
	filtered.forEach((c, idx) => {
		const ref = cardById.get(c.id);
		if (ref) {
			ref.columnId = columnId;
			ref.order = idx;
		}
	});

	return { ...next, cards: nextCards };
}

export function BoardApp(props: {
	app: App;
	data: BoardData;
	onChange: (next: BoardData) => void;
}) {
	const { app, data, onChange } = props;
	const [drag, setDrag] = React.useState<DragState>({ type: "none" });
	const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
	const [dragOverCardId, setDragOverCardId] = React.useState<string | null>(null);
	const isDragging = drag.type === "card";

	const columns = data.columns;

	const addColumn = React.useCallback(() => {
		new TextPromptModal(app, {
			title: "列表名称",
			placeholder: "例如：待办",
			submitText: "创建",
			onSubmit: (name) => {
				onChange({
					...data,
					columns: [...data.columns, { id: `col-${Date.now()}`, name }],
				});
			},
		}).open();
	}, [app, data, onChange]);

	const renameColumn = React.useCallback(
		(column: BoardColumn) => {
			new TextPromptModal(app, {
				title: "重命名列表",
				initialValue: column.name,
				submitText: "保存",
				onSubmit: (name) => {
					onChange({
						...data,
						columns: data.columns.map((c) => (c.id === column.id ? { ...c, name } : c)),
					});
				},
			}).open();
		},
		[app, data, onChange],
	);

	const deleteColumn = React.useCallback(
		(column: BoardColumn) => {
			new ConfirmModal(app, {
				title: "删除列表",
				message: `确定要删除列表“${column.name}”吗？该列表下的卡片也会被删除。`,
				confirmText: "删除",
				cancelText: "取消",
				onConfirm: () => {
					const remainingCols = data.columns.filter((c) => c.id !== column.id);
					const remainingCards = data.cards.filter((c) => c.columnId !== column.id);
					onChange({ ...data, columns: remainingCols, cards: remainingCards });
				},
			}).open();
		},
		[app, data, onChange],
	);

	const openCardModal = React.useCallback(
		(card: BoardCard) => {
			new CardModal(
				app,
				card,
				columns,
				(updated) => {
					onChange({
						...data,
						cards: data.cards.map((c) => (c.id === updated.id ? updated : c)),
					});
				},
				(deleted) => {
					onChange({ ...data, cards: data.cards.filter((c) => c.id !== deleted.id) });
				},
			).open();
		},
		[app, columns, data, onChange],
	);

	const addCard = React.useCallback(
		(columnId: string) => {
			const maxOrder = Math.max(
				-1,
				...data.cards
					.filter((c) => c.columnId === columnId)
					.map((c) => c.order ?? -1),
			);

			const card: BoardCard = {
				id: `card-${Date.now()}`,
				columnId,
				title: "新任务",
				description: "",
				priority: "medium",
				dueDate: null,
				tags: [],
				order: maxOrder + 1,
			};

			onChange(normalizeColumnOrder({ ...data, cards: [...data.cards, card] }, columnId));
			openCardModal(card);
		},
		[data, onChange, openCardModal],
	);

	const openColumnMenu = React.useCallback(
		(evt: React.MouseEvent, column: BoardColumn) => {
			evt.preventDefault();
			evt.stopPropagation();
			const menu = new Menu();
			menu.addItem((item) => {
				item.setTitle("重命名");
				item.onClick(() => renameColumn(column));
			});
			menu.addItem((item) => {
				item.setTitle("删除");
				item.onClick(() => deleteColumn(column));
			});
			menu.showAtMouseEvent(evt.nativeEvent);
		},
		[app, deleteColumn, renameColumn],
	);

	return (
		<div className="editor-pro-board editor-pro-board-react">
			<div className="board-container">
				{columns.map((col) => {
					const cards = getCardsInColumn(data, col.id);
					return (
						<div
							key={col.id}
							className={[
								"board-column",
								isDragging && dragOverColumnId === col.id ? "is-drag-over" : "",
							].join(" ")}
							onDragOver={(e) => {
								e.preventDefault();
								if (!isDragging) return;
								if (dragOverColumnId !== col.id) setDragOverColumnId(col.id);
								if (dragOverCardId) setDragOverCardId(null);
							}}
							onDrop={() => {
								if (drag.type !== "card") return;
								onChange(moveCardToColumn(data, drag.cardId, col.id));
								setDrag({ type: "none" });
								setDragOverColumnId(null);
								setDragOverCardId(null);
							}}
						>
							<div className="board-column-header">
								<div className="board-column-title" onDoubleClick={() => renameColumn(col)}>
									<h4>{col.name}</h4>
									<span className="board-column-count">{cards.length}</span>
								</div>
								<div className="board-column-actions">
									<button className="board-col-btn board-col-btn-primary" onClick={() => addCard(col.id)}>
										+ 任务
									</button>
									<button className="board-col-btn board-col-btn-ghost" onClick={(e) => openColumnMenu(e, col)}>
										⋯
									</button>
								</div>
							</div>

							<div className="board-card-list">
								{cards.map((card) => (
									<div
										key={card.id}
										className={[
											"board-card",
											isDragging && drag.type === "card" && drag.cardId === card.id ? "is-dragging" : "",
											isDragging && dragOverCardId === card.id ? "is-drop-target" : "",
										].join(" ")}
										draggable
										onDragStart={() => setDrag({ type: "card", cardId: card.id })}
										onDragEnd={() => {
											setDrag({ type: "none" });
											setDragOverColumnId(null);
											setDragOverCardId(null);
										}}
										onDragOver={(e) => {
											e.preventDefault();
											if (!isDragging) return;
											if (dragOverCardId !== card.id) setDragOverCardId(card.id);
											if (dragOverColumnId !== col.id) setDragOverColumnId(col.id);
										}}
										onDrop={() => {
											if (drag.type !== "card") return;
											onChange(moveCardBefore(data, drag.cardId, card.id));
											setDrag({ type: "none" });
											setDragOverColumnId(null);
											setDragOverCardId(null);
										}}
										onClick={() => {
											if (isDragging) return;
											openCardModal(card);
										}}
									>
										<div className="board-card-title">{card.title}</div>
										<div className="board-card-meta">
											<span className={`board-badge priority-${card.priority}`}>
												{card.priority === "high" ? "高" : card.priority === "medium" ? "中" : "低"}
											</span>
											{(() => {
												const badge = getDueBadge(card.dueDate);
												if (!badge) return null;
												return (
													<span className={`board-badge date-badge ${badge.cls}`}>
														{badge.label}
													</span>
												);
											})()}
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})}

				<div className="board-add-col-btn" role="button" tabIndex={0} onClick={addColumn}>
					+ 添加列表
				</div>
			</div>
		</div>
	);
}
