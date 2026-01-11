import React from "react";
import { FlowCard, FlowSection } from "../features/flow-board/flow-parser";

type DragState = { type: "card"; cardId: string } | { type: "none" };

function getCardsInColumn(cards: FlowCard[], columnId: string): FlowCard[] {
	return cards
		.filter((c) => c.columnId === columnId)
		.slice()
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function normalizeOrder(cards: FlowCard[], columnId: string): FlowCard[] {
	const ordered = getCardsInColumn(cards, columnId);
	const indexById = new Map(ordered.map((c, idx) => [c.id, idx] as const));
	return cards.map((c) => (c.columnId === columnId ? { ...c, order: indexById.get(c.id) ?? c.order } : c));
}

function moveCardToColumn(cards: FlowCard[], cardId: string, toColumnId: string): FlowCard[] {
	const card = cards.find((c) => c.id === cardId);
	if (!card) return cards;
	if (card.columnId === toColumnId) return cards;

	const max = Math.max(-1, ...cards.filter((c) => c.columnId === toColumnId).map((c) => c.order ?? -1));
	const next = cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId, order: max + 1 } : c));
	return normalizeOrder(next, toColumnId);
}

function moveCardBefore(cards: FlowCard[], cardId: string, targetId: string): FlowCard[] {
	if (cardId === targetId) return cards;
	const card = cards.find((c) => c.id === cardId);
	const target = cards.find((c) => c.id === targetId);
	if (!card || !target) return cards;

	let next = cards;
	if (card.columnId !== target.columnId) {
		next = moveCardToColumn(next, cardId, target.columnId);
	}

	const columnId = target.columnId;
	const ordered = getCardsInColumn(next, columnId).filter((c) => c.id !== cardId);
	const idx = Math.max(0, ordered.findIndex((c) => c.id === targetId));
	ordered.splice(idx, 0, { ...card, columnId });

	const nextMap = new Map(ordered.map((c, index) => [c.id, index] as const));
	return next.map((c) => (c.columnId === columnId ? { ...c, order: nextMap.get(c.id) ?? c.order } : c));
}

export function FlowBoardApp(props: {
	sections: FlowSection[];
	cards: FlowCard[];
	onChange: (next: FlowCard[]) => void;
	onOpenCard: (cardId: string) => void;
}) {
	const { sections, cards, onChange, onOpenCard } = props;
	const [drag, setDrag] = React.useState<DragState>({ type: "none" });
	const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(null);
	const [dragOverCardId, setDragOverCardId] = React.useState<string | null>(null);
	const isDragging = drag.type === "card";

	return (
		<div className="editor-pro-board editor-pro-flow-board">
			<div className="board-container">
				{sections.map((sec) => {
					const colCards = getCardsInColumn(cards, sec.columnId);
					return (
						<div
							key={sec.columnId}
							className={[
								"board-column",
								dragOverColumnId === sec.columnId ? "drag-over" : "",
							].join(" ")}
							onDragOver={(e) => {
								if (!isDragging) return;
								e.preventDefault();
								setDragOverColumnId(sec.columnId);
								setDragOverCardId(null);
							}}
							onDragLeave={() => {
								if (dragOverColumnId === sec.columnId) setDragOverColumnId(null);
							}}
							onDrop={(e) => {
								e.preventDefault();
								if (drag.type !== "card") return;
								onChange(moveCardToColumn(cards, drag.cardId, sec.columnId));
								setDrag({ type: "none" });
								setDragOverColumnId(null);
								setDragOverCardId(null);
							}}
						>
							<div className="board-column-header">
								<div className="board-column-title">
									{sec.headingText}
									<span className="board-column-count">{colCards.length}</span>
								</div>
							</div>
							<div className="board-card-list">
								{colCards.map((card) => (
									<div
										key={card.id}
										className={[
											"board-card",
											dragOverCardId === card.id ? "drag-target" : "",
										].join(" ")}
										draggable
										onDragStart={(e) => {
											e.dataTransfer.setData("text/plain", card.id);
											setDrag({ type: "card", cardId: card.id });
										}}
										onDragEnd={() => {
											setDrag({ type: "none" });
											setDragOverColumnId(null);
											setDragOverCardId(null);
										}}
										onDragOver={(e) => {
											if (drag.type !== "card") return;
											if (drag.cardId === card.id) return;
											e.preventDefault();
											setDragOverColumnId(sec.columnId);
											setDragOverCardId(card.id);
										}}
										onDrop={(e) => {
											e.preventDefault();
											if (drag.type !== "card") return;
											onChange(moveCardBefore(cards, drag.cardId, card.id));
											setDrag({ type: "none" });
											setDragOverColumnId(null);
											setDragOverCardId(null);
										}}
										onDoubleClick={() => onOpenCard(card.id)}
									>
										<div className="board-card-title">{card.title}</div>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

