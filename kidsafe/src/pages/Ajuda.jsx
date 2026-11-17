import { Link } from "react-router-dom";

export default function Ajuda() {
	return (
		<section className="page">
			<div className="container">
				<span className="section-eyebrow">Central de ajuda</span>
				<h1 className="section-title">Como podemos ajudar?</h1>
				<p className="section-subtitle">
					Encontre respostas sobre instalação, configuração e uso do KidSafe.
				</p>

				<ul className="page__link-list">
					<li>
						<Link to="/ajuda/instalacao">Guia de instalação</Link>
						<p>Passo a passo para instalar a extensão e conectar um dispositivo.</p>
					</li>
					<li>
						<Link to="/ajuda/perguntas-frequentes">Perguntas frequentes</Link>
						<p>Dúvidas comuns sobre bloqueios, horários e privacidade.</p>
					</li>
					<li>
						<Link to="/suporte">Falar com o suporte</Link>
						<p>Não encontrou o que precisava? Entre em contato com a equipe.</p>
					</li>
				</ul>
			</div>
		</section>
	);
}
