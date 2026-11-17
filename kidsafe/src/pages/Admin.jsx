import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import Modal from "../components/Modal.jsx";
import {
	getAdminStats,
	getAdminUsers,
	updateAdminUser,
	toggleUserStatus,
	deleteAdminUser,
} from "../api/admin.js";
import { useAuth } from "../context/AuthContext.jsx";
import logoKidSafe from "../assets/logo-kidsafe.jpg";

export default function Admin() {
	const { user: currentUser, logout } = useAuth();
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		navigate("/");
	}
	const [users, setUsers] = useState([]);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");
	const [statusFilter, setStatusFilter] = useState("ALL");

	// Estados do Modal de Edição
	const [editingUser, setEditingUser] = useState(null);
	const [editName, setEditName] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editRole, setEditRole] = useState("RESPONSAVEL");
	const [modalError, setModalError] = useState("");
	const [savingUser, setSavingUser] = useState(false);

	// Mensagem de feedback temporária
	const [feedbackMsg, setFeedbackMsg] = useState("");

	useEffect(() => {
		loadData();
	}, []);

	async function loadData() {
		setLoading(true);
		try {
			const [statsData, usersData] = await Promise.all([
				getAdminStats(),
				getAdminUsers(),
			]);
			setStats(statsData.stats);
			setUsers(usersData.users || []);
		} catch (error) {
			setFeedbackMsg("Erro ao carregar dados de administração.");
		} finally {
			setLoading(false);
		}
	}

	function showFeedback(msg) {
		setFeedbackMsg(msg);
		setTimeout(() => setFeedbackMsg(""), 4000);
	}

	function handleOpenEdit(user) {
		setEditingUser(user);
		setEditName(user.name);
		setEditEmail(user.email);
		setEditRole(user.role);
		setModalError("");
	}

	async function handleSaveEdit(event) {
		event.preventDefault();
		if (!editName.trim() || !editEmail.trim()) return;

		setSavingUser(true);
		setModalError("");
		try {
			const data = await updateAdminUser(editingUser.id, {
				name: editName.trim(),
				email: editEmail.trim(),
				role: editRole,
			});

			setUsers((current) =>
				current.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u))
			);
			setEditingUser(null);
			showFeedback(`Usuário "${editName}" atualizado com sucesso.`);
			// Atualiza stats
			getAdminStats().then((res) => setStats(res.stats)).catch(() => {});
		} catch (error) {
			setModalError(error.message || "Erro ao atualizar usuário.");
		} finally {
			setSavingUser(false);
		}
	}

	async function handleToggleStatus(user) {
		const isSuspending = user.status !== "SUSPENDED";
		const confirmMsg = isSuspending
			? `Deseja suspender a conta de "${user.name}"? O usuário não conseguirá acessar o painel.`
			: `Deseja reativar a conta de "${user.name}"?`;

		if (!window.confirm(confirmMsg)) return;

		try {
			const data = await toggleUserStatus(user.id);
			setUsers((current) =>
				current.map((u) => (u.id === user.id ? { ...u, status: data.user.status } : u))
			);
			showFeedback(`Status de "${user.name}" alterado para ${data.user.status === "SUSPENDED" ? "SUSPENSO" : "ATIVO"}.`);
			getAdminStats().then((res) => setStats(res.stats)).catch(() => {});
		} catch (error) {
			alert(error.message || "Erro ao alterar status do usuário.");
		}
	}

	async function handleDeleteUser(user) {
		if (user.id === currentUser?.id) {
			alert("Você não pode excluir sua própria conta de administrador.");
			return;
		}

		const confirmMsg = `ATENÇÃO: Deseja realmente excluir permanentemente a conta de "${user.name}" (${user.email})? Todos os dispositivos vinculados serão desassociados.`;
		if (!window.confirm(confirmMsg)) return;

		try {
			await deleteAdminUser(user.id);
			setUsers((current) => current.filter((u) => u.id !== user.id));
			showFeedback(`Usuário "${user.name}" excluído com sucesso.`);
			getAdminStats().then((res) => setStats(res.stats)).catch(() => {});
		} catch (error) {
			alert(error.message || "Erro ao excluir usuário.");
		}
	}

	const filteredUsers = users.filter((u) => {
		const term = searchQuery.trim().toLowerCase();
		const matchesSearch =
			!term ||
			u.name.toLowerCase().includes(term) ||
			u.email.toLowerCase().includes(term);

		const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
		const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

		return matchesSearch && matchesRole && matchesStatus;
	});

	function formatDate(isoStr) {
		if (!isoStr) return "-";
		const d = new Date(isoStr);
		return d.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	}

	if (loading) {
		return (
			<section className="page admin-page">
				<div className="container">
					<p>Carregando painel de administração...</p>
				</div>
			</section>
		);
	}

	return (
		<section className="page admin-page">
			<div className="container">
				<div className="admin-page__header">
					<div>
						<span className="section-eyebrow">Administração do Sistema</span>
						<h1 className="section-title">Gerenciamento de Usuários</h1>
						<p className="section-subtitle">
							Visualize, edite, suspenda ou exclua contas de responsáveis e
							administradores, além de consultar os dispositivos supervisionados.
						</p>
					</div>

					<div className="admin-page__nav-actions">
						<Link to="/dashboard" className="button button--primary">
							← Painel da Extensão
						</Link>
						<span className="admin-page__user-greeting">
							Olá, <strong>{currentUser?.name}</strong>
						</span>
						<button
							type="button"
							className="button button--secondary"
							onClick={handleLogout}
						>
							Sair
						</button>
					</div>
				</div>

				{feedbackMsg && (
					<div className="admin-alert admin-alert--info">
						{feedbackMsg}
					</div>
				)}

				{/* Cards de Métricas */}
				{stats && (
					<div className="admin-metrics-grid">
						<div className="admin-metric-card">
							<span className="admin-metric-card__label">Total de Usuários</span>
							<span className="admin-metric-card__value">{stats.totalUsers}</span>
						</div>
						<div className="admin-metric-card">
							<span className="admin-metric-card__label">Responsáveis</span>
							<span className="admin-metric-card__value admin-metric-card__value--blue">
								{stats.totalResponsibles}
							</span>
						</div>
						<div className="admin-metric-card">
							<span className="admin-metric-card__label">Administradores</span>
							<span className="admin-metric-card__value admin-metric-card__value--purple">
								{stats.totalAdmins}
							</span>
						</div>
						<div className="admin-metric-card">
							<span className="admin-metric-card__label">Dispositivos Vinculados</span>
							<span className="admin-metric-card__value admin-metric-card__value--green">
								{stats.totalDevices}
							</span>
						</div>
						<div className="admin-metric-card">
							<span className="admin-metric-card__label">Contas Suspensas</span>
							<span className="admin-metric-card__value admin-metric-card__value--red">
								{stats.totalSuspended}
							</span>
						</div>
					</div>
				)}

				{/* Barra de Filtros e Busca */}
				<div className="admin-toolbar">
					<div className="admin-search-input">
						<FiSearch className="admin-search-icon" />
						<input
							type="text"
							placeholder="Buscar por nome ou e-mail..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button type="button" onClick={() => setSearchQuery("")}>
								×
							</button>
						)}
					</div>

					<div className="admin-filters">
						<label>
							Função:
							<select
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
							>
								<option value="ALL">Todas as funções</option>
								<option value="RESPONSAVEL">Responsável</option>
								<option value="ADMIN">Administrador</option>
							</select>
						</label>

						<label>
							Status:
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<option value="ALL">Todos os status</option>
								<option value="ACTIVE">Ativos</option>
								<option value="SUSPENDED">Suspensos</option>
							</select>
						</label>
					</div>
				</div>

				{/* Tabela de Usuários */}
				<div className="admin-table-wrapper">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Usuário</th>
								<th>Função</th>
								<th>Status</th>
								<th>Dispositivos</th>
								<th>Cadastro</th>
								<th className="admin-table__th-actions">Ações</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.length === 0 && (
								<tr>
									<td colSpan={6} className="admin-table__empty">
										Nenhum usuário encontrado com os filtros selecionados.
									</td>
								</tr>
							)}

							{filteredUsers.map((u) => {
								const isSelf = u.id === currentUser?.id;
								const isSuspended = u.status === "SUSPENDED";

								return (
									<tr
										key={u.id}
										className={isSuspended ? "admin-table__row--suspended" : ""}
									>
										<td>
											<div className="admin-user-cell">
												<strong>{u.name}</strong>
												<span>{u.email}</span>
												{isSelf && (
													<span className="admin-badge admin-badge--self">
														Você
													</span>
												)}
											</div>
										</td>
										<td>
											<span
												className={`admin-badge ${
													u.role === "ADMIN"
														? "admin-badge--admin"
														: "admin-badge--user"
												}`}
											>
												{u.role === "ADMIN" ? "Administrador" : "Responsável"}
											</span>
										</td>
										<td>
											<span
												className={`admin-badge ${
													isSuspended
														? "admin-badge--suspended"
														: "admin-badge--active"
												}`}
											>
												{isSuspended ? "Suspenso" : "Ativo"}
											</span>
										</td>
										<td>
											{u.devices.length === 0 ? (
												<span className="admin-devices-empty">Nenhum</span>
											) : (
												<div className="admin-devices-list">
													<span className="admin-devices-count">
														{u.devices.length} disp.
													</span>
													<div className="admin-devices-tags">
														{u.devices.map((d) => (
															<span
																key={d.id}
																className="admin-device-tag"
																title={`Código: #${d.pairingCode}`}
															>
																{d.name}
															</span>
														))}
													</div>
												</div>
											)}
										</td>
										<td>{formatDate(u.createdAt)}</td>
										<td>
											<div className="admin-actions">
												<button
													type="button"
													className="admin-btn-action admin-btn-action--edit"
													title="Editar usuário"
													onClick={() => handleOpenEdit(u)}
												>
													Editar
												</button>

												{!isSelf && (
													<button
														type="button"
														className={`admin-btn-action ${
															isSuspended
																? "admin-btn-action--activate"
																: "admin-btn-action--suspend"
														}`}
														title={
															isSuspended
																? "Reativar conta"
																: "Suspender conta"
														}
														onClick={() => handleToggleStatus(u)}
													>
														{isSuspended ? "Ativar" : "Suspender"}
													</button>
												)}

												{!isSelf && (
													<button
														type="button"
														className="admin-btn-action admin-btn-action--delete"
														title="Excluir usuário permanentemente"
														onClick={() => handleDeleteUser(u)}
													>
														Excluir
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal de Edição de Usuário */}
			{editingUser && (
				<Modal
					title={`Editar Usuário: ${editingUser.name}`}
					onClose={() => setEditingUser(null)}
				>
					<form onSubmit={handleSaveEdit} className="tool-form">
						<label>
							Nome Completo:
							<input
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								required
							/>
						</label>

						<label>
							E-mail de Acesso:
							<input
								type="email"
								value={editEmail}
								onChange={(e) => setEditEmail(e.target.value)}
								required
							/>
						</label>

						<label>
							Papel no Sistema:
							<select
								value={editRole}
								onChange={(e) => setEditRole(e.target.value)}
								disabled={editingUser.id === currentUser?.id}
							>
								<option value="RESPONSAVEL">Responsável (Pais/Família)</option>
								<option value="ADMIN">Administrador (Gestão do Sistema)</option>
							</select>
						</label>

						{editingUser.id === currentUser?.id && (
							<p className="admin-helper-text">
								* Você não pode alterar sua própria função de administrador.
							</p>
						)}

						{modalError && (
							<p className="form-error" role="alert">
								{modalError}
							</p>
						)}

						<div className="lock-modal__actions" style={{ marginTop: "16px" }}>
							<button
								type="submit"
								className="button button--primary"
								disabled={savingUser}
							>
								{savingUser ? "Salvando..." : "Salvar alterações"}
							</button>
							<button
								type="button"
								className="button button--secondary"
								onClick={() => setEditingUser(null)}
							>
								Cancelar
							</button>
						</div>
					</form>
				</Modal>
			)}
		</section>
	);
}
