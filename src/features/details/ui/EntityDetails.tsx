import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatStoredDate } from "../../../shared/utils/date";
import type { MenuItem, Party, Tab } from "../../party/model/types";

type EntityDetailsProps = {
	menuDetail?: MenuItem;
	modal: string | null;
	partyDetail?: Party;
	tabDetail?: Tab;
	onArchiveParty: (partyId: string) => void;
	onClose: () => void;
	onDeleteMenuItem: (itemId: string) => void;
	onDeleteParty: (partyId: string) => void;
	onDeleteTab: (tabId: string) => void;
	onEditMenuItem: (item: MenuItem) => void;
	onEditParty: (party: Party) => void;
	onEditTab: (tab: Tab) => void;
	onSetActiveParty: (partyId: string, active: boolean) => void;
	onToggleMenuItem: (item: MenuItem) => void;
	onToggleTab: (tab: Tab) => void;
	onUnarchiveParty: (partyId: string) => void;
};

export function EntityDetails({
	menuDetail,
	modal,
	partyDetail,
	tabDetail,
	onArchiveParty,
	onClose,
	onDeleteMenuItem,
	onDeleteParty,
	onDeleteTab,
	onEditMenuItem,
	onEditParty,
	onEditTab,
	onSetActiveParty,
	onToggleMenuItem,
	onToggleTab,
	onUnarchiveParty,
}: EntityDetailsProps) {
	return (
		<>
			{partyDetail && (
				<Modal
					title="Detalhes da festa"
					open={modal === "partyDetails"}
					onClose={onClose}
				>
					<div className="detail-list">
						<div>
							<span>Nome</span>
							<strong>{partyDetail.name}</strong>
						</div>
						<div>
							<span>Data</span>
							<strong>{formatStoredDate(partyDetail.date)}</strong>
						</div>
						<div>
							<span>Observação</span>
							<strong>{partyDetail.notes || "Sem observações"}</strong>
						</div>
						<div>
							<span>Status</span>
							<strong>{partyDetail.active ? "Ativa" : "Inativa"}</strong>
						</div>
					</div>
					<div className="modal-actions">
						<Button
							variant="secondary"
							onClick={() => onEditParty(partyDetail)}
						>
							Editar
						</Button>
						{partyDetail.archived ? (
							<>
								<Button
									variant="secondary"
									onClick={() => onUnarchiveParty(partyDetail.id)}
								>
									Desarquivar
								</Button>
								<Button
									variant="danger"
									onClick={() => onDeleteParty(partyDetail.id)}
								>
									Excluir
								</Button>
							</>
						) : (
							<>
								<Button
									variant="secondary"
									onClick={() =>
										onSetActiveParty(partyDetail.id, !partyDetail.active)
									}
								>
									{partyDetail.active ? "Desativar" : "Ativar"}
								</Button>
								<Button
									variant="secondary"
									onClick={() => onArchiveParty(partyDetail.id)}
								>
									Arquivar
								</Button>
							</>
						)}
					</div>
				</Modal>
			)}
			{tabDetail && (
				<Modal
					title="Detalhes da comanda"
					open={modal === "tabDetails"}
					onClose={onClose}
				>
					<div className="detail-list">
						<div>
							<span>Nome</span>
							<strong>{tabDetail.code}</strong>
						</div>
						<div>
							<span>Código</span>
							<strong>{tabDetail.nfcCard || "Sem código"}</strong>
						</div>
						<div>
							<span>Mínimo</span>
							<strong>{formatCurrency(tabDetail.minimumSpend)}</strong>
						</div>
						<div>
							<span>Status</span>
							<strong>{tabDetail.active ? "Ativa" : "Inativa"}</strong>
						</div>
					</div>
					<div className="modal-actions">
						<Button variant="secondary" onClick={() => onEditTab(tabDetail)}>
							Editar
						</Button>
						<Button variant="secondary" onClick={() => onToggleTab(tabDetail)}>
							{tabDetail.active ? "Desativar" : "Ativar"}
						</Button>
						<Button variant="danger" onClick={() => onDeleteTab(tabDetail.id)}>
							Excluir
						</Button>
					</div>
				</Modal>
			)}
			{menuDetail && (
				<Modal
					title="Detalhes do item"
					open={modal === "menuDetails"}
					onClose={onClose}
				>
					<div className="detail-list">
						<div>
							<span>Nome</span>
							<strong>{menuDetail.name}</strong>
						</div>
						<div>
							<span>Preço</span>
							<strong>{formatCurrency(menuDetail.price)}</strong>
						</div>
						<div>
							<span>Status</span>
							<strong>{menuDetail.active ? "Ativo" : "Inativo"}</strong>
						</div>
					</div>
					<div className="modal-actions">
						<Button
							variant="secondary"
							onClick={() => onEditMenuItem(menuDetail)}
						>
							Editar
						</Button>
						<Button
							variant="secondary"
							onClick={() => onToggleMenuItem(menuDetail)}
						>
							{menuDetail.active ? "Desativar" : "Ativar"}
						</Button>
						<Button
							variant="danger"
							onClick={() => onDeleteMenuItem(menuDetail.id)}
						>
							Excluir
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
}
