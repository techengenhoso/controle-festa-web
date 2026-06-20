import { BalancesPage as BalancesFeaturePage } from "../../features/balances/ui/BalancesPage";
import type { Party, Tab } from "../../features/party/model/types";

type BalancesPageProps = {
	party: Party;
	balanceTabs: Tab[];
	totals: { consumed: number; minimum: number };
};

export function BalancesPage(props: BalancesPageProps) {
	return <BalancesFeaturePage {...props} />;
}
