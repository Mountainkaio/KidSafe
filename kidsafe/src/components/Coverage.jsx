import IconExtensao from "../assets/icons/IconExtensao";
import IconEscudo from "../assets/icons/IconEscudo";
import IconSino from "../assets/icons/IconSino";
import IconRelatorio from "../assets/icons/IconRelatorio";

const coverage = [
	{
		title: "Artigos & Tutoramento",
		description:
			"Orientações didáticas, análises por idade e planos práticos para você agir como o melhor mentor digital do seu filho.",
		Icon: IconRelatorio,
	},
	{
		title: "Extensão de navegador",
		description:
			"Instalada no computador do seu filho, bloqueia conteúdos inadequados e atua como uma proteção discreta e preventiva em tempo real.",
		Icon: IconExtensao,
	},
	{
		title: "Painel do responsável",
		description:
			"Acesse pelo computador ou celular para gerenciar limites saudáveis de estudo/lazer e consultar toda a biblioteca educativa.",
		Icon: IconEscudo,
	},
	{
		title: "Diálogo & Alertas preventivos",
		description:
			"Receba avisos acolhedores quando situações arriscadas forem detectadas, transformando riscos em oportunidades de diálogo.",
		Icon: IconSino,
	},
];

export default function Coverage() {
	return (
		<section id="protecao" className="coverage">
			<div className="container">
				<span className="section-eyebrow">Apoio Integral para a Família</span>
				<h2 className="section-title">Como o KidSafe Apoia Pais e Filhos</h2>
				<p className="section-subtitle">
					Unimos educação parental, diálogo familiar e ferramentas de proteção técnica
					para construir uma relação equilibrada com a tecnologia.
				</p>

				<ul className="coverage__grid">
					{coverage.map((item) => (
						<li key={item.title} className="coverage__item">
							<item.Icon className="coverage__icon" />
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
