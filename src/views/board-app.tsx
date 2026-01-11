import React from "react";
import { App, Menu } from "obsidian";
import { BoardCard, BoardColumn, BoardData } from "../features/board/board-model";
import { ConfirmModal, TextPromptModal } from "../ui/modals";

export type BoardSaveStatus = "saved" | "dirty" | "saving" | "error";

type DragState = { type: "card"; cardId: string } | { type: "none" };

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
	return data.cards
		.filter((c) => c.columnId === columnId)
		.slice()
		.sort((a, b) => a.order - b.order);
}

function normalizeColumnOrder(data: BoardData, columnId: string): BoardData {
	const inCol = getCardsInColumn(data, columnId);
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
	if (card.columnId === toColumnId) return data;

	const maxOrder = Math.max(-1, ...data.cards.filter((c) => c.columnId === toColumnId).map((c) => c.order));
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

function parseTags(text: string): string[] {
	const tags = text
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
	return Array.from(new Set(tags));
}

function filterBoard(data: BoardData, query: string): BoardData {
	const q = query.trim().toLowerCase();
	if (!q) return data;
	const cards = data.cards.filter((c) => {
		const hay = [c.title, c.description, ...(c.tags ?? [])].join(" ").toLowerCase();
		return hay.includes(q);
	});
	return { ...data, cards };
}

function BoardParseErrorPanel(props: {
	app: App;
	filePath: string;
	message: string;
	rawText: string;
	saveStatus: { text: string; cls: string };
	saveError: string | null;
	onApply: ((rawText: string) => void) | null;
	onReset: () => void;
	onExport: () => void;
}) {
	const [raw, setRaw] = React.useState(props.rawText);

	React.useEffect(() => {
		setRaw(props.rawText);
	}, [props.rawText]);

	return (
		<div className="editor-pro-board editor-pro-board-shell">
			<div className="editor-pro-board-topbar">
				<div className="editor-pro-board-title">项目看板</div>
				<div className="editor-pro-board-spacer" />
				<div className={["editor-pro-board-status", props.saveStatus.cls].join(" ")} title={props.saveError ?? undefined}>
					<span className="dot" />
					{props.saveStatus.text}
				</div>
			</div>

			<div className="editor-pro-board-error">
				<div className="editor-pro-board-error-title">看板文件无法解析</div>
				<div className="editor-pro-board-error-meta">
					<div className="path">{props.filePath}</div>
					<div className="msg">{props.message}</div>
				</div>

				<textarea
					className="editor-pro-board-error-textarea"
					value={raw}
					onChange={(e) => setRaw(e.target.value)}
					spellCheck={false}
				/>

				<div className="editor-pro-board-error-actions">
					<button className="mod-cta" onClick={() => props.onApply?.(raw)} disabled={!props.onApply}>
						应用修复
					</button>
					<button
						className="mod-warning"
						onClick={() => {
							new ConfirmModal(props.app, {
								title: "重置看板",
								message: "这会用默认模板覆盖当前 .board 文件，是否继续？",
								confirmText: "重置",
								cancelText: "取消",
								onConfirm: () => props.onReset(),
							}).open();
						}}
					>
						重置为默认
					</button>
					<button onClick={() => props.onExport()}>复制 JSON</button>
				</div>
			</div>
		</div>
	);
}

function CardDetailsPanel(props: {
	app: App;
	data: BoardData;
	card: BoardCard;
	columns: BoardColumn[];
	onChange: (next: BoardData) => void;
	onClose: () => void;
}) {
	const { app, data, card, columns, onChange, onClose } = props;
	const [tagsText, setTagsText] = React.useState((card.tags ?? []).join(", "));

	React.useEffect(() => {
		setTagsText((card.tags ?? []).join(", "));
	}, [card.id, card.tags]);

	const updateCard = (patch: Partial<BoardCard>) => {
		onChange({
			...data,
			cards: data.cards.map((c) => (c.id === card.id ? { ...c, ...patch } : c)),
		});
	};

	const deleteCard = () => {
		new ConfirmModal(app, {
			title: "删除任务",
			message: `确定要删除“${card.title || "未命名"}”吗？`,
			confirmText: "删除",
			cancelText: "取消",
			onConfirm: () => {
				onChange({ ...data, cards: data.cards.filter((c) => c.id !== card.id) });
				onClose();
			},
		}).open();
	};

	return (
		<div className="editor-pro-board-sidebar">
			<div className="editor-pro-board-sidebar-header">
				<div className="title">任务详情</div>
				<button className="close" onClick={onClose} aria-label="Close">
					×
				</button>
			</div>

			<div className="editor-pro-board-sidebar-body">
				<div className="field">
					<label>标题</label>
					<input value={card.title} onChange={(e) => updateCard({ title: e.target.value })} />
				</div>

				<div className="field-row">
					<div className="field">
						<label>状态（列）</label>
						<select value={card.columnId} onChange={(e) => onChange(moveCardToColumn(data, card.id, e.target.value))}>
							{columns.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</div>
					<div className="field">
						<label>优先级</label>
						<select
							value={card.priority}
							onChange={(e) => {
								const v = e.target.value;
								if (v === "low" || v === "medium" || v === "high") updateCard({ priority: v });
							}}
						>
							<option value="low">低</option>
							<option value="medium">中</option>
							<option value="high">高</option>
						</select>
					</div>
				</div>

				<div className="field">
					<label>截止日期</label>
					<input
						type="date"
						placeholder="YYYY-MM-DD"
						value={card.dueDate ?? ""}
						onChange={(e) => updateCard({ dueDate: e.target.value.trim() ? e.target.value.trim() : null })}
					/>
				</div>

				<div className="field">
					<label>标签</label>
					<input
						placeholder="tag1, tag2"
						value={tagsText}
						onChange={(e) => setTagsText(e.target.value)}
						onBlur={() => updateCard({ tags: parseTags(tagsText) })}
					/>
					<div className="hint">可编辑；用逗号分隔，失焦时应用</div>
				</div>

				<div className="field">
					<label>描述</label>
					<textarea value={card.description} onChange={(e) => updateCard({ description: e.target.value })} />
				</div>

				<div className="field readonly">
					<label>不可编辑</label>
					<div className="kv">
						<div>
							<span>卡片 ID</span>
							<code>{card.id}</code>
						</div>
						<div>
							<span>排序</span>
							<code>{String(card.order)}</code>
						</div>
					</div>
				</div>

				<div className="actions">
					<button className="mod-warning" onClick={deleteCard}>
						删除任务
					</button>
				</div>
			</div>
		</div>
	);
}

export function BoardApp(props: {
	app: App;
	data: BoardData;
	onChange: (next: BoardData) => void;
	filePath: string;
	saveStatus: BoardSaveStatus;
	saveError: string | null;
	parseError: { message: string; rawText: string } | null;
	onApplyRawJson: ((rawText: string) => void) | null;
	onResetBoard: () => void;
	onExportJson: () => void;
}) {
	const { app, data, onChange } = props;
	const [query, setQuery] = React.useState("");
	const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
	const [drag, setDrag] = React.useState<DragState>({ type: "none" });
	const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
	const [dragOverCardId, setDragOverCardId] = React.useState<string | null>(null);
	const isDragging = drag.type === "card";

	const searchRef = React.useRef<HTMLInputElement | null>(null);

	React.useEffect(() => {
		const handler = (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				setSelectedCardId(null);
				return;
			}
			if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === "f") {
				searchRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const columns = data.columns;
	const selectedCard = selectedCardId ? data.cards.find((c) => c.id === selectedCardId) ?? null : null;
	const filtered = React.useMemo(() => filterBoard(data, query), [data, query]);

	const status = React.useMemo(() => {
		switch (props.saveStatus) {
			case "saving":
				return { text: "保存中…", cls: "is-saving" };
			case "dirty":
				return { text: "未保存", cls: "is-dirty" };
			case "error":
				return { text: "保存失败", cls: "is-error" };
			case "saved":
			default:
				return { text: "已保存", cls: "is-saved" };
		}
	}, [props.saveStatus]);

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
					if (selectedCardId && data.cards.find((c) => c.id === selectedCardId)?.columnId === column.id) {
						setSelectedCardId(null);
					}
					onChange({ ...data, columns: remainingCols, cards: remainingCards });
				},
			}).open();
		},
		[app, data, onChange, selectedCardId],
	);

	const addCard = React.useCallback(
		(columnId: string) => {
			const maxOrder = Math.max(-1, ...data.cards.filter((c) => c.columnId === columnId).map((c) => c.order));
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
			const next = normalizeColumnOrder({ ...data, cards: [...data.cards, card] }, columnId);
			onChange(next);
			setSelectedCardId(card.id);
		},
		[data, onChange],
	);

	const renameBoard = React.useCallback(() => {
		new TextPromptModal(app, {
			title: "看板名称",
			placeholder: "例如：Project",
			initialValue: data.title || "",
			submitText: "保存",
			onSubmit: (title) => onChange({ ...data, title }),
		}).open();
	}, [app, data, onChange]);

	const openBoardMenu = React.useCallback(
		(evt: React.MouseEvent) => {
			evt.preventDefault();
			evt.stopPropagation();
			const menu = new Menu();
			menu.addItem((item) => item.setTitle("重命名看板").onClick(() => renameBoard()));
			menu.addItem((item) => item.setTitle("添加列表").onClick(() => addColumn()));
			menu.addItem((item) => item.setTitle("导出 JSON（复制到剪贴板）").onClick(() => props.onExportJson()));
			menu.addItem((item) =>
				item.setTitle("重置看板（覆盖文件）").onClick(() => {
					new ConfirmModal(app, {
						title: "重置看板",
						message: "这会用默认模板覆盖当前 .board 文件，是否继续？",
						confirmText: "重置",
						cancelText: "取消",
						onConfirm: () => props.onResetBoard(),
					}).open();
				}),
			);
			menu.showAtMouseEvent(evt.nativeEvent);
		},
		[addColumn, app, props, renameBoard],
	);

	const openColumnMenu = React.useCallback(
		(evt: React.MouseEvent, column: BoardColumn) => {
			evt.preventDefault();
			evt.stopPropagation();
			const menu = new Menu();
			menu.addItem((item) => item.setTitle("重命名").onClick(() => renameColumn(column)));
			menu.addItem((item) => item.setTitle("删除").onClick(() => deleteColumn(column)));
			menu.showAtMouseEvent(evt.nativeEvent);
		},
		[deleteColumn, renameColumn],
	);

	if (props.parseError) {
		return (
			<BoardParseErrorPanel
				app={app}
				filePath={props.filePath}
				message={props.parseError.message}
				rawText={props.parseError.rawText}
				saveStatus={status}
				saveError={props.saveError}
				onApply={props.onApplyRawJson}
				onReset={props.onResetBoard}
				onExport={props.onExportJson}
			/>
		);
	}

	return (
		<div className="editor-pro-board editor-pro-board-shell">
			<div className="editor-pro-board-topbar">
				<button className="editor-pro-board-title" onClick={renameBoard} title="点击重命名">
					{data.title || "项目看板"}
				</button>
				<div className="editor-pro-board-search">
					<input
						ref={searchRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="搜索任务（标题/描述/标签）"
					/>
				</div>
				<div className="editor-pro-board-actions">
					<button className="mod-cta" onClick={addColumn}>
						+ 列
					</button>
					<button
						className={["editor-pro-board-status", status.cls].join(" ")}
						title={props.saveError ?? undefined}
						onClick={(e) => openBoardMenu(e)}
					>
						<span className="dot" />
						{status.text}
					</button>
				</div>
			</div>

			<div className="editor-pro-board-content">
				<div className="board-container">
					{columns.map((col) => {
						const cards = getCardsInColumn(filtered, col.id);
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
										<h4 title={col.name}>{col.name}</h4>
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
									{cards.length === 0 ? (
										<div className="board-column-empty">
											<div className="hint">暂无任务</div>
											<button className="board-col-btn" onClick={() => addCard(col.id)}>
												+ 添加任务
											</button>
										</div>
									) : null}
									{cards.map((card) => (
										<div
											key={card.id}
											className={[
												"board-card",
												card.id === selectedCardId ? "is-selected" : "",
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
												setSelectedCardId(card.id);
											}}
										>
											<div className="board-card-title">{card.title}</div>
											<div className="board-card-meta">
												<span className={`board-badge priority-${card.priority}`}>
													{card.priority === "high" ? "高" : card.priority === "medium" ? "中" : "低"}
												</span>
												{card.tags.slice(0, 3).map((t) => (
													<span key={t} className="board-badge tag-badge">
														#{t}
													</span>
												))}
												{(() => {
													const badge = getDueBadge(card.dueDate);
													if (!badge) return null;
													return <span className={`board-badge date-badge ${badge.cls}`}>{badge.label}</span>;
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

				{selectedCard ? (
					<CardDetailsPanel
						app={app}
						data={data}
						card={selectedCard}
						columns={columns}
						onChange={onChange}
						onClose={() => setSelectedCardId(null)}
					/>
				) : (
					<div className="editor-pro-board-sidebar empty">
						<div className="editor-pro-board-sidebar-header">
							<div className="title">任务详情</div>
						</div>
						<div className="editor-pro-board-sidebar-body empty">
							<div className="empty-hint">选择一个任务以编辑（或按 Esc 关闭）</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
