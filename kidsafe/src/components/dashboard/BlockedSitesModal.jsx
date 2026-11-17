import { useState } from "react";
import Modal from "../Modal.jsx";
import ClassIndBadge from "../ClassIndBadge.jsx";
import { CLASSIND_RATINGS } from "../../data/classIndData.js";
import {
	addBlockedSite,
	removeBlockedSite,
	moveBlockedSiteCategory,
	addCategory,
	removeCategory,
	updateAgeRatings,
} from "../../api/devices.js";

export default function BlockedSitesModal({
	sites = [],
	categories = ["Geral"],
	deviceId,
	device,
	onClose,
	onChanged,
}) {
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
			onChanged({ blockedRatings: updated });
		} catch (e) {
			alert("Erro ao atualizar classificação indicativa.");
		}
	}
	const [activeCategories, setActiveCategories] = useState(() => {
		const base = Array.isArray(categories) && categories.length > 0 ? [...categories] : ["Geral"];
		// Garante que todas as categorias dos sites existentes estejam na lista
		sites.forEach((s) => {
			const cat = s.category || "Geral";
			if (!base.includes(cat)) base.push(cat);
		});
		if (!base.includes("Geral")) base.unshift("Geral");
		return base;
	});

	// Estado para rastrear quais seções estão expandidas (por padrão, todas abertas)
	const [collapsedSections, setCollapsedSections] = useState({});

	// Estados de criação de categoria
	const [showNewCatInput, setShowNewCatInput] = useState(false);
	const [newCatName, setNewCatName] = useState("");
	const [catError, setCatError] = useState("");

	// Estados de adição de site
	const [siteUrl, setSiteUrl] = useState("");
	const [selectedCatForAdd, setSelectedCatForAdd] = useState("Geral");
	const [siteError, setSiteError] = useState("");
	const [loadingAction, setLoadingAction] = useState(false);

	function toggleSection(catName) {
		setCollapsedSections((prev) => ({
			...prev,
			[catName]: !prev[catName],
		}));
	}

	async function handleCreateCategory(event) {
		event.preventDefault();
		const name = newCatName.trim();
		if (!name) return;
		if (activeCategories.map((c) => c.toLowerCase()).includes(name.toLowerCase())) {
			setCatError("Esta categoria já existe.");
			return;
		}

		setCatError("");
		try {
			setLoadingAction(true);
			const data = await addCategory(name, deviceId);
			const updatedCats = data.customCategories || [...activeCategories, name];
			setActiveCategories(updatedCats);
			setSelectedCatForAdd(name);
			setNewCatName("");
			setShowNewCatInput(false);
			onChanged({ customCategories: updatedCats });
		} catch (error) {
			setCatError(error.message || "Erro ao criar categoria.");
		} finally {
			setLoadingAction(false);
		}
	}

	async function handleRemoveCategory(catName) {
		if (catName === "Geral") return;
		const confirmMsg = `Excluir a categoria "${catName}"? Os sites pertencentes a ela serão movidos para "Geral".`;
		if (!window.confirm(confirmMsg)) return;

		try {
			setLoadingAction(true);
			const data = await removeCategory(catName, deviceId);
			const updatedCats = data.customCategories || activeCategories.filter((c) => c !== catName);
			setActiveCategories(updatedCats);
			if (data.blockedSites) {
				onChanged({ customCategories: updatedCats, blockedSites: data.blockedSites });
			} else {
				onChanged({ customCategories: updatedCats });
			}
		} catch (error) {
			alert(error.message || "Erro ao excluir categoria.");
		} finally {
			setLoadingAction(false);
		}
	}

	async function handleAddSite(event, targetCategory = selectedCatForAdd) {
		if (event) event.preventDefault();
		if (!siteUrl.trim()) return;

		setSiteError("");
		try {
			setLoadingAction(true);
			const data = await addBlockedSite(siteUrl.trim(), targetCategory, deviceId);
			onChanged({ blockedSites: data.blockedSites });
			setSiteUrl("");
		} catch (error) {
			setSiteError(error.message || "Erro ao adicionar site.");
		} finally {
			setLoadingAction(false);
		}
	}

	async function handleRemoveSite(id) {
		try {
			setLoadingAction(true);
			const data = await removeBlockedSite(id, deviceId);
			onChanged({ blockedSites: data.blockedSites });
		} catch (error) {
			alert(error.message || "Erro ao remover site.");
		} finally {
			setLoadingAction(false);
		}
	}

	async function handleMoveSite(id, newCategory) {
		try {
			setLoadingAction(true);
			const data = await moveBlockedSiteCategory(id, newCategory, deviceId);
			onChanged({ blockedSites: data.blockedSites });
		} catch (error) {
			alert(error.message || "Erro ao mover site de categoria.");
		} finally {
			setLoadingAction(false);
		}
	}

	// Agrupa sites por categoria
	const sitesByCategory = {};
	activeCategories.forEach((cat) => {
		sitesByCategory[cat] = [];
	});

	sites.forEach((site) => {
		const cat = site.category || "Geral";
		if (!sitesByCategory[cat]) {
			sitesByCategory[cat] = [];
		}
		sitesByCategory[cat].push(site);
	});

	return (
		<Modal title="Gerenciar Restrições e Categorias" onClose={onClose}>
			{/* SEÇÃO DE CLASSIFICAÇÃO INDICATIVA BRASILEIRA */}
			<div className="blocked-classind-box">
				<div className="blocked-classind-box__header">
					<div>
						<strong>Classificação Indicativa Brasileira (ClassInd)</strong>
						<p>
							Clique para selecionar quais faixas etárias devem ser bloqueadas
							automaticamente pelas tags HTML dos sites:
						</p>
					</div>
					<span className="blocked-classind-box__count">
						{blockedRatings.length} de {CLASSIND_RATINGS.length} bloqueada(s)
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
				<p className="blocked-classind-hint">
					A extensão procura por tags oficiais como <code>&lt;meta name="rating"&gt;</code>,{" "}
					<code>&lt;meta itemprop="contentRating"&gt;</code>, Schema.org e OpenGraph no HTML das páginas e bloqueia os conteúdos correspondentes.
				</p>
			</div>

			<div className="categories-modal-intro">
				<p>
					Ou gerencie domínios e categorias manuais: adicione novas
					categorias e mova endereços entre elas.
				</p>

				<div className="categories-toolbar">
					{!showNewCatInput ? (
						<button
							type="button"
							className="button button--secondary button--small"
							onClick={() => setShowNewCatInput(true)}
						>
							+ Criar categoria
						</button>
					) : (
						<form onSubmit={handleCreateCategory} className="category-create-form">
							<input
								type="text"
								placeholder="Nome da seção (ex: Jogos, Redes...)"
								value={newCatName}
								onChange={(e) => setNewCatName(e.target.value)}
								autoFocus
								required
							/>
							<button
								type="submit"
								className="button button--primary button--small"
								disabled={loadingAction}
							>
								Criar
							</button>
							<button
								type="button"
								className="button button--small"
								onClick={() => {
									setShowNewCatInput(false);
									setCatError("");
								}}
							>
								Cancelar
							</button>
						</form>
					)}
				</div>

				{catError && <p className="form-error" role="alert">{catError}</p>}
			</div>

			{/* Lista de seções / categorias em accordion */}
			<div className="category-sections">
				{activeCategories.map((category) => {
					const isCollapsed = Boolean(collapsedSections[category]);
					const categorySites = sitesByCategory[category] || [];

					return (
						<div key={category} className="category-section">
							<div
								className="category-section__header"
								onClick={() => toggleSection(category)}
							>
								<div className="category-section__title">
									<span className="category-section__chevron">
										{isCollapsed ? "▶" : "▼"}
									</span>
									<strong>{category}</strong>
									<span className="category-section__count">
										({categorySites.length})
									</span>
								</div>

								{category !== "Geral" && (
									<button
										type="button"
										className="category-section__delete-btn"
										title="Excluir categoria"
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveCategory(category);
										}}
									>
										Excluir seção
									</button>
								)}
							</div>

							{!isCollapsed && (
								<div className="category-section__body">
									{categorySites.length === 0 ? (
										<p className="category-section__empty">
											Nenhum site adicionado nesta seção ainda.
										</p>
									) : (
										<ul className="category-sites-list">
											{categorySites.map((site) => (
												<li key={site.id} className="category-site-item">
													<div className="category-site-info">
														<span className="category-site-url">
															{site.url}
														</span>
													</div>

													<div className="category-site-actions">
														<label className="category-site-move-label">
															<span>Mover para:</span>
															<select
																value={category}
																onChange={(e) =>
																	handleMoveSite(site.id, e.target.value)
																}
																className="category-move-select"
															>
																{activeCategories.map((c) => (
																	<option key={c} value={c}>
																		{c}
																	</option>
																))}
															</select>
														</label>

														<button
															type="button"
															className="tool-list__remove"
															onClick={() => handleRemoveSite(site.id)}
														>
															Remover
														</button>
													</div>
												</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Formulário para adicionar novo site/URL */}
			<form onSubmit={(e) => handleAddSite(e)} className="tool-form tool-form--inline category-add-site-form">
				<label>
					Adicionar site / URL bloqueada:
					<input
						type="text"
						placeholder="ex: youtube.com, roblox.com..."
						value={siteUrl}
						onChange={(e) => setSiteUrl(e.target.value)}
						required
					/>
				</label>

				<label className="category-select-label">
					Na seção:
					<select
						value={selectedCatForAdd}
						onChange={(e) => setSelectedCatForAdd(e.target.value)}
					>
						{activeCategories.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</label>

				<button
					type="submit"
					className="button button--primary button--small"
					disabled={loadingAction || !siteUrl.trim()}
				>
					Adicionar
				</button>
			</form>

			{siteError && <p className="form-error" role="alert">{siteError}</p>}
		</Modal>
	);
}
