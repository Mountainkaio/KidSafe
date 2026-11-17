import { useState } from "react";
import { Link } from "react-router-dom";
import {
	FiUsers,
	FiClock,
	FiCheckSquare,
	FiShield,
	FiTag,
} from "react-icons/fi";
import Modal from "./Modal.jsx";

export default function ArticleModal({ article, onClose }) {
	const [checkedActions, setCheckedActions] = useState({});

	if (!article) return null;

	function toggleAction(idx) {
		setCheckedActions((prev) => ({
			...prev,
			[idx]: !prev[idx],
		}));
	}

	return (
		<Modal title={article.title} onClose={onClose}>
			<div className="article-modal__content">
				<div className="article-modal__header-meta">
					<div className="article-modal__badges">
						<span className={`article-badge article-badge--${article.type}`}>
							{article.category}
						</span>
						<span className="article-badge article-badge--age">
							<FiUsers className="icon-badge" />
							<span>Faixa: {article.ageBadge}</span>
						</span>
					</div>
					<span className="article-modal__time">
						<FiClock className="icon-badge" />
						<span>
							{article.readTime} • {article.date}
						</span>
					</span>
				</div>

				{article.subtitle && (
					<p className="article-modal__lead">{article.subtitle}</p>
				)}

				<div className="article-modal__body">
					{article.content.map((paragraph, idx) => (
						<p key={idx}>{paragraph}</p>
					))}
				</div>

				{/* PLANO DE AÇÃO PRÁTICO PARA PAIS (CHECKLIST) */}
				{article.parentActionPlan && (
					<div className="article-modal__action-plan">
						<h4>
							<FiCheckSquare className="icon-section" />
							<span>Plano de Ação Prático para Responsáveis:</span>
						</h4>
						<p className="article-modal__subtext">
							Marque as etapas que você já colocou em prática na sua casa:
						</p>
						<ul className="article-modal__checklist">
							{article.parentActionPlan.map((action, idx) => (
								<li
									key={idx}
									className={`article-modal__check-item ${
										checkedActions[idx] ? "is-checked" : ""
									}`}
									onClick={() => toggleAction(idx)}
								>
									<input
										type="checkbox"
										checked={!!checkedActions[idx]}
										onChange={() => toggleAction(idx)}
										id={`action-${idx}`}
									/>
									<label htmlFor={`action-${idx}`}>{action}</label>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* PALAVRAS-CHAVE */}
				{article.keywords && article.keywords.length > 0 && (
					<div className="article-modal__tags-row">
						<span className="article-modal__tags-label">
							<FiTag className="icon-tag-label" />
							<span>Palavras-chave:</span>
						</span>
						<div className="article-modal__tags">
							{article.keywords.map((kw) => (
								<span key={kw} className="article-tag">
									#{kw}
								</span>
							))}
						</div>
					</div>
				)}

				{/* CALL TO ACTION PARA A EXTENSÃO */}
				<div className="article-modal__extension-cta">
					<div className="article-modal__cta-text">
						<strong>
							<FiShield className="icon-cta-shield" />
							<span>Quer aplicar essas proteções no navegador?</span>
						</strong>
						<p>
							A extensão KidSafe complementa sua orientação bloqueando sites
							perigosos e programando intervalos de descanso automaticamente.
						</p>
					</div>
					<Link
						to="/ajuda/instalacao"
						className="button button--primary button--small"
						onClick={onClose}
					>
						Instalar extensão KidSafe →
					</Link>
				</div>

				{/* RODAPÉ DO MODAL */}
				<div className="article-modal__footer">
					<button
						type="button"
						className="button button--primary button--small"
						onClick={onClose}
					>
						Fechar Artigo
					</button>
				</div>
			</div>
		</Modal>
	);
}
