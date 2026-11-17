import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const columns = [
	{
		title: "Educação & Apoio",
		links: [
			{ label: "Artigos e Guias", href: "/#artigos" },
			{ label: "Quiz de Cenários", href: "/#quiz-cenarios" },
			{ label: "Proteção & Apoio", href: "/#protecao" },
		],
	},
	{
		title: "Recursos",
		links: [
			{ label: "Central de ajuda", href: "/ajuda" },
			{ label: "Guia de instalação", href: "/ajuda/instalacao" },
			{ label: "Perguntas frequentes", href: "/ajuda/perguntas-frequentes" },
		],
	},
	{
		title: "Contato",
		links: [
			{ label: "Falar com o suporte", href: "/suporte" },
			{ label: "Reportar um problema", href: "/suporte/reportar" },
		],
	},
];

export default function Footer() {
	const { user } = useAuth();
	const visibleColumns = user
		? [
				{
					title: "Recursos",
					links: [
						{ label: "Painel de gerenciamento", href: "/dashboard" },
						{ label: "Artigos e Guias", href: "/#artigos" },
						{ label: "Central de ajuda", href: "/ajuda" },
						{ label: "Guia de instalação da extensão", href: "/ajuda/instalacao" },
						{ label: "Perguntas frequentes", href: "/ajuda/perguntas-frequentes" },
					],
				},
				columns.find((col) => col.title === "Contato") || {
					title: "Contato",
					links: [
						{ label: "Falar com o suporte", href: "/suporte" },
						{ label: "Reportar um problema", href: "/suporte/reportar" },
					],
				},
		  ]
		: columns;

	return (
		<footer className="footer">
			<div className="container">
				{user && (
					<div className="footer__management-bar">
						<div className="footer__management-info">
							<span>
								Conectado como <strong>{user?.name || "Usuário"}</strong>
							</span>
						</div>
						<Link
							to="/dashboard"
							className="button button--primary footer__dashboard-btn"
						>
							← Voltar ao Painel de Gerenciamento
						</Link>
					</div>
				)}
				<div className="footer__columns">
					{visibleColumns.map((column) => (
						<div key={column.title} className="footer__column">
							<h4>{column.title}</h4>
							<ul>
								{column.links.map((link) => (
									<li key={link.label}>
										<Link to={link.href}>{link.label}</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="footer__bottom">
					<span>&copy; {new Date().getFullYear()} KidSafe</span>
					<Link
						to="/ajuda/instalacao"
						className="footer__extension-btn"
						title="Instalar Extensão KidSafe"
					>
						Instalar extensão
					</Link>
					<nav className="footer__legal">
						<Link to="/privacidade">Privacidade</Link>
						<Link to="/termos">Termos</Link>
					</nav>
				</div>
			</div>
		</footer>
	);
}
