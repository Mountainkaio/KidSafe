export const parentScenarios = [
	{
		id: "roblox-chat-amigos",
		title: "Meu filho de 8 anos quer jogar Roblox com chat livre 'porque todo mundo joga'",
		iconType: "gamepad",
		ageGroup: "6-10 anos",
		category: "Jogos & Redes",
		situation:
			"Seu filho de 8 anos chega empolgado pedindo para liberar o chat do Roblox para conversar com os colegas da escola. No entanto, dentro do jogo qualquer usuário pode enviar mensagens diretas e criar salas privadas.",
		recommendedApproach: {
			kidsafeAction:
				"Instale a extensão KidSafe para bloquear links externos suspeitos e programe pausas automáticas a cada 1h de jogo.",
			relatedArticleId: "guia-jogos-roblox-minecraft-discord",
		},
		quizQuestion: "Se você estivesse nessa situação agora, qual seria seu primeiro passo?",
		interactiveOptions: [
			{
				id: "opt-1",
				label: "Proibir o jogo de vez e desinstalar sem explicar os motivos.",
				isBest: false,
				feedback:
					"Cuidado: a proibição abrupta sem diálogo costuma gerar ressentimento e incentiva a criança a jogar escondida.",
			},
			{
				id: "opt-2",
				label: "Sentar juntos, restringir o chat para amigos verificados e combinar horários com apoio do KidSafe.",
				isBest: true,
				feedback:
					"Excelente! Você valida a convivência social da criança enquanto estabelece limites de segurança e confiança mútua.",
			},
			{
				id: "opt-3",
				label: "Liberar o jogo livremente porque se os colegas jogam, não deve ter perigo.",
				isBest: false,
				feedback:
					"Atenção: servidores abertos contêm conteúdos não moderados e golpistas buscando coletar dados de menores.",
			},
		],
	},
	{
		id: "pressao-primeiro-smartphone",
		title: "\"Todo mundo na minha sala tem celular, menos eu!\"",
		iconType: "smartphone",
		ageGroup: "11-13 anos",
		category: "Autonomia & Rotina",
		situation:
			"Seu filho pré-adolescente reclama com insistência e diz que está sendo excluído socialmente porque não possui um celular próprio com redes e aplicativos de mensagens.",
		recommendedApproach: {
			kidsafeAction:
				"Consulte o nosso artigo sobre o primeiro aparelho e utilize o KidSafe para definir os horários de recolhimento noturno.",
			relatedArticleId: "artigo-primeiro-aparelho",
		},
		quizQuestion: "Qual atitude melhor prepara seu filho para essa transição?",
		interactiveOptions: [
			{
				id: "opt-1",
				label: "Comprar um smartphone topo de linha e deixar que ele aprenda sozinho.",
				isBest: false,
				feedback:
					"Erro comum: a ausência de combinados iniciais costuma gerar queda no rendimento escolar e exposição precoce.",
			},
			{
				id: "opt-2",
				label: "Definir combinados de horários e habilitar ferramentas de proteção prévias antes da entrega.",
				isBest: true,
				feedback:
					"Muito bem! O jovem compreende que a liberdade caminha junto com a responsabilidade e o respeito às regras combinadas.",
			},
			{
				id: "opt-3",
				label: "Dizer que celular só depois dos 18 anos sem abrir espaço para diálogo.",
				isBest: false,
				feedback:
					"Atenção: a recusa inflexível sem orientação não desenvolve maturidade digital e afasta a confiança da criança.",
			},
		],
	},
	{
		id: "esconde-tela-rapido",
		title: "Percebi que meu filho minimizou ou escondeu a tela rápido quando me aproximei",
		iconType: "eye",
		ageGroup: "11-13 anos",
		category: "Privacidade & Acolhimento",
		situation:
			"Ao entrar no ambiente, você nota que seu filho minimizou a janela do navegador em pânico, ficando tenso ou desconcertado.",
		recommendedApproach: {
			kidsafeAction:
				"Verifique com discrição o histórico no painel do KidSafe para checar bloqueios preventivos de páginas impróprias.",
			relatedArticleId: "dialogo-familiar-sem-atrito",
		},
		quizQuestion: "Qual a melhor postura nesse momento crítico de confiança?",
		interactiveOptions: [
			{
				id: "opt-1",
				label: "Acolher com serenidade, demonstrar que ele está seguro para confessar e investigar com calma.",
				isBest: true,
				feedback:
					"Postura correta: a criança percebe que pode contar com você diante de situações estranhas em vez de temer a punição.",
			},
			{
				id: "opt-2",
				label: "Tomar o teclado, chamar de mentiroso e colocá-lo de castigo sem computador por 1 mês.",
				isBest: false,
				feedback:
					"Cuidado: reações agressivas quebram o canal de confiança. Diante de ameaças virtuais reais, ele terá medo de pedir ajuda.",
			},
			{
				id: "opt-3",
				label: "Fingir que não viu nada para não parecer intrometido.",
				isBest: false,
				feedback:
					"Atenção: a omissão pode deixar a criança desamparada diante de tentativas de golpe ou conteúdos perturbadores.",
			},
		],
	},
	{
		id: "birra-ao-desligar-videogame",
		title: "Choro, gritos e agressividade na hora de guardar as telas",
		iconType: "clock",
		ageGroup: "3-5 anos e 6-10 anos",
		category: "Tempo & Rotina",
		situation:
			"Toda vez que você avisa que o tempo de tela acabou, a criança tem uma crise de birra, chora intensamente ou bate a porta.",
		recommendedApproach: {
			kidsafeAction:
				"Ative o bloqueio programado na extensão KidSafe para que a tela encerre no horário combinado automaticamente.",
			relatedArticleId: "tempo-de-tela-saude-sbp",
		},
		quizQuestion: "Como diminuir as batalhas diárias na hora de desligar os aparelhos?",
		interactiveOptions: [
			{
				id: "opt-1",
				label: "Avisos prévios graduais, acolhimento da frustração e limite firme com pausas automáticas do KidSafe.",
				isBest: true,
				feedback:
					"Excelente! A previsibilidade acalma o sistema nervoso infantil e as pausas automáticas neutralizam o conflito.",
			},
			{
				id: "opt-2",
				label: "Deixar jogar até cansar para ver se dorme sozinho.",
				isBest: false,
				feedback:
					"Cuidado: a hiperestimulação noturna inibe a melatonina, gerando irritabilidade e sono fragmentado.",
			},
			{
				id: "opt-3",
				label: "Gritar mais alto que a criança para mostrar autoridade imediata.",
				isBest: false,
				feedback:
					"Atenção: respostas reativas aumentam o estresse do ambiente familiar sem ensinar autocontrole.",
			},
		],
	},
];
