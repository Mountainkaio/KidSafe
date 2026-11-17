import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	FiBookOpen,
	FiUsers,
	FiCheckSquare,
	FiShield,
	FiSearch,
	FiX,
	FiTag,
	FiDownload,
	FiRotateCcw,
	FiClock,
} from "react-icons/fi";
import { articlesData, ageFilterOptions, categoryFilterOptions } from "../data/articlesData.js";
import ArticleModal from "./ArticleModal.jsx";

export default function ArticlesSection({
	isDashboard = false,
	initialAge = "all",
	initialCategory = "all",
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedAge, setSelectedAge] = useState(initialAge);
	const [selectedCategory, setSelectedCategory] = useState(initialCategory);
	const [activeArticle, setActiveArticle] = useState(null);

	// Filtragem dinâmica
	const filteredArticles = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return articlesData.filter((article) => {
			// Filtro de Categoria
			if (selectedCategory !== "all" && article.type !== selectedCategory) {
				return false;
			}

			// Filtro de Idade
			if (selectedAge !== "all") {
				const matchesAge =
					article.targetAges.includes("all") ||
					article.targetAges.includes(selectedAge);
				if (!matchesAge) return false;
			}

			// Filtro de Busca por Palavra-Chave
			if (query) {
				const inTitle = article.title.toLowerCase().includes(query);
				const inSubtitle = article.subtitle?.toLowerCase().includes(query);
				const inSummary = article.summary.toLowerCase().includes(query);
				const inAgeBadge = article.ageBadge.toLowerCase().includes(query);
				const inKeywords = article.keywords?.some((kw) =>
					kw.toLowerCase().includes(query)
				);
				const inContent = article.content?.some((p) =>
					p.toLowerCase().includes(query)
				);

				if (
					!inTitle &&
					!inSubtitle &&
					!inSummary &&
					!inAgeBadge &&
					!inKeywords &&
					!inContent
				) {
					return false;
				}
			}

			return true;
		});
	}, [searchQuery, selectedAge, selectedCategory]);

	function handleKeywordClick(keyword) {
		setSearchQuery(keyword);
		const searchElem = document.getElementById(
			isDashboard ? "dashboard-articles-search" : "articles-search-bar"
		);
		if (searchElem) {
			searchElem.scrollIntoView({ behavior: "smooth", block: "center" });
			searchElem.focus();
		}
	}

	function handleClearFilters() {
		setSearchQuery("");
		setSelectedAge("all");
		setSelectedCategory("all");
	}

	const selectedAgeObj = ageFilterOptions.find((opt) => opt.id === selectedAge);

	return (
		<section
			id="artigos"
			className={`articles-section ${isDashboard ? "articles-section--dashboard" : ""}`}
		>
			<div className="container">
				{isDashboard ? (
					<div className="dashboard-articles-header">
						<h2 className="dashboard-panel__title">
							Central de Artigos e Orientações para Pais
						</h2>
						<p className="dashboard-articles-header__desc">
							Guias práticos e orientações por faixa etária para auxiliar no diálogo e na segurança digital dos seus filhos.
						</p>
					</div>
				) : (
					<div className="articles-header">
						<span className="section-eyebrow">
							Central de Tutoramento & Educação Parental
						</span>
						<h2 className="section-title">
							Artigos e Guias para Pais e Responsáveis
						</h2>
						<p className="section-subtitle">
							Aprenda como orientar e apoiar seus filhos em cada fase da vida digital.
							Filtre por faixa etária, pesquise por perigos específicos e consulte planos
							práticos de ação para guiar sua família com segurança.
						</p>

						{/* Barra de destaques educativos */}
						<div className="articles-stats-bar">
							<div className="articles-stat-pill">
								<FiBookOpen className="stat-pill-icon" />
								<span>
									<strong>{articlesData.length} Artigos</strong> e Guias Práticos
								</span>
							</div>
							<div className="articles-stat-pill">
								<FiUsers className="stat-pill-icon" />
								<span>
									Orientação por <strong>Faixa Etária</strong>
								</span>
							</div>
							<div className="articles-stat-pill">
								<FiCheckSquare className="stat-pill-icon" />
								<span>
									<strong>Planos de Ação</strong> Práticos
								</span>
							</div>
							<div className="articles-stat-pill articles-stat-pill--highlight">
								<FiShield className="stat-pill-icon" />
								<span>
									Integrado à <strong>Extensão KidSafe</strong>
								</span>
							</div>
						</div>
					</div>
				)}

				{/* BARRA DE PESQUISA & FILTROS */}
				<div className="articles-filter-panel">
					<div className="articles-search-box">
						<FiSearch className="articles-search-icon" aria-hidden="true" />
						<input
							id={isDashboard ? "dashboard-articles-search" : "articles-search-bar"}
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Pesquisar por assunto ou palavra-chave (ex: roblox, celular, regras, cyberbullying, tela)..."
							className="articles-search-input"
						/>
						{searchQuery && (
							<button
								type="button"
								className="articles-search-clear"
								onClick={() => setSearchQuery("")}
								aria-label="Limpar busca"
							>
								<FiX />
							</button>
						)}
					</div>

					{/* FILTRO DE FAIXA ETÁRIA */}
					<div className="articles-age-filter">
						<div className="articles-filter-label">
							<FiUsers className="filter-title-icon" />
							<strong>Filtrar por Faixa Etária:</strong>
							{selectedAgeObj && selectedAge !== "all" && (
								<span className="articles-age-desc">
									— {selectedAgeObj.rangeDesc}
								</span>
							)}
						</div>

						<div className="articles-age-pills">
							{ageFilterOptions.map((opt) => (
								<button
									key={opt.id}
									type="button"
									className={`age-pill ${
										selectedAge === opt.id ? "age-pill--active" : ""
									}`}
									onClick={() => setSelectedAge(opt.id)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					{/* FILTRO DE TEMAS / CATEGORIAS */}
					<div className="articles-cat-filter">
						<div className="articles-filter-label">
							<FiTag className="filter-title-icon" />
							<strong>Tema:</strong>
						</div>
						<div className="articles-cat-pills">
							{categoryFilterOptions.map((opt) => (
								<button
									key={opt.id}
									type="button"
									className={`cat-pill ${
										selectedCategory === opt.id ? "cat-pill--active" : ""
									}`}
									onClick={() => setSelectedCategory(opt.id)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					{/* STATUS DOS RESULTADOS */}
					<div className="articles-results-bar">
						<span>
							Exibindo <strong>{filteredArticles.length}</strong> de{" "}
							<strong>{articlesData.length}</strong> artigos de orientação
							{searchQuery && (
								<span>
									{" "}
									para o termo "<em>{searchQuery}</em>"
								</span>
							)}
						</span>

						{(searchQuery || selectedAge !== "all" || selectedCategory !== "all") && (
							<button
								type="button"
								className="button-link articles-reset-btn"
								onClick={handleClearFilters}
							>
								<FiRotateCcw style={{ marginRight: "4px" }} />
								<span>Limpar todos os filtros</span>
							</button>
						)}
					</div>
				</div>

				{/* GRID DE ARTIGOS */}
				{filteredArticles.length === 0 ? (
					<div className="articles-empty-state">
						<div className="articles-empty-icon">
							<FiSearch />
						</div>
						<h3>Nenhum artigo encontrado para estes filtros</h3>
						<p>
							Tente buscar por termos como <em>"roblox"</em>,{" "}
							<em>"celular"</em>, <em>"jogos"</em>, <em>"regras"</em> ou selecione a
							opção "Todas as idades".
						</p>
						<button
							type="button"
							className="button button--primary"
							onClick={handleClearFilters}
						>
							Ver todos os artigos
						</button>
					</div>
				) : (
					<div className="articles-grid">
						{filteredArticles.map((article) => (
							<article key={article.id} className="article-card">
								<div className="article-card__meta">
									<div className="article-card__badges">
										<span
											className={`article-card__badge article-card__badge--${article.type}`}
										>
											{article.category}
										</span>
										<span className="article-card__badge-age">
											<FiUsers className="icon-badge" />
											<span>{article.ageBadge}</span>
										</span>
									</div>
									<span className="article-card__time">
										<FiClock className="icon-badge" />
										<span>{article.readTime}</span>
									</span>
								</div>

								<h3 className="article-card__title">{article.title}</h3>

								<p className="article-card__summary">{article.summary}</p>

								<button
									type="button"
									className="article-card__link"
									onClick={() => setActiveArticle(article)}
								>
									Ler artigo completo →
								</button>
							</article>
						))}
					</div>
				)}

				{/* BANNER DE INCENTIVO AO DOWNLOAD DA EXTENSÃO */}
				{!isDashboard && (
					<div className="articles-extension-banner">
						<div className="articles-extension-banner__content">
							<div className="articles-extension-banner__icon">
								<FiShield />
							</div>
							<div>
								<h3>Pronto para apoiar seus filhos na prática?</h3>
								<p>
									Além de consultar nossos artigos educativos, você pode instalar a Extensão KidSafe
									no navegador da sua família para bloquear conteúdos impróprios e
									programar pausas de descanso com tranquilidade.
								</p>
							</div>
						</div>
						<div className="articles-extension-banner__action">
							<Link
								to="/ajuda/instalacao"
								className="button button--primary articles-extension-btn"
								title="Baixar e Instalar a Extensão KidSafe"
							>
								<FiDownload style={{ marginRight: "8px" }} />
								<span>Baixar Extensão KidSafe</span>
							</Link>
						</div>
					</div>
				)}
			</div>

			{activeArticle && (
				<ArticleModal
					article={activeArticle}
					onClose={() => setActiveArticle(null)}
				/>
			)}
		</section>
	);
}
