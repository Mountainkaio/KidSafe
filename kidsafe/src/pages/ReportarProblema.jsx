export default function ReportarProblema() {
	return (
		<section className="page">
			<div className="container">
				<span className="section-eyebrow">Contato</span>
				<h1 className="section-title">Reportar um problema</h1>
				<p className="section-subtitle">
					Encontrou um site que deveria estar bloqueado, um erro na extensão
					ou outro problema técnico? Conte para a gente.
				</p>

				<form className="page__form">
					<label>
						Tipo de problema
						<select name="tipo">
							<option>Site não bloqueado corretamente</option>
							<option>Erro na extensão</option>
							<option>Erro no painel web</option>
							<option>Outro</option>
						</select>
					</label>
					<label>
						Link ou descrição
						<textarea name="descricao" rows={5}></textarea>
					</label>
					<button type="submit" className="button button--primary">
						Enviar relato
					</button>
				</form>
			</div>
		</section>
	);
}
