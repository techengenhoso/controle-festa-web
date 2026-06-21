import { Button } from "../../../shared/ui/Button";
import { Section } from "../../../shared/ui/Section";
import { formatCurrency } from "../../../shared/utils/currency";
import type { Consumption, MenuItem, Tab } from "../../party/model/types";

type ConsumptionPageProps = {
	activeMenu: MenuItem[];
	activeTabs: Tab[];
	hasActiveTabsAndMenu: boolean;
	selectedTab: string;
	selectedTabConsumptions: Consumption[];
	selectedActiveTab?: Tab;
	showRegistered: boolean;
	onDeleteConsumption: (consumptionId: string) => void;
	onRegisterConsumption: (menuItemId: string) => void;
	onSelectTab: (tabId: string) => void;
	onToggleRegistered: () => void;
};

export function ConsumptionPage({
	activeMenu,
	activeTabs,
	hasActiveTabsAndMenu,
	selectedTab,
	selectedTabConsumptions,
	selectedActiveTab,
	showRegistered,
	onDeleteConsumption,
	onRegisterConsumption,
	onSelectTab,
	onToggleRegistered,
}: ConsumptionPageProps) {
	return (
		<Section title="Consumos">
			{!hasActiveTabsAndMenu ? (
				<div className="empty-state">
					<p>não existe nenhuma comanda e item ativo</p>
				</div>
			) : (
				<>
					<div className="chip-list">
						{activeTabs.map((tab) => (
							<Button
								key={tab.id}
								variant={selectedTab === tab.id ? "primary" : "secondary"}
								onClick={() => onSelectTab(tab.id)}
							>
								{tab.code}
							</Button>
						))}
					</div>
					{selectedActiveTab && (
						<>
							<div className="grid-list consumption-menu">
								{activeMenu.map((item) => (
									<article className="card compact" key={item.id}>
										<div>
											<h3>{item.name}</h3>
											<p>{formatCurrency(item.price)}</p>
										</div>
										<Button onClick={() => onRegisterConsumption(item.id)}>
											Registrar
										</Button>
									</article>
								))}
							</div>

							<div className="toggle-panel">
								<Button variant="secondary" onClick={onToggleRegistered}>
									{showRegistered
										? "Ocultar itens registrado"
										: "Mostrar itens registrado"}
								</Button>

								{showRegistered && selectedTabConsumptions.length > 0 && (
									<div className="grid-list">
										{selectedTabConsumptions.map((item) => (
											<article className="card compact" key={item.id}>
												<div>
													<h3>{item.itemName}</h3>
													<p>{formatCurrency(item.price)}</p>
												</div>
												<Button
													variant="danger"
													onClick={() => onDeleteConsumption(item.id)}
												>
													Remover
												</Button>
											</article>
										))}
									</div>
								)}
							</div>
						</>
					)}
				</>
			)}
		</Section>
	);
}
