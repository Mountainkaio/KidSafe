# Extensão KidSafe

Extensão para navegadores baseados em Chromium (Chrome, Edge, Brave) que
aplica no dispositivo monitorado o que o responsável configura no painel
web: bloqueio de sites e palavras-chave, horário de uso, bloqueio de tela
e mensagens de aviso. Também envia dados de uso (tempo e visitas por
site) para o painel.

## Como instalar (modo desenvolvedor)

1. Abra `chrome://extensions` (ou `edge://extensions`).
2. Ative o **"Modo do desenvolvedor"** (canto superior direito).
3. Clique em **"Carregar sem compactação"** e selecione esta pasta
   (`extension/`).
4. A extensão vai se registrar automaticamente no servidor e gerar um
   código de acesso.
5. Clique no ícone da extensão na barra do navegador para ver o código.
6. No painel do responsável, vá em **Ferramentas → Ligar extensão** e
   digite esse código.

## Configuração

Por padrão, a extensão conversa com a API em `http://localhost:3333`.
Se o servidor estiver rodando em outro endereço, troque o valor de
`API_URL` no topo de `background.js`.

## Limitações desta versão

- O bloqueio de sites usa `declarativeNetRequest`, bloqueando o
  domínio inteiro (não páginas específicas).
- O bloqueio por palavra-chave verifica o texto visível da página já
  carregada — não impede o carregamento em si.
- O tempo de uso é medido pela aba ativa e pela janela em foco; o
  navegador em segundo plano não conta como uso.
