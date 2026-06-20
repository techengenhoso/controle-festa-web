import { MenuPage as MenuFeaturePage } from "../../features/menu/ui/MenuPage";
import type { Party } from "../../features/party/model/types";

type MenuPageProps = {
	party: Party;
	onCreateMenuItem: () => void;
	onOpenMenuDetails: (itemId: string) => void;
};

export function MenuPage(props: MenuPageProps) {
	return <MenuFeaturePage {...props} />;
}
