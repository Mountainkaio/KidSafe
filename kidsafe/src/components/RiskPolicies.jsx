import { Link } from "react-router-dom";
import IconConteudoInadequado from "../assets/icons/IconConteudoInadequado";
import IconContatoDesconhecidos from "../assets/icons/IconContatoDesconhecidos";
import IconEscudo from "../assets/icons/IconEscudo";
import IconSino from "../assets/icons/IconSino";

const risks = [
	{
		title: "Conteúdo Inadequado e Violência",
		description:
			"Como agir se seu filho acessar páginas impróprias acidentalmente, filtros recomendados e estratégias de conversa sem repreensão traumática.",
		href: "/riscos/conteudo-inadequado",
		articleAnchor: "#artigos",
		Icon: IconConteudoInadequado,
	},
	{
		title: "Contato com Desconhecidos e Aliciamento",
		description:
			"Aprenda a reconhecer pedidos de segredo, ofertas de presentes em jogos virtuais e como empoderar seu filho para pedir ajuda na hora.",
		href: "/riscos/contato-desconhecidos",
		articleAnchor: "#artigos",
		Icon: IconContatoDesconhecidos,
	},
	{
		title: "Jogos Online, Roblox e Discord",
		description:
			"Proteja contra compras impulsivas de moedas virtuais, downloads maliciosos e chats não moderados sem cortar a diversão da turma.",
		href: "/#artigos",
		articleAnchor: "#artigos",
		Icon: IconEscudo,
	},
	{
		title: "Cyberbullying e Exclusão Virtual",
		description:
			"Orientações práticas para acolher o sofrimento em grupos de WhatsApp, documentar provas de ofensas e dialogar com a escola.",
		href: "/#artigos",
		articleAnchor: "#artigos",
		Icon: IconSino,
	},
];

export default function RiskPolicies() {
	return (
		<section id="riscos" className="risk-policies">
			<div className="container">
				<span className="section-eyebrow">Prevenção Consciente</span>
				<h2 className="section-title">
					Perigos Digitais e Como Tutelar Seus Filhos
				</h2>
				<p className="section-subtitle">
					Nossas proteções e artigos foram pensados a partir dos maiores
					desafios que pais e mães enfrentam na educação de crianças e adolescentes.
				</p>

				<ul className="risk-policies__grid">
					{risks.map((risk) => (
						<li key={risk.title} className="risk-policies__item">
							<risk.Icon className="risk-policies__icon" />
							<h3>{risk.title}</h3>
							<p>{risk.description}</p>
							<div className="risk-policies__links">
								<Link to={risk.href} className="risk-link">
									Saiba mais sobre a diretriz →
								</Link>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
