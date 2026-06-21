import type { PropsWithChildren } from "react";
import { Button } from "./Button";

type ModalProps = PropsWithChildren<{
	title: string;
	open: boolean;
	onClose: () => void;
}>;

export function Modal({ title, open, onClose, children }: ModalProps) {
	if (!open) return null;

	return (
		<div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
			<dialog
				className="modal"
				open
				aria-modal="true"
				aria-labelledby="modal-title"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<header className="modal-header">
					<h2 id="modal-title">{title}</h2>
					<Button variant="ghost" onClick={onClose} aria-label="Fechar">
						×
					</Button>
				</header>
				{children}
			</dialog>
		</div>
	);
}
