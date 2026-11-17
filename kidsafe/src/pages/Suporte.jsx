import { Link } from "react-router-dom";

export default function Suporte() {
	return (
		<section className="page">
			<div className="container">
				<span className="section-eyebrow">Contato</span>
				<h1 className="section-title">Falar com o suporte</h1>
				<p className="section-subtitle">
					Nossa equipe responde dúvidas sobre instalação, configuração e uso
					do KidSafe.
				</p>

				<form className="page__form">
					<label>
						Nome
						<input type="text" name="nome" />
					</label>
					<label>
						E-mail
						<input type="email" name="email" />
					</label>
					<label>
						Mensagem
						<textarea name="mensagem" rows={5}></textarea>
					</label>
					<button type="submit" className="button button--primary">
						Enviar mensagem
					</button>
				</form>

				<p className="page__aside-link">
					Encontrou um problema técnico?{" "}
					<Link to="/suporte/reportar">Reporte aqui</Link>.
				</p>
			</div>
		</section>
	);
}
