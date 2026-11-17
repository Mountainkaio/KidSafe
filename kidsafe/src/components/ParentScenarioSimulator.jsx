import { useState } from "react";
import {
	FiSmartphone,
	FiEye,
	FiClock,
	FiHelpCircle,
	FiCheckCircle,
	FiAlertCircle,
	FiCircle,
	FiShield,
	FiBookOpen,
} from "react-icons/fi";
import { IoGameControllerOutline } from "react-icons/io5";
import { parentScenarios } from "../data/interactiveScenarios.js";
import { articlesData } from "../data/articlesData.js";
import ArticleModal from "./ArticleModal.jsx";

function getScenarioIcon(type) {
	switch (type) {
		case "gamepad":
			return <IoGameControllerOutline className="simulator-tab-icon" />;
		case "smartphone":
			return <FiSmartphone className="simulator-tab-icon" />;
		case "eye":
			return <FiEye className="simulator-tab-icon" />;
		case "clock":
			return <FiClock className="simulator-tab-icon" />;
		default:
			return <FiHelpCircle className="simulator-tab-icon" />;
	}
}

export default function ParentScenarioSimulator() {
	const [selectedScenarioId, setSelectedScenarioId] = useState(
		parentScenarios[0].id
	);
	const [userChoices, setUserChoices] = useState({});
	const [activeArticleModal, setActiveArticleModal] = useState(null);

	const currentScenario =
		parentScenarios.find((s) => s.id === selectedScenarioId) ||
		parentScenarios[0];

	const selectedOptionId = userChoices[currentScenario.id];
	const selectedOption = currentScenario.interactiveOptions.find(
		(opt) => opt.id === selectedOptionId
	);

	function handleSelectOption(optionId) {
		setUserChoices((prev) => ({
			...prev,
			[currentScenario.id]: optionId,
		}));
	}

	function handleOpenRelatedArticle(articleId) {
		const found = articlesData.find((a) => a.id === articleId);
		if (found) {
			setActiveArticleModal(found);
		}
	}

	return (
		<section id="quiz-cenarios" className="parent-simulator-section">
			<div className="container">
				<div className="parent-simulator-header">
					<span className="section-eyebrow">Diagnóstico Prático</span>
					<h2 className="section-title">
						Quiz de Cenários: O Que Fazer Diante dos Desafios Digitais?
					</h2>
					<p className="section-subtitle">
						Escolha uma situação comum do dia a dia com seus filhos, teste como você
						reagiria e receba instantaneamente a orientação preventiva recomendada.
					</p>
				</div>

				{/* ABAS / SELETOR DE CENÁRIOS */}
				<div className="parent-simulator-tabs">
					{parentScenarios.map((scenario) => (
						<button
							key={scenario.id}
							type="button"
							className={`simulator-tab-btn ${
								selectedScenarioId === scenario.id
									? "simulator-tab-btn--active"
									: ""
							}`}
							onClick={() => setSelectedScenarioId(scenario.id)}
						>
							<span className="simulator-tab-icon-wrap">
								{getScenarioIcon(scenario.iconType)}
							</span>
							<div className="simulator-tab-texts">
								<span className="simulator-tab-age">{scenario.ageGroup}</span>
								<span className="simulator-tab-title">{scenario.title}</span>
							</div>
						</button>
					))}
				</div>

				{/* PAINEL DO CENÁRIO ATIVO */}
				<div className="parent-simulator-card">
					<div className="simulator-card-top">
						<div className="simulator-card-badge-row">
							<span className="simulator-badge">
								{currentScenario.category}
							</span>
							<span className="simulator-badge simulator-badge--age">
								Faixa: {currentScenario.ageGroup}
							</span>
						</div>
						<h3 className="simulator-card-title">{currentScenario.title}</h3>
						<p className="simulator-card-situation">
							<strong>O Cenário:</strong> {currentScenario.situation}
						</p>
					</div>

					{/* DESAFIO INTERATIVO */}
					<div className="simulator-interactive-box">
						<h4 className="simulator-interactive-question">
							<FiHelpCircle className="simulator-question-icon" />
							<span>{currentScenario.quizQuestion}</span>
						</h4>
						<div className="simulator-options-grid">
							{currentScenario.interactiveOptions.map((opt) => (
								<button
									key={opt.id}
									type="button"
									className={`simulator-option-card ${
										selectedOptionId === opt.id
											? opt.isBest
												? "simulator-option-card--selected-best"
												: "simulator-option-card--selected-warn"
											: ""
									}`}
									onClick={() => handleSelectOption(opt.id)}
								>
									<span className="simulator-option-check">
										{selectedOptionId === opt.id ? (
											opt.isBest ? (
												<FiCheckCircle className="icon-success" />
											) : (
												<FiAlertCircle className="icon-warning" />
											)
										) : (
											<FiCircle className="icon-neutral" />
										)}
									</span>
									<span className="simulator-option-label">{opt.label}</span>
								</button>
							))}
						</div>

						{/* FEEDBACK DA ESCOLHA */}
						{selectedOption && (
							<div
								className={`simulator-feedback-banner ${
									selectedOption.isBest
										? "simulator-feedback-banner--success"
										: "simulator-feedback-banner--warning"
								}`}
							>
								<strong>
									{selectedOption.isBest
										? "Excelente escolha!"
										: "Atenção ao detalhe:"}
								</strong>
								<p>{selectedOption.feedback}</p>
							</div>
						)}
					</div>

					{/* RODAPÉ DO SIMULADOR: AÇÃO TÉCNICA E ARTIGO RELACIONADO */}
					<div className="simulator-card-footer">
						<div className="simulator-footer-kidsafe">
							<span className="kidsafe-pill-icon">
								<FiShield />
							</span>
							<div>
								<strong>Como o KidSafe atua nessa situação:</strong>
								<p>{currentScenario.recommendedApproach.kidsafeAction}</p>
							</div>
						</div>

						{currentScenario.recommendedApproach.relatedArticleId && (
							<button
								type="button"
								className="button button--primary simulator-read-article-btn"
								onClick={() =>
									handleOpenRelatedArticle(
										currentScenario.recommendedApproach.relatedArticleId
									)
								}
							>
								<FiBookOpen style={{ marginRight: "8px" }} />
								<span>Ver Artigo Completo Sobre Isso →</span>
							</button>
						)}
					</div>
				</div>
			</div>

			{activeArticleModal && (
				<ArticleModal
					article={activeArticleModal}
					onClose={() => setActiveArticleModal(null)}
				/>
			)}
		</section>
	);
}
