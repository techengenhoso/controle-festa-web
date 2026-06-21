import { Section } from "../../../shared/ui/Section";
import { formatCurrency } from "../../../shared/utils/currency";
import {
	getRemainingMinimum,
	sumConsumptionsByTab,
} from "../../party/model/selectors";
import type { Party, Tab } from "../../party/model/types";

type BalancesPageProps = {
	party: Party;
	balanceTabs: Tab[];
	totals: { consumed: number; minimum: number };
};

export function BalancesPage({
	party,
	balanceTabs,
	totals,
}: BalancesPageProps) {
	return (
		<Section title="Saldos">
			{balanceTabs.length === 0 ? (
				<div className="empty-state">
					<p>não existe nenhuma comanda ativa</p>
				</div>
			) : (
        <>
          <div className="totals">
            <strong>Total consumido: {formatCurrency(totals.consumed)}</strong>
            <strong>Total a consumir: {formatCurrency(totals.minimum)}</strong>
          </div>

          <div className="grid-list">
            {balanceTabs.map((tab) => {
              const consumed = sumConsumptionsByTab(party, tab.id);
              const remaining = getRemainingMinimum(party, tab);

              return (
                <article className="card" key={tab.id}>
                  <div>
                    <h3>{tab.code}</h3>

                    <p className="balance-summary">
                      <span>Consumido {formatCurrency(consumed)}</span>

                      <span>
                        {remaining > 0
                          ? `A consumir ${formatCurrency(remaining)}`
                          : "Mínimo consumido"}
                      </span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
			)}
		</Section>
	);
}
