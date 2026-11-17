import { useState } from "react";
import Modal from "../Modal.jsx";
import { setLockScreen } from "../../api/devices.js";

export default function LockConfirmModal({
	currentlyLocked,
	deviceId,
	onClose,
	onChanged,
}) {
	const [status, setStatus] = useState("idle");
	const nextValue = !currentlyLocked;

	async function handleConfirm() {
		setStatus("saving");
		try {
			const data = await setLockScreen(nextValue, deviceId);
			onChanged(data.device);
			onClose();
		} catch (error) {
			setStatus("error");
		}
	}

	return (
		<Modal
			title={nextValue ? "Bloquear tela" : "Desbloquear tela"}
			onClose={onClose}
		>
			<p className="lock-modal__question">
				{nextValue
					? "Tem certeza que deseja bloquear a tela deste dispositivo agora?"
					: "Tem certeza que deseja desbloquear a tela deste dispositivo?"}
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
