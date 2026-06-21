import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { EntityDetails } from "../features/details/ui/EntityDetails";
import { EntityForms } from "../features/forms/ui/EntityForms";
import type { MenuForm, PartyForm, TabForm } from "../features/forms/ui/forms";
import {
	formatTabCodeInput,
	newMenu,
	newParty,
	newTab,
} from "../features/forms/ui/forms";
import { DEFAULT_MENU_ITEMS } from "../features/party/model/constants";
import {
	LIMITS,
	normalizeAppData,
} from "../features/party/model/normalization";
import {
	findActiveParty,
	findPartyItem,
	getActiveMenu,
	getActiveTabs,
	getBalanceTotals,
	getConsumptionsByTab,
	getPartyHeader,
	getRemainingMinimum,
	hasActiveTabsAndMenu,
	resolveSelectedTab,
	splitPartiesByArchive,
} from "../features/party/model/selectors";
import type {
	AppData,
	MenuItem,
	Party,
	SectionId,
	Tab,
} from "../features/party/model/types";
import { loadAppData, saveAppData } from "../services/storage/appDataStorage";
import { Nav } from "../shared/ui/Nav";
import {
	formatCurrencyInput,
	parseCurrencyInput,
} from "../shared/utils/currency";
import {
	brazilianDateToIso,
	formatStoredDate,
	isValidBrazilianDate,
} from "../shared/utils/date";
import { createId } from "../shared/utils/id";
import {
	BalancesPage,
	ConsumptionPage,
	MenuPage,
	PartiesPage,
	TabsPage,
} from "./pages";
import "../shared/styles/global.css";

type ModalState =
	| "party"
	| "tab"
	| "menu"
	| "partyDetails"
	| "tabDetails"
	| "menuDetails"
	| null;

const initialAppData = loadAppData();

function App() {
	const [appData, setAppData] = useState<AppData>(() => initialAppData);
	const [section, setSection] = useState<SectionId>(() =>
		getInitialSection(initialAppData),
	);
	const [showArchived, setShowArchived] = useState(false);
	const [modal, setModal] = useState<ModalState>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [partyForm, setPartyForm] = useState<PartyForm>(newParty);
	const [tabForm, setTabForm] = useState<TabForm>(newTab);
	const [menuForm, setMenuForm] = useState<MenuForm>(newMenu);
	const [selectedPartyDetailId, setSelectedPartyDetailId] = useState<
		string | null
	>(null);
	const [selectedTabDetailId, setSelectedTabDetailId] = useState<string | null>(
		null,
	);
	const [selectedMenuDetailId, setSelectedMenuDetailId] = useState<
		string | null
	>(null);
	const [showRegistered, setShowRegistered] = useState(false);
	const [toast, setToast] = useState("");

	useEffect(() => saveAppData(appData), [appData]);
	useEffect(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(""), 2400);
		return () => window.clearTimeout(timer);
	}, [toast]);

	const activeParty = findActiveParty(appData);
	const { visibleParties, archivedParties } = splitPartiesByArchive(
		appData.parties,
	);
	const activeTabs = getActiveTabs(activeParty);
	const activeMenu = getActiveMenu(activeParty);
	const selectedTab = resolveSelectedTab(appData, activeTabs);
	const selectedActiveTab = findPartyItem(activeParty?.tabs, selectedTab);
	const selectedTabConsumptions = getConsumptionsByTab(activeParty, selectedTab);
	const selectedTabRemaining = getRemainingMinimum(
		activeParty,
		selectedActiveTab,
	);
	const selectedPartyDetail = findPartyItem(
		appData.parties,
		selectedPartyDetailId,
	);
	const selectedTabDetail = findPartyItem(
		activeParty?.tabs,
		selectedTabDetailId,
	);
	const selectedMenuDetail = findPartyItem(
		activeParty?.menu,
		selectedMenuDetailId,
	);
	const balanceTabs = activeTabs;
	const canRegisterConsumption = hasActiveTabsAndMenu(activeTabs, activeMenu);
	const totals = getBalanceTotals(activeParty, balanceTabs);
	const activePartyHeader = getPartyHeader(activeParty, {
		showTabBalance: section === "consumption" && canRegisterConsumption,
		selectedTab: selectedActiveTab,
		remaining: selectedTabRemaining,
	});

	function updateParty(partyId: string, updater: (party: Party) => Party) {
		setAppData((current) =>
			normalizeAppData({
				...current,
				parties: current.parties.map((party) =>
					party.id === partyId ? updater(party) : party,
				),
			}),
		);
	}

	function openPartyForm(party?: Party) {
		setEditingId(party?.id ?? null);
		setPartyForm(
			party
				? {
						name: party.name,
						date: formatStoredDate(party.date),
						notes: party.notes,
					}
				: newParty(),
		);
		setModal("party");
	}

	function openTabForm(tab?: Tab) {
		setEditingId(tab?.id ?? null);
		setTabForm(
			tab
				? {
						code: tab.code,
						nfcCard: tab.nfcCard,
						minimumSpend: formatCurrencyInput(tab.minimumSpend),
					}
				: newTab(),
		);
		setModal("tab");
	}

	function openMenuForm(item?: MenuItem) {
		setEditingId(item?.id ?? null);
		setMenuForm(
			item
				? { name: item.name, price: formatCurrencyInput(item.price) }
				: newMenu(),
		);
		setModal("menu");
	}

	function saveParty(event: FormEvent) {
		event.preventDefault();
		if (!partyForm.name.trim() || !isValidBrazilianDate(partyForm.date)) return;
		const isoDate = brazilianDateToIso(partyForm.date);
		if (!isoDate) return;
		const now = new Date().toISOString();
		const payload = {
			...partyForm,
			date: isoDate,
			name: partyForm.name.trim().slice(0, LIMITS.partyName),
			notes: partyForm.notes.trim().slice(0, LIMITS.partyNotes),
		};
		setAppData((current) =>
			normalizeAppData({
				...current,
				parties: editingId
					? current.parties.map((party) =>
							party.id === editingId ? { ...party, ...payload } : party,
						)
					: [
							...current.parties,
							{
								id: createId(),
								...payload,
								active: current.parties.every((party) => party.archived),
								archived: false,
								createdAt: now,
								tabs: [],
								menu: DEFAULT_MENU_ITEMS.map((name) => ({
									id: createId(),
									name,
									price: 0,
									active: true,
									createdAt: now,
								})),
								consumptions: [],
							},
						],
			}),
		);
		setModal(null);
	}

	function saveTab(event: FormEvent) {
		event.preventDefault();
		const minimumSpend = tabForm.minimumSpend.trim()
			? parseCurrencyInput(tabForm.minimumSpend)
			: 0;
		if (!activeParty || !tabForm.code.trim() || minimumSpend === null) return;
		const payload = {
			code: tabForm.code.trim().slice(0, LIMITS.tabCode),
			nfcCard: formatTabCodeInput(tabForm.nfcCard)
				.trim()
				.slice(0, LIMITS.tabNfcCard),
			minimumSpend,
		};
		updateParty(activeParty.id, (party) => ({
			...party,
			tabs: editingId
				? party.tabs.map((tab) =>
						tab.id === editingId ? { ...tab, ...payload } : tab,
					)
				: [
						...party.tabs,
						{
							id: createId(),
							...payload,
							active: true,
							createdAt: new Date().toISOString(),
						},
					],
		}));
		setModal(null);
	}

	function saveMenu(event: FormEvent) {
		event.preventDefault();
		const price = menuForm.price.trim()
			? parseCurrencyInput(menuForm.price)
			: 0;
		if (!activeParty || !menuForm.name.trim() || price === null) return;
		const payload = {
			name: menuForm.name.trim().slice(0, LIMITS.menuItemName),
			price,
		};
		updateParty(activeParty.id, (party) => ({
			...party,
			menu: editingId
				? party.menu.map((item) =>
						item.id === editingId ? { ...item, ...payload } : item,
					)
				: [
						...party.menu,
						{
							id: createId(),
							...payload,
							active: true,
							createdAt: new Date().toISOString(),
						},
					],
			consumptions: editingId
				? party.consumptions.map((consumption) =>
						consumption.menuItemId === editingId
							? { ...consumption, itemName: payload.name, price: payload.price }
							: consumption,
					)
				: party.consumptions,
		}));
		setModal(null);
	}

	function setActiveParty(partyId: string, active: boolean) {
		setAppData((current) =>
			normalizeAppData({
				...current,
				selectedPartyId: active
					? partyId
					: current.selectedPartyId === partyId
						? undefined
						: current.selectedPartyId,
				parties: current.parties.map((party) => ({
					...party,
					active: active
						? party.id === partyId
						: party.id === partyId
							? false
							: party.active,
				})),
			}),
		);
		setModal(null);
	}

	function archiveParty(partyId: string) {
		updateParty(partyId, (party) => ({
			...party,
			archived: true,
			active: false,
		}));
		setModal(null);
	}

	function unarchiveParty(partyId: string) {
		setAppData((current) =>
			normalizeAppData({
				...current,
				selectedPartyId: partyId,
				parties: current.parties.map((party) => ({
					...party,
					archived: party.id === partyId ? false : party.archived,
					active: party.id === partyId,
				})),
			}),
		);
		setModal(null);
	}

	function deleteParty(partyId: string) {
		const party = appData.parties.find((item) => item.id === partyId);
		if (
			!party?.archived ||
			!window.confirm(
				"Tem certeza que deseja excluir esta festa? Esta ação vai excluir todas comandas, itens e consumo registrado.",
			)
		)
			return;
		setAppData((current) =>
			normalizeAppData({
				...current,
				parties: current.parties.filter((item) => item.id !== partyId),
			}),
		);
		setModal(null);
	}

	function deleteTab(tabId: string) {
		if (
			!activeParty ||
			!window.confirm(
				"Tem certeza que deseja excluir esta comanda? Os consumos relacionados também serão removidos.",
			)
		)
			return;
		updateParty(activeParty.id, (party) => ({
			...party,
			tabs: party.tabs.filter((tab) => tab.id !== tabId),
			consumptions: party.consumptions.filter(
				(consumption) => consumption.tabId !== tabId,
			),
		}));
		setModal(null);
	}

	function deleteMenuItem(itemId: string) {
		if (
			!activeParty ||
			!window.confirm(
				"Tem certeza que deseja excluir este item? Os consumos relacionados também serão removidos.",
			)
		)
			return;
		updateParty(activeParty.id, (party) => ({
			...party,
			menu: party.menu.filter((item) => item.id !== itemId),
			consumptions: party.consumptions.filter(
				(consumption) => consumption.menuItemId !== itemId,
			),
		}));
		setModal(null);
	}

	function toggleTabActive(tab: Tab) {
		const hasConsumptions =
			activeParty?.consumptions.some(
				(consumption) => consumption.tabId === tab.id,
			) ?? false;
		if (
			tab.active &&
			hasConsumptions &&
			!window.confirm(
				"Esta comanda já possui consumação. Deseja desativá-la mesmo assim?",
			)
		)
			return;
		if (!activeParty) return;
		updateParty(activeParty.id, (party) => ({
			...party,
			tabs: party.tabs.map((item) =>
				item.id === tab.id ? { ...item, active: !item.active } : item,
			),
		}));
		setModal(null);
	}

	function toggleMenuItemActive(item: MenuItem) {
		if (!activeParty) return;
		updateParty(activeParty.id, (party) => ({
			...party,
			menu: party.menu.map((menuItem) =>
				menuItem.id === item.id
					? { ...menuItem, active: !menuItem.active }
					: menuItem,
			),
		}));
		setModal(null);
	}

	function registerConsumption(menuItemId: string) {
		const menuItem = activeParty?.menu.find((menu) => menu.id === menuItemId);
		if (!activeParty?.active || !selectedActiveTab || !menuItem?.active) return;
		updateParty(activeParty.id, (party) => ({
			...party,
			consumptions: [
				...party.consumptions,
				{
					id: createId(),
					tabId: selectedTab,
					menuItemId: menuItem.id,
					itemName: menuItem.name,
					price: menuItem.price,
					createdAt: new Date().toISOString(),
				},
			],
		}));
		setToast("Item registrado");
	}

	function deleteConsumption(consumptionId: string) {
		if (
			!activeParty ||
			!window.confirm("Tem certeza que deseja remover este consumo?")
		)
			return;
		updateParty(activeParty.id, (party) => ({
			...party,
			consumptions: party.consumptions.filter(
				(consumption) => consumption.id !== consumptionId,
			),
		}));
	}

	return (
		<main
			className="app-shell"
			onCopy={(event) => event.preventDefault()}
			onCut={(event) => event.preventDefault()}
		>
			<div className="app-container">
				<header className="hero">
					<h1>Controle Festa</h1>
					<p>{activePartyHeader}</p>
				</header>

				<div className="layout">
					<Nav
						current={section}
						disabled={!activeParty}
						onChange={setSection}
					/>

					<div className="content">
						{section === "parties" && (
							<PartiesPage
								visibleParties={visibleParties}
								archivedParties={archivedParties}
								showArchived={showArchived}
								onToggleArchived={() => setShowArchived((value) => !value)}
								onCreateParty={() => openPartyForm()}
								onOpenPartyDetails={(partyId) => {
									setSelectedPartyDetailId(partyId);
									setModal("partyDetails");
								}}
							/>
						)}

						{section === "tabs" && activeParty && (
							<TabsPage
								party={activeParty}
								onCreateTab={() => openTabForm()}
								onOpenTabDetails={(tabId) => {
									setSelectedTabDetailId(tabId);
									setModal("tabDetails");
								}}
							/>
						)}

						{section === "menu" && activeParty && (
							<MenuPage
								party={activeParty}
								onCreateMenuItem={() => openMenuForm()}
								onOpenMenuDetails={(itemId) => {
									setSelectedMenuDetailId(itemId);
									setModal("menuDetails");
								}}
							/>
						)}

						{section === "consumption" && activeParty && (
							<ConsumptionPage
								activeMenu={activeMenu}
								activeTabs={activeTabs}
								hasActiveTabsAndMenu={canRegisterConsumption}
								selectedTab={selectedTab}
								selectedTabConsumptions={selectedTabConsumptions}
								selectedActiveTab={selectedActiveTab}
								showRegistered={showRegistered}
								onDeleteConsumption={deleteConsumption}
								onRegisterConsumption={registerConsumption}
								onSelectTab={(tabId) =>
									setAppData((current) => ({
										...current,
										selectedTabId: tabId,
									}))
								}
								onToggleRegistered={() => setShowRegistered((value) => !value)}
							/>
						)}

						{section === "balances" && activeParty && (
							<BalancesPage
								party={activeParty}
								balanceTabs={balanceTabs}
								totals={totals}
							/>
						)}
					</div>
				</div>
			</div>

			{toast && (
				<div className="toast" role="status" aria-live="polite">
					{toast}
				</div>
			)}

			<EntityDetails
				modal={modal}
				partyDetail={selectedPartyDetail}
				tabDetail={selectedTabDetail}
				menuDetail={selectedMenuDetail}
				onClose={() => setModal(null)}
				onArchiveParty={archiveParty}
				onDeleteMenuItem={deleteMenuItem}
				onDeleteParty={deleteParty}
				onDeleteTab={deleteTab}
				onEditMenuItem={openMenuForm}
				onEditParty={openPartyForm}
				onEditTab={openTabForm}
				onSetActiveParty={setActiveParty}
				onToggleMenuItem={toggleMenuItemActive}
				onToggleTab={toggleTabActive}
				onUnarchiveParty={unarchiveParty}
			/>

			<EntityForms
				editingId={editingId}
				modal={modal}
				partyForm={partyForm}
				tabForm={tabForm}
				menuForm={menuForm}
				onClose={() => setModal(null)}
				onPartyFormChange={setPartyForm}
				onTabFormChange={setTabForm}
				onMenuFormChange={setMenuForm}
				onSaveParty={saveParty}
				onSaveTab={saveTab}
				onSaveMenu={saveMenu}
			/>
		</main>
	);
}

function getInitialSection(appData: AppData): SectionId {
	const party = findActiveParty(appData);
	return party &&
		hasActiveTabsAndMenu(getActiveTabs(party), getActiveMenu(party))
		? "consumption"
		: "parties";
}

export default App;
