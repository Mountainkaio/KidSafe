import { useState } from "react";
import { FiUsers, FiArrowRight, FiArrowLeft, FiCheck, FiShield, FiInfo } from "react-icons/fi";
import Modal from "../Modal.jsx";
import ClassIndBadge from "../ClassIndBadge.jsx";
import { linkDevice } from "../../api/devices.js";
import {
	AGE_GROUP_OPTIONS,
	CLASSIND_RATINGS,
	getDefaultBlockedRatings,
} from "../../data/classIndData.js";

export default function PairDeviceModal({ onClose, onLinked }) {
	const [step, setStep] = useState(1); // 1: code input | 2: age group selection
	const [code, setCode] = useState("");
	const [selectedAgeGroup, setSelectedAgeGroup] = useState("10-11");
	const [blockedRatings, setBlockedRatings] = useState(() =>
		getDefaultBlockedRatings("10-11")
	);
	const [status, setStatus] = useState("idle"); // idle | checking | error
	const [error, setError] = useState("");

	function handleAgeGroupSelect(ageId) {
		setSelectedAgeGroup(ageId);
		setBlockedRatings(getDefaultBlockedRatings(ageId));
	}

	function handleToggleRating(ratingId) {
		setBlockedRatings((prev) =>
			prev.includes(ratingId)
				? prev.filter((r) => r !== ratingId)
				: [...prev, ratingId]
		);
	}

	function handleProceedToAge(event) {
		event.preventDefault();
		const trimmedCode = code.trim().toUpperCase();
		if (!trimmedCode) {
			setError("Informe o código de acesso.");
			return;
		}
		setError("");
		setStep(2);
	}

	async function handleFinalSubmit() {
		setStatus("checking");
		setError("");

		try {
			const data = await linkDevice({
				pairingCode: code.trim().toUpperCase(),
				childAgeGroup: selectedAgeGroup,
				blockedRatings,
			});
			onLinked(data.device);
			onClose();
		} catch (submitError) {
			setError(submitError.message || "Erro ao vincular dispositivo.");
			setStatus("error");
		}
	}

	return (
		<Modal
			title={step === 1 ? "Ligar novo dispositivo" : "Faixa Etária da Criança"}
			onClose={onClose}
		>
			{step === 1 ? (
				<div className="pair-modal-step">
					<p className="pair-modal__intro">
						Digite o código gerado pela extensão KidSafe instalada no navegador do
						computador da criança para iniciar o vínculo.
					</p>

					<form onSubmit={handleProceedToAge} className="pair-modal__form">
						<label>
							CÓDIGO DE ACESSO
							<input
								type="text"
								value={code}
								onChange={(event) => setCode(event.target.value)}
								placeholder="Ex: A1B2C3"
								maxLength={8}
								required
								autoFocus
							/>
						</label>

						{error && (
							<p className="pair-modal__error" role="alert">
								{error}
							</p>
						)}

						<button
							type="submit"
							className="button button--primary"
							disabled={!code.trim()}
						>
							Continuar para Faixa Etária
							<FiArrowRight style={{ marginLeft: "8px" }} />
						</button>
					</form>

					<p className="pair-modal__hint">
						O código de pareamento aparece na janela da extensão KidSafe quando ela é
						aberta no computador da criança.
					</p>
				</div>
			) : (
				<div className="pair-modal-step pair-modal-step--age">
					<div className="pair-modal__age-intro">
						<div className="pair-modal__age-badge-icon">
							<FiUsers />
						</div>
						<div>
							<h3 className="pair-modal__age-title">
								Quem utilizará este computador?
							</h3>
							<p className="pair-modal__age-desc">
								Antes de concluir o vínculo, informe a faixa etária da criança.
								Com base nisso, o KidSafe configurará previamente os bloqueios do{" "}
								<strong>Sistema de Classificação Indicativa Brasileiro (ClassInd)</strong>.
							</p>
						</div>
					</div>

					<div className="pair-age-selector-grid">
						{AGE_GROUP_OPTIONS.map((opt) => {
							const isSelected = selectedAgeGroup === opt.id;
							return (
								<button
									key={opt.id}
									type="button"
									className={`pair-age-card ${isSelected ? "pair-age-card--selected" : ""}`}
									onClick={() => handleAgeGroupSelect(opt.id)}
								>
									<div className="pair-age-card__header">
										<span className="pair-age-card__label">{opt.label}</span>
										{isSelected && <FiCheck className="pair-age-card__check" />}
									</div>
									<span className="pair-age-card__category">{opt.category}</span>
									<span className="pair-age-card__desc">{opt.description}</span>
								</button>
							);
						})}
					</div>

					{/* PREVIEW DE CLASSIFICAÇÃO INDICATIVA */}
					<div className="pair-classind-preview">
						<div className="pair-classind-preview__header">
							<FiShield className="pair-classind-preview__icon" />
							<div>
								<strong>Classificações Indicativas Brasileiras aplicadas:</strong>
								<span className="pair-classind-preview__sub">
									Clique em um selo para personalizar o bloqueio:
								</span>
							</div>
						</div>

						<div className="pair-classind-badges-row">
							{CLASSIND_RATINGS.map((rating) => {
								const isBlocked = blockedRatings.includes(rating.id);
								return (
									<ClassIndBadge
										key={rating.id}
										ratingId={rating.id}
										size="medium"
										isBlocked={isBlocked}
										isClickable={true}
										onClick={handleToggleRating}
										showLabel={true}
										showStatus={true}
									/>
								);
							})}
						</div>

						<div className="pair-classind-notice">
							<FiInfo style={{ flexShrink: 0, marginTop: "2px" }} />
							<p>
								Ao navegar, a extensão procurará no HTML das páginas pelas tags oficiais
								de idade (ClassInd, Schema.org, OpenGraph) e bloqueará automaticamente os
								sites identificados com as classificações marcadas como bloqueadas.
							</p>
						</div>
					</div>

					{error && (
						<p className="pair-modal__error" role="alert">
							{error}
						</p>
					)}

					<div className="pair-modal__footer-actions">
						<button
							type="button"
							className="button button--secondary"
							onClick={() => setStep(1)}
							disabled={status === "checking"}
						>
							<FiArrowLeft style={{ marginRight: "6px" }} />
							Voltar
						</button>
						<button
							type="button"
							className="button button--primary"
							onClick={handleFinalSubmit}
							disabled={status === "checking"}
						>
							{status === "checking"
								? "Concluindo vínculo..."
								: "Concluir Vínculo e Ativar Proteção"}
						</button>
					</div>
				</div>
			)}
		</Modal>
	);
}
