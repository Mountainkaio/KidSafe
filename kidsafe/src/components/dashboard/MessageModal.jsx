import { useState } from "react";
import Modal from "../Modal.jsx";
import { sendMessage } from "../../api/devices.js";

export default function MessageModal({ deviceId, onClose }) {
	const [content, setContent] = useState("");
	const [status, setStatus] = useState("idle");

	async function handleSubmit(event) {
		event.preventDefault();
		setStatus("sending");
		try {
			await sendMessage(content, deviceId);
			setStatus("sent");
			setContent("");
		} catch (error) {
			setStatus("error");
		}
	}

	return (
		<Modal title="Mensagem de aviso" onClose={onClose}>
			<form onSubmit={handleSubmit} className="tool-form">
				<label>
					Escreva aqui
					<textarea
						rows={4}
						value={content}
						onChange={(event) => setContent(event.target.value)}
						required
					/>
				</label>

				{status === "sent" && (
					<p className="tool-form__feedback">Mensagem enviada.</p>
				)}
				{status === "error" && (
					<p role="alert">Não foi possível enviar. Tente novamente.</p>
				)}

				<button
					type="submit"
					className="button button--primary"
					disabled={status === "sending"}
				>
					{status === "sending" ? "Enviando..." : "Enviar"}
				</button>
			</form>
		</Modal>
	);
}
