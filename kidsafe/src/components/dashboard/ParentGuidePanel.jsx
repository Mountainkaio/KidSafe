import { FiInfo } from "react-icons/fi";
import ArticlesSection from "../ArticlesSection.jsx";

export default function ParentGuidePanel() {
	return (
		<div className="parent-guide-panel">
			<div className="parent-guide-panel__header">
				<div>
					<h1 className="dashboard-panel__title">
						Central Educativa para Pais e Responsáveis
					</h1>
					<p className="parent-guide-panel__desc">
						Consulte artigos práticos, orientações por idade e planos de ação
						para apoiar o desenvolvimento digital dos seus filhos de forma equilibrada.
					</p>
				</div>

				<div className="parent-guide-panel__tip-card">
					<FiInfo className="tip-card-icon" />
					<div>
						<strong>Orientação KidSafe:</strong>
						<p>
							Combinados prévios e acompanhamento sereno reduzem significativamente
							os atritos causados pelo tempo de tela.
						</p>
					</div>
				</div>
			</div>

			<ArticlesSection isDashboard={true} />
		</div>
	);
}
