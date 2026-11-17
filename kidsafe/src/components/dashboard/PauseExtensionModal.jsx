import { useState } from "react";
import Modal from "../Modal.jsx";
import { setExtensionEnabled } from "../../api/devices.js";

export default function PauseExtensionModal({
	currentlyEnabled,
	deviceId,
	onClose,
	onChanged,
}) {
	const [status, setStatus] = useState("idle");
	const nextValue = !currentlyEnabled;

	async function handleConfirm() {
		setStatus("saving");
		try {
			const data = await setExtensionEnabled(nextValue, deviceId);
			onChanged(data.device);
			onClose();
		} catch (error) {
			setStatus("error");
		}
	}

	return (
		<Modal
			title={nextValue ? "Retomar extensão" : "Pausar extensão"}
			onClose={onClose}
		>
			<p className="lock-modal__question">
				{nextValue
					? "A extensão voltará a bloquear sites, palavras-chave e horários neste dispositivo."
					: "Enquanto pausada, a extensão não bloqueia nada neste dispositivo. Deseja continuar?"}
			</p>

			{status === "error" && (
				<p role="alert">Não foi possível concluir. Tente novamente.</p>
			)}

			<div className="lock-modal__actions">
				<button
					type="button"
					className="button button--primary"
					onClick={handleConfirm}
					disabled={status === "saving"}
				>
					Sim
				</button>
				<button type="button" className="button button--secondary" onClick={onClose}>
					Não
				</button>
			</div>
		</Modal>
	);
}