import { Button } from "../../../shared/ui/Button";

type NfcScannerButtonProps = {
	status: "unsupported" | "idle" | "scanning" | "error";
	onStart: () => void;
};

const labels = {
	unsupported: "NFC indisponível",
	idle: "Ativar NFC",
	scanning: "NFC ativo",
	error: "Reativar NFC",
} as const;

export function NfcScannerButton({ status, onStart }: NfcScannerButtonProps) {
	return (
		<div className="nfc-scanner">
			<Button
				variant={status === "scanning" ? "secondary" : "primary"}
				disabled={status === "unsupported"}
				onClick={onStart}
				type="button"
			>
				{labels[status]}
			</Button>
			<span>
				{status === "scanning"
					? "Aproxime o cartão para abrir a comanda em consumos."
					: "O navegador pode pedir permissão antes da leitura."}
			</span>
		</div>
	);
}
