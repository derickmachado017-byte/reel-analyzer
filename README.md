# ReelAnalyzer

Ferramenta experimental para extrair quadros de vídeos que o usuário tem autorização para acessar.

## Recursos
- Interface responsiva em português.
- Carregamento de arquivos de vídeo locais.
- Tentativa de carregar links diretos HTTP/HTTPS para arquivos de vídeo.
- Extração local de quadros e exportação de painel JPG.
- Não envia vídeos a um servidor e não solicita senhas, cookies ou tokens.

## Executar
Abra `index.html` em um navegador moderno. Não precisa de instalação, chave de API ou servidor.

## Links diretos
O endereço precisa apontar para o arquivo de vídeo (por exemplo, MP4 ou WebM), e não para uma página que contém o player. Para extrair quadros de um vídeo hospedado em outro domínio, o servidor de origem precisa permitir CORS. Se não permitir, o navegador pode bloquear o carregamento ou impedir a extração de imagens.

## Instagram
Esta versão não baixa nem extrai Reels do Instagram. A incorporação oficial pode exibir uma publicação, mas não fornece acesso ao arquivo de vídeo para análise. O projeto não contorna autenticação, privacidade, limites ou bloqueios.

## Analisar com o ChatGPT
Baixe o painel JPG e anexe-o à conversa. Você também pode anexar o próprio vídeo diretamente ao ChatGPT quando o recurso estiver disponível. A página, por si só, não conecta o navegador ao ChatGPT nem envia automaticamente os quadros para a conversa.

## Publicar
A pasta raiz contém o `index.html`; não há comando de build. Pode ser publicada como página estática.
