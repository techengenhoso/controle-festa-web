import { ConsumptionPage as ConsumptionFeaturePage } from "../../features/consumption/ui/ConsumptionPage";
import type { Consumption, MenuItem, Tab } from "../../features/party/model/types";
import { formatCurrency } from "../../shared/utils/currency";

type ConsumptionPageProps = {
	activeMenu: MenuItem[];
	activeTabs: Tab[];
	hasActiveTabsAndMenu: boolean;
	selectedTab: string;
	selectedTabConsumptions: Consumption[];
	selectedActiveTab?: Tab;
	selectedTabRemaining: number;
	showRegistered: boolean;
	onDeleteConsumption: (consumptionId: string) => void;
	onRegisterConsumption: (menuItemId: string) => void;
	onSelectTab: (tabId: string) => void;
	onToggleRegistered: () => void;
};

export function ConsumptionPage(props: ConsumptionPageProps) {
	const minimumStatus =
		props.selectedTabRemaining > 0
			? `a consumir ${formatCurrency(props.selectedTabRemaining)}`
			: "mínimo consumido";

	return (
		<>
			<ConsumptionFeaturePage {...props} />

      <div className="party-support">
        <b className="party-support-link">
          {minimumStatus}
        </b>
      </div>
		</>
	);
}
