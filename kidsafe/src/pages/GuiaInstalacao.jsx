export default function GuiaInstalacao() {
	return (
		<section className="page">
			<div className="container">
				<span className="section-eyebrow">Central de ajuda</span>
				<h1 className="section-title">Guia de instalação</h1>

				<ol className="page__steps">
					<li>
						<h3>1. Instale a extensão</h3>
						<p>
							Adicione a extensão KidSafe à loja do navegador do dispositivo
							que você quer monitorar.
						</p>
					</li>
					<li>
						<h3>2. Copie o código gerado pela extensão</h3>
						<p>
							Ao instalar, a extensão gera um código de acesso único para o
							dispositivo. Ele aparece no ícone da extensão.
						</p>
					</li>
					<li>
						<h3>3. Vincule pelo painel do responsável</h3>
						<p>
							Na aba Ferramentas do painel, clique em "Ligar extensão" e
							digite o código gerado.
						</p>
					</li>
					<li>
						<h3>4. Configure bloqueios e horários</h3>
						<p>
							Acesse o painel web para definir sites bloqueados, palavras-
							chave, horários de uso e alertas.
						</p>
					</li>
				</ol>
			</div>
		</section>
	);
}
