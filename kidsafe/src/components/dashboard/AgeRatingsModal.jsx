import { useState } from "react";
import { FiShield, FiInfo, FiCheck, FiRefreshCw } from "react-icons/fi";
import Modal from "../Modal.jsx";
import ClassIndBadge from "../ClassIndBadge.jsx";
import { updateAgeRatings } from "../../api/devices.js";
import {
	AGE_GROUP_OPTIONS,
	CLASSIND_RATINGS,
	getDefaultBlockedRatings,
} from "../../data/classIndData.js";

export default function AgeRatingsModal({
	device,
	deviceId,
	onClose,
	onChanged,
}) {
	const [childAgeGroup, setChildAgeGroup] = useState(
		() => device?.childAgeGroup || "10-11"
	);
	const [blockedRatings, setBlockedRatings] = useState(() => {
		if (Array.isArray(device?.blockedRatings)) return [...device.blockedRatings];
		return getDefaultBlockedRatings(device?.childAgeGroup || "10-11");
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	function handleAgeGroupChange(ageId) {
		setChildAgeGroup(ageId);
		setBlockedRatings(getDefaultBlockedRatings(ageId));
		setSuccessMsg("");
	}

	function handleToggleRating(ratingId) {
		setBlockedRatings((prev) =>
			prev.includes(ratingId)
				? prev.filter((r) => r !== ratingId)
				: [...prev, ratingId]
		);
		setSuccessMsg("");
	}

	async function handleSave() {
		setLoading(true);
		setError("");
		setSuccessMsg("");

		try {
			const data = await updateAgeRatings({
				childAgeGroup,
				blockedRatings,
				deviceId: deviceId || device?.id,
			});
			if (onChanged) {
				onChanged(data.device || { childAgeGroup, blockedRatings });
			}
			setSuccessMsg("Regras de classificação indicativa atualizadas com sucesso!");
			setTimeout(() => {
				onClose();
			}, 900);
		} catch (err) {
			setError(err.message || "Erro ao atualizar classificações indicativas.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal title="Classificação Indicativa (ClassInd)" onClose={onClose}>
			<div className="age-ratings-modal">
				<div className="age-ratings-intro">
					<FiShield className="age-ratings-intro__icon" />
					<div>
						<p>
							O KidSafe integra o{" "}
							<strong>Sistema de Classificação Indicativa Brasileiro (ClassInd)</strong>.
							Ao navegar, a extensão inspeciona o código HTML das páginas em busca
							de tags de idade (ClassInd, Schema.org, OpenGraph e itemprop) e bloqueia
							páginas com conteúdo impróprio para a faixa selecionada.
						</p>
					</div>
				</div>

				<div className="age-ratings-section">
					<label className="age-ratings-section__title">
						Faixa Etária do Usuário deste Dispositivo:
					</label>
					<div className="pair-age-selector-grid">
						{AGE_GROUP_OPTIONS.map((opt) => {
							const isSelected = childAgeGroup === opt.id;
							return (
								<button
									key={opt.id}
									type="button"
									className={`pair-age-card ${
										isSelected ? "pair-age-card--selected" : ""
									}`}
									onClick={() => handleAgeGroupChange(opt.id)}
								>
									<div className="pair-age-card__header">
										<span className="pair-age-card__label">{opt.label}</span>
										{isSelected && <FiCheck className="pair-age-card__check" />}
									</div>
									<span className="pair-age-card__category">{opt.category}</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="age-ratings-section">
					<div className="age-ratings-section__header-row">
						<label className="age-ratings-section__title">
							Classificações Indicativas Brasileiras:
						</label>
						<span className="age-ratings-section__hint">
							Clique nos selos para alternar entre bloqueado e liberado
						</span>
					</div>

					<div className="age-ratings-badges-list">
						{CLASSIND_RATINGS.map((rating) => {
							const isBlocked = blockedRatings.includes(rating.id);
							return (
								<div
									key={rating.id}
									className={`age-rating-card-item ${
										isBlocked ? "is-blocked" : "is-allowed"
									}`}
									onClick={() => handleToggleRating(rating.id)}
								>
									<ClassIndBadge
										ratingId={rating.id}
										size="medium"
										isBlocked={isBlocked}
										isClickable={false}
									/>
									<div className="age-rating-card-item__text">
										<div className="age-rating-card-item__name">
											<strong>{rating.fullName}</strong>
											<span
												className={`classind-status-tag ${
													isBlocked
														? "classind-status-tag--blocked"
														: "classind-status-tag--allowed"
												}`}
											>
												{isBlocked ? "Bloqueado" : "Liberado"}
											</span>
										</div>
										<p className="age-rating-card-item__desc">
											{rating.targetDesc}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="age-ratings-html-tags-box">
					<FiInfo className="html-tags-box-icon" />
					<div>
						<strong>Como funciona o bloqueio no navegador:</strong>
						<p>
							Sites e plataformas como YouTube, Netflix, portais de notícias e jogos
							possuem tags como <code>&lt;meta name="rating"&gt;</code>,{" "}
							<code>&lt;meta itemprop="contentRating"&gt;</code> ou Schema.org no HTML.
							A extensão KidSafe lê essas tags e impede o acesso se a classificação
							estiver marcada como bloqueada.
						</p>
					</div>
				</div>

				{error && (
					<p className="pair-modal__error" role="alert">
						{error}
					</p>
				)}

				{successMsg && (
					<p className="age-ratings-success" role="status">
						<FiCheck style={{ marginRight: "6px" }} />
						{successMsg}
					</p>
				)}

				<div className="age-ratings-modal__actions">
					<button
						type="button"
						className="button button--secondary"
						onClick={onClose}
						disabled={loading}
					>
						Cancelar
					</button>
					<button
						type="button"
						className="button button--primary"
						onClick={handleSave}
						disabled={loading}
					>
						{loading ? "Salvando..." : "Salvar Configuração de Classificação"}
					</button>
				</div>
			</div>
		</Modal>
	);
}
