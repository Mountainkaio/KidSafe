import { useState } from "react";
import { FiShield, FiTag, FiInfo, FiCheck } from "react-icons/fi";
import Modal from "../Modal.jsx";
import ClassIndBadge from "../ClassIndBadge.jsx";
import { CLASSIND_RATINGS, CLASSIND_KEYWORDS } from "../../data/classIndData.js";
import {
	addBlockedKeyword,
	removeBlockedKeyword,
	updateAgeRatings,
} from "../../api/devices.js";

export default function BlockedKeywordsModal({
	keywords,
	deviceId,
	device,
	onClose,
	onChanged,
}) {
	const [word, setWord] = useState("");
	const [error, setError] = useState("");
	const [showKeywordsList, setShowKeywordsList] = useState(false);
	const [blockedRatings, setBlockedRatings] = useState(() => {
		if (Array.isArray(device?.blockedRatings)) return [...device.blockedRatings];
		return (device?.blockedRatings || "12,14,16,18")
			.split(",")
			.map((r) => r.trim())
			.filter(Boolean);
	});

	async function handleToggleClassInd(ratingId) {
		const updated = blockedRatings.includes(ratingId)
			? blockedRatings.filter((r) => r !== ratingId)
			: [...blockedRatings, ratingId];
		setBlockedRatings(updated);
		try {
			await updateAgeRatings({ blockedRatings: updated, deviceId });
		} catch (e) {
			alert("Erro ao atualizar classificação indicativa.");
		}
	}

	async function handleAdd(event) {
		event.preventDefault();
		setError("");
		try {
			const data = await addBlockedKeyword(word.trim().toLowerCase(), deviceId);
			onChanged(data.blockedKeywords);
			setWord("");
		} catch (submitError) {
			setError(submitError.message);
		}
	}

	async function handleRemove(id) {
		const data = await removeBlockedKeyword(id, deviceId);
		onChanged(data.blockedKeywords);
	}

	const totalRatingKeywords = blockedRatings.reduce((acc, ratingId) => {
		return acc + (CLASSIND_KEYWORDS[ratingId]?.length || 0);
	}, 0);

	return (
		<Modal title="Palavras-chave e Classificação Indicativa" onClose={onClose}>
			{/* CLASSIFICAÇÃO INDICATIVA */}
			<div className="blocked-classind-box">
				<div className="blocked-classind-box__header">
					<div>
						<strong>Classificação Indicativa (ClassInd)</strong>
						<p>
							Clique para definir quais classificações a extensão deve bloquear
							via tags de idade e palavras-chave em tags <code>content</code>:
						</p>
					</div>
					<span className="blocked-classind-box__count">
						{blockedRatings.length} bloqueada(s)
					</span>
				</div>
				<div className="blocked-classind-badges-grid">
					{CLASSIND_RATINGS.map((rating) => {
						const isBlocked = blockedRatings.includes(rating.id);
						return (
							<div
								key={rating.id}
								className={`blocked-classind-pill ${
									isBlocked ? "is-blocked" : "is-allowed"
								}`}
								onClick={() => handleToggleClassInd(rating.id)}
								title={`Clique para ${
									isBlocked ? "liberar" : "bloquear"
								} ${rating.fullName}`}
							>
								<ClassIndBadge
									ratingId={rating.id}
									size="small"
									isBlocked={isBlocked}
								/>
								<span className="blocked-classind-pill__text">
									{rating.label}
								</span>
								<span className="blocked-classind-pill__status">
									{isBlocked ? "Bloqueado" : "Liberado"}
								</span>
							</div>
						);
					})}
				</div>

				{/* PRÉVIA DE PALAVRAS-CHAVE AUTOMÁTICAS POR IDADE */}
				<div className="blocked-keywords-age-info">
					<div className="blocked-keywords-age-info__header">
						<div className="blocked-keywords-age-info__title">
							<FiShield className="icon-shield" />
							<span>
								<strong>{totalRatingKeywords} palavras-chave ativas</strong> monitoradas em tags <code>&lt;meta content="..."&gt;</code>
							</span>
						</div>
						<button
							type="button"
							className="blocked-keywords-age-info__toggle"
							onClick={() => setShowKeywordsList(!showKeywordsList)}
						>
							{showKeywordsList ? "Ocultar termos" : "Ver termos monitorados"}
						</button>
					</div>

					{showKeywordsList && (
						<div className="blocked-keywords-age-info__list">
							{CLASSIND_RATINGS.filter((r) => blockedRatings.includes(r.id)).map((r) => {
								const kws = CLASSIND_KEYWORDS[r.id] || [];
								if (kws.length === 0) return null;
								return (
									<div key={r.id} className="blocked-keywords-age-group">
										<div className="blocked-keywords-age-group__header">
											<ClassIndBadge ratingId={r.id} size="small" isBlocked={true} />
											<strong>{r.fullName} ({kws.length} termos)</strong>
										</div>
										<div className="blocked-keywords-tags-cloud">
											{kws.map((kw, i) => (
												<span key={i} className="blocked-keywords-tag">
													{kw}
												</span>
											))}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			<div className="keywords-subtitle-row">
				<strong>Palavras-chave personalizadas adicionais:</strong>
				<p className="keywords-subtitle-desc">
					A extensão também verifica estas palavras em tags de conteúdo (<code>&lt;meta name="keywords"&gt;</code>, <code>&lt;meta name="description"&gt;</code>) e no texto da página:
				</p>
			</div>

			<ul className="tool-list">
				{keywords.length === 0 && (
					<li className="tool-list__empty">Nenhuma palavra-chave personalizada adicionada.</li>
				)}
				{keywords.map((keyword) => (
					<li key={keyword.id}>
						<span>{keyword.word}</span>
						<button
							type="button"
							className="tool-list__remove"
							onClick={() => handleRemove(keyword.id)}
						>
							Remover
						</button>
					</li>
				))}
			</ul>

			<form onSubmit={handleAdd} className="tool-form tool-form--inline">
				<label>
					Adicionar novo bloqueio
					<input
						type="text"
						placeholder="digite a palavra-chave:"
						value={word}
						onChange={(event) => setWord(event.target.value)}
						required
					/>
				</label>

				{error && <p role="alert">{error}</p>}

				<button type="submit" className="button button--primary button--small">
					Adicionar
				</button>
			</form>
		</Modal>
	);
}
