import familiaFeliz from "../assets/familia-feliz.webp";

export default function Origin() {
	return (
		<section id="sobre" className="origin">
			<div className="container origin__inner">
				<div className="origin__text">
					<span className="section-eyebrow">Por que o KidSafe existe</span>
					<h2 className="section-title">
						Pensado para a rotina real das famílias
					</h2>

					<p>
						Crianças e adolescentes usam a internet todos os dias para
						estudar, se comunicar e se divertir. Junto com os benefícios,
						vêm riscos como contato com desconhecidos, conteúdo impróprio e
						cyberbullying — muitas vezes difíceis de acompanhar sem as
						ferramentas certas.
					</p>

					<p>
						O KidSafe nasceu para dar aos responsáveis uma forma simples de
						acompanhar a navegação, sem precisar vigiar cada clique, e para
						dar às crianças um espaço digital mais seguro para aprender e
						explorar.
					</p>
				</div>

				<img
					src={familiaFeliz}
					alt="Família feliz usando o KidSafe com tranquilidade"
					className="origin__media"
				/>
			</div>
		</section>
	);
}
