import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import TabNav from "../components/dashboard/TabNav.jsx";
import UsagePanel from "../components/dashboard/UsagePanel.jsx";
import AccessChart from "../components/dashboard/AccessChart.jsx";
import AccessDetails from "../components/dashboard/AccessDetails.jsx";
import SchedulePanel from "../components/dashboard/SchedulePanel.jsx";
import ToolsPanel from "../components/dashboard/ToolsPanel.jsx";
import ArticlesSection from "../components/ArticlesSection.jsx";
import PairDeviceModal from "../components/dashboard/PairDeviceModal.jsx";
import DevicesSidebar from "../components/dashboard/DevicesSidebar.jsx";
import { getAllDevices, getUsageSummary } from "../api/devices.js";
import { useAuth } from "../context/AuthContext.jsx";
import logoKidSafe from "../assets/logo-kidsafe.jpg";

export default function Dashboard() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("uso");
	const [devices, setDevices] = useState([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState(null);
	const [usage, setUsage] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showAccessDetails, setShowAccessDetails] = useState(false);
	const [showPairModal, setShowPairModal] = useState(false);

	function handleLogout() {
		logout();
		navigate("/");
	}

	const selectedDevice =
		devices.find((d) => d.id === selectedDeviceId) || devices[0] || null;

	useEffect(() => {
		loadInitialData();

		const deviceTimer = setInterval(async () => {
			try {
				const data = await getAllDevices();
				if (Array.isArray(data.devices)) {
					setDevices(data.devices);
				}
			} catch (error) {
				// mantém o último estado em caso de erro de rede
			}
		}, 5000);

		return () => {
			clearInterval(deviceTimer);
		};
	}, []);

	useEffect(() => {
		if (selectedDevice?.id) {
			loadUsage(selectedDevice.id);

			const usageTimer = setInterval(() => {
				loadUsage(selectedDevice.id);
			}, 15000);

			return () => clearInterval(usageTimer);
		} else {
			setUsage(null);
		}
	}, [selectedDevice?.id]);

	async function loadInitialData() {
		setLoading(true);
		try {
			const data = await getAllDevices();
			const deviceList = data.devices || [];
			setDevices(deviceList);

			if (deviceList.length > 0) {
				const firstId = deviceList[0].id;
				setSelectedDeviceId(firstId);
				await loadUsage(firstId);
			}
		} catch (error) {
			setDevices([]);
		} finally {
			setLoading(false);
		}
	}

	async function loadUsage(deviceId) {
		try {
			const usageData = await getUsageSummary(deviceId);
			setUsage(usageData);
		} catch (error) {
			// mantém último estado
		}
	}

	function handleSelectDevice(device) {
		setSelectedDeviceId(device.id);
		setShowAccessDetails(false);
	}

	function handleDeviceRenamed(updatedDevice) {
		setDevices((current) =>
			current.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
		);
	}

	function handleDeviceUpdated(updatedDevice) {
		setDevices((current) => {
			const exists = current.some((d) => d.id === updatedDevice.id);
			if (exists) {
				return current.map((d) =>
					d.id === updatedDevice.id ? updatedDevice : d
				);
			}
			return [...current, updatedDevice];
		});

		setSelectedDeviceId(updatedDevice.id);
		loadUsage(updatedDevice.id);
	}

	function handleDeviceUnlinked(unlinkedId) {
		setDevices((current) => {
			const remaining = current.filter((d) => d.id !== unlinkedId);
			if (selectedDeviceId === unlinkedId) {
				setSelectedDeviceId(remaining[0]?.id || null);
			}
			return remaining;
		});
	}

	if (loading) {
		return (
			<section className="dashboard">
				<div className="container dashboard__container">
					<p>Carregando painel...</p>
				</div>
			</section>
		);
	}

	return (
		<section className="dashboard">
			<div className="container dashboard__container">
				<div className="dashboard-topbar">
					<div className="dashboard-topbar__brand">
						<img
							src={logoKidSafe}
							alt="Logotipo KidSafe"
							className="dashboard-topbar__logo"
						/>
						<div>
							<h1 className="dashboard-topbar__title">KidSafe</h1>
							<span className="dashboard-topbar__badge">
								Gerenciamento da Extensão
							</span>
						</div>
					</div>

					<div className="dashboard-topbar__user">
						{user?.role === "ADMIN" && (
							<Link to="/admin" className="dashboard-topbar__admin-btn">
								Painel ADM
							</Link>
						)}
						<span className="dashboard-topbar__greeting">
							Olá, <strong>{user?.name || "Usuário"}</strong>
						</span>
						<button
							type="button"
							className="button button--secondary dashboard-topbar__logout-btn"
							onClick={handleLogout}
						>
							Sair
						</button>
					</div>
				</div>

				<TabNav activeTab={activeTab} onChange={setActiveTab} />

				{activeTab === "artigos" ? (
					<div className="dashboard-artigos-view">
						<ArticlesSection isDashboard={true} />
					</div>
				) : devices.length === 0 ? (
					<div className="dashboard-empty">
						<h2>Nenhum dispositivo vinculado</h2>
						<p>
							Instale a extensão KidSafe no navegador do dispositivo que
							você quer orientar e proteger, e ligue-a à sua conta usando o código
							gerado por ela.
						</p>
						<div className="dashboard-empty__buttons">
							<button
								type="button"
								className="button button--primary"
								onClick={() => setShowPairModal(true)}
							>
								Ligar primeiro dispositivo
							</button>
							<button
								type="button"
								className="button button--secondary"
								onClick={() => setActiveTab("artigos")}
							>
								<FiBookOpen style={{ marginRight: "6px" }} />
								Consultar Artigos
							</button>
						</div>
					</div>
				) : (
					<div className="dashboard-layout">
						<DevicesSidebar
							devices={devices}
							selectedDeviceId={selectedDevice?.id}
							onSelectDevice={handleSelectDevice}
							onDeviceRenamed={handleDeviceRenamed}
							onAddDeviceClick={() => setShowPairModal(true)}
							onDeviceUnlinked={handleDeviceUnlinked}
						/>

						<div className="dashboard-main-area">
							<div className="dashboard-active-banner">
								<div className="dashboard-active-banner__info">
									<span className="dashboard-active-banner__label">
										Dispositivo selecionado:
									</span>
									<h2 className="dashboard-active-banner__name">
										{selectedDevice.name}
									</h2>
								</div>
							</div>

							{activeTab === "uso" && (
								<div className="dashboard-panel">
									{showAccessDetails ? (
										<AccessDetails
											data={usage?.accessCounts}
											weekly={usage?.weekly}
											onBack={() => setShowAccessDetails(false)}
										/>
									) : (
										<>
											<h1 className="dashboard-panel__title">
												Tempo de uso hoje
											</h1>

											<div className="dashboard-panel__grid">
												<UsagePanel
													apps={usage?.today?.apps}
													totalSeconds={usage?.today?.totalSeconds}
												/>
												<AccessChart
													data={usage?.accessCounts}
													onOpenDetails={() => setShowAccessDetails(true)}
												/>
											</div>
										</>
									)}
								</div>
							)}

							{activeTab === "horarios" && (
								<div className="dashboard-panel">
									<SchedulePanel
										device={selectedDevice}
										onUpdated={handleDeviceUpdated}
									/>
								</div>
							)}

							{activeTab === "ferramentas" && (
								<div className="dashboard-panel">
									<h1 className="dashboard-panel__title">Ferramentas</h1>
									<ToolsPanel
										device={selectedDevice}
										onDeviceUpdated={handleDeviceUpdated}
									/>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{showPairModal && (
				<PairDeviceModal
					onClose={() => setShowPairModal(false)}
					onLinked={handleDeviceUpdated}
				/>
			)}
		</section>
	);
}
