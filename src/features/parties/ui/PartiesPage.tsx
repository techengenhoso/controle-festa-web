import { Button } from "../../../shared/ui/Button";
import { Section } from "../../../shared/ui/Section";
import { formatStoredDate } from "../../../shared/utils/date";
import type { Party } from "../../party/model/types";

type PartiesPageProps = {
	visibleParties: Party[];
	archivedParties: Party[];
	showArchived: boolean;
	onToggleArchived: () => void;
	onCreateParty: () => void;
	onOpenPartyDetails: (partyId: string) => void;
};

export function PartiesPage({
	visibleParties,
	archivedParties,
	showArchived,
	onToggleArchived,
	onCreateParty,
	onOpenPartyDetails,
}: PartiesPageProps) {
	return (
		<Section
			title="Festas"
			actions={
				<div className="party-actions">
					<Button onClick={onCreateParty}>Criar festa</Button>
				</div>
			}
		>
			{visibleParties.length === 0 ? (
				<div className="empty-state">
					<p>as festas cadastrada vão aparecer aqui</p>
				</div>
			) : (
				<div className="grid-list">
					{visibleParties.map((party) => (
						<PartyCard
							key={party.id}
							party={party}
							onOpenPartyDetails={onOpenPartyDetails}
						/>
					))}
				</div>
			)}
			{archivedParties.length > 0 && (
				<div className="toggle-panel archived-toggle-panel">
					<Button variant="secondary" onClick={onToggleArchived}>
						{showArchived
							? "Ocultar festas arquivada"
							: "Mostrar festas arquivada"}
					</Button>

					{showArchived && (
						<div className="grid-list">
							{archivedParties.map((party) => (
								<PartyCard
									key={party.id}
									party={party}
									onOpenPartyDetails={onOpenPartyDetails}
									archived
								/>
							))}
						</div>
					)}
				</div>
			)}
			<div className="party-support">
				<a className="party-support-link" href="mailto:techengenhoso@outlook.com">
					Enviar e-mail para suporte
				</a>
			</div>
		</Section>
	);
}

type PartyCardProps = {
	party: Party;
	archived?: boolean;
	onOpenPartyDetails: (partyId: string) => void;
};

function PartyCard({
	party,
	archived = false,
	onOpenPartyDetails,
}: PartyCardProps) {
	return (
		<button
			className="card card-button"
			onClick={() => onOpenPartyDetails(party.id)}
		>
			<div className="party-card-content">
				<div className="party-card-main">
					<h3>{party.name}</h3>
					<p>{formatStoredDate(party.date)}</p>
				</div>
				<div className="badges">
					<span
						className={
							archived
								? "badge-archived"
								: party.active
									? "badge-active"
									: "badge-inactive"
						}
					>
						{archived ? "Arquivada" : party.active ? "Ativa" : "Inativa"}
					</span>
				</div>
			</div>
		</button>
	);
}
