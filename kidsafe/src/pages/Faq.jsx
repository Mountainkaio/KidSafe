const faqs = [
	{
		question: "O KidSafe funciona em qualquer navegador?",
		answer:
			"A extensão é compatível com navegadores baseados em Chromium, como Google Chrome, Microsoft Edge e Brave.",
	},
	{
		question: "A criança sabe que está sendo monitorada?",
		answer:
			"Sim. O KidSafe exibe um aviso no dispositivo informando que a navegação está sendo acompanhada por um responsável.",
	},
	{
		question: "Como funciona o código de vinculação?",
		answer:
			"A extensão gera um código único ao ser instalada. O responsável usa esse código no painel web para vincular o dispositivo à sua conta.",
	},
	{
		question: "Meus dados de navegação ficam salvos para sempre?",
		answer:
			"Não. Os dados são armazenados apenas pelo tempo necessário para gerar relatórios e alertas, conforme nossa política de privacidade.",
	},
];

export default function Faq() {
	return (
		<section className="page">
			<div className="container">
				<span className="section-eyebrow">Central de ajuda</span>
				<h1 className="section-title">Perguntas frequentes</h1>

				<ul className="page__faq-list">
					{faqs.map((faq) => (
						<li key={faq.question}>
							<h3>{faq.question}</h3>
							<p>{faq.answer}</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
