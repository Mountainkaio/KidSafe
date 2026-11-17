const tabs = [
	{ id: "uso", label: "Uso" },
	{ id: "horarios", label: "Horários" },
	{ id: "ferramentas", label: "Ferramentas" },
	{ id: "artigos", label: "Artigos" },
];

export default function TabNav({ activeTab, onChange }) {
	return (
		<nav className="dashboard-tabs">
			<ul>
				{tabs.map((tab) => (
					<li key={tab.id}>
						<button
							type="button"
							className={
								tab.id === activeTab
									? "dashboard-tabs__item dashboard-tabs__item--active"
									: "dashboard-tabs__item"
							}
							onClick={() => onChange(tab.id)}
						>
							{tab.label}
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
