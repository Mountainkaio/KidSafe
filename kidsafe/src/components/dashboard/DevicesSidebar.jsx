import { useState } from "react";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { renameDevice, unlinkDevice } from "../../api/devices.js";

export default function DevicesSidebar({
	devices = [],
	selectedDeviceId,
	onSelectDevice,
	onDeviceRenamed,
	onAddDeviceClick,
	onDeviceUnlinked,
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [editingDeviceId, setEditingDeviceId] = useState(null);
	const [editName, setEditName] = useState("");
	const [savingName, setSavingName] = useState(false);

	const filteredDevices = devices.filter((device) => {
		const name = (device.name || "").toLowerCase();
		const code = (device.pairingCode || "").toLowerCase();
		const term = searchQuery.trim().toLowerCase();
		return name.includes(term) || code.includes(term);
	});

	function handleStartEdit(device, event) {
		event.stopPropagation();
		setEditingDeviceId(device.id);
		setEditName(device.name || "Dispositivo");
	}

	function handleCancelEdit(event) {
		if (event) event.stopPropagation();
		setEditingDeviceId(null);
		setEditName("");
	}

	async function handleSaveEdit(device, event) {
		if (event) event.stopPropagation();
		const trimmed = editName.trim();
		if (!trimmed || trimmed === device.name) {
			setEditingDeviceId(null);
			return;
		}

		setSavingName(true);
		try {
			const data = await renameDevice(device.id, trimmed);
			onDeviceRenamed(data.device);
			setEditingDeviceId(null);
		} catch (error) {
			alert(error.message || "Erro ao renomear dispositivo.");
		} finally {
			setSavingName(false);
		}
	}

	async function handleUnlink(device, event) {
		event.stopPropagation();
		const confirmMsg = `Deseja desvincular o dispositivo "${device.name}" da sua conta?`;
		if (!window.confirm(confirmMsg)) return;

		try {
			await unlinkDevice(device.id);
			onDeviceUnlinked(device.id);
		} catch (error) {
			alert(error.message || "Erro ao desvincular dispositivo.");
		}
	}

	return (
		<aside className="devices-sidebar">
			<div className="devices-sidebar__header">
				<div className="devices-sidebar__title-row">
					<h3 className="devices-sidebar__title">
						Dispositivos
						<span className="devices-sidebar__count">{devices.length}</span>
					</h3>

					<button
						type="button"
						className="button button--primary button--small devices-sidebar__add-btn"
						title="Vincular novo dispositivo"
						onClick={onAddDeviceClick}
					>
						+ Adicionar
					</button>
				</div>

				<div className="devices-sidebar__search">
					<FiSearch className="devices-sidebar__search-icon" />
					<input
						type="text"
						placeholder="Buscar por nome..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						aria-label="Buscar dispositivos por nome"
					/>
					{searchQuery && (
						<button
							type="button"
							className="devices-sidebar__search-clear"
							onClick={() => setSearchQuery("")}
							title="Limpar busca"
						>
							×
						</button>
					)}
				</div>
			</div>

			<div className="devices-sidebar__list">
				{devices.length === 0 && (
					<div className="devices-sidebar__empty">
						<p>Nenhum dispositivo vinculado.</p>
						<button
							type="button"
							className="button button--secondary button--small"
							onClick={onAddDeviceClick}
						>
							Vincular primeiro dispositivo
						</button>
					</div>
				)}

				{devices.length > 0 && filteredDevices.length === 0 && (
					<div className="devices-sidebar__empty">
						<p>Nenhum dispositivo com o nome "{searchQuery}".</p>
						<button
							type="button"
							className="devices-sidebar__reset-search"
							onClick={() => setSearchQuery("")}
						>
							Limpar filtro
						</button>
					</div>
				)}

				{filteredDevices.map((device) => {
					const isSelected = device.id === selectedDeviceId;
					const isEditing = editingDeviceId === device.id;
					const online = Boolean(device.online);

					return (
						<div
							key={device.id}
							className={`device-card ${isSelected ? "device-card--selected" : ""}`}
							onClick={() => onSelectDevice(device)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									onSelectDevice(device);
								}
							}}
						>
							<div className="device-card__top">
								<div className="device-card__status">
									<span
										className={`tools-panel__status-dot ${
											online
												? "tools-panel__status-dot--online"
												: "tools-panel__status-dot--offline"
										}`}
									/>
									<span className="device-card__status-text">
										{online ? "ONLINE" : "OFFLINE"}
									</span>
								</div>

								<div className="device-card__code" title="Código de pareamento">
									#{device.pairingCode}
								</div>
							</div>

							{isEditing ? (
								<div
									className="device-card__edit-form"
									onClick={(e) => e.stopPropagation()}
								>
									<input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										autoFocus
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveEdit(device, e);
											if (e.key === "Escape") handleCancelEdit(e);
										}}
									/>
									<div className="device-card__edit-actions">
										<button
											type="button"
											className="button button--primary button--small"
											disabled={savingName || !editName.trim()}
											onClick={(e) => handleSaveEdit(device, e)}
										>
											{savingName ? "..." : "Salvar"}
										</button>
										<button
											type="button"
											className="button button--small"
											onClick={(e) => handleCancelEdit(e)}
										>
											Cancelar
										</button>
									</div>
								</div>
							) : (
								<div className="device-card__main">
									<h4 className="device-card__name">{device.name}</h4>

									<div className="device-card__actions">
										<button
											type="button"
											className="device-card__action-btn"
											title="Editar nome deste dispositivo"
											onClick={(e) => handleStartEdit(device, e)}
										>
											<FiEdit2 style={{ marginRight: "4px" }} /> Renomear
										</button>

										<button
											type="button"
											className="device-card__action-btn device-card__action-btn--danger"
											title="Desvincular este dispositivo"
											onClick={(e) => handleUnlink(device, e)}
										>
											<FiTrash2 style={{ marginRight: "4px" }} /> Desvincular
										</button>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</aside>
	);
}
