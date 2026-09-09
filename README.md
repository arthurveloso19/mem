# 🎮 Meme Arena 3D

Jogo de cartas 3D estilo Yu-Gi-Oh, jogado no navegador, onde as cartas são memes
e figuras da internet. Feito com **Three.js** puro (sem build, sem instalação).

As artes das cartas são **placeholders** por enquanto (emoji + cores por
raridade) — a ideia é trocar depois pelas imagens reais dos memes/pessoas.

## Como jogar localmente

Basta abrir o arquivo `index.html` num navegador. Não precisa de servidor,
nem de instalar nada.

## Como publicar no GitHub Pages (o "gatinho" 😸)

1. Crie um repositório novo no GitHub (ex: `meme-arena-3d`).
2. Suba estes dois arquivos (`index.html` e `game.js`) pra raiz do repositório.
   Pode ser pelo site mesmo, em **Add file → Upload files**.
3. Vá em **Settings → Pages**.
4. Em "Branch", selecione `main` (ou `master`) e a pasta `/ (root)`, depois
   clique em **Save**.
5. Espere 1–2 minutos. O GitHub vai te dar um link tipo:
   `https://SEUUSUARIO.github.io/meme-arena-3d/`
6. Pronto — o jogo fica online e joga pelo celular ou computador de qualquer lugar.

## Regras do jogo

- Cada jogador começa com 8000 Life Points (LP) e uma mão de 5 cartas.
- Por turno: compra 1 carta, pode jogar 1 carta da mão no campo (3 slots),
  e pode atacar com monstros que já estavam no campo em turnos anteriores.
- Batalha: quem tem ATK maior destrói o adversário e causa dano da diferença
  de ATK nos LP do dono da carta destruída.
- Só pode atacar os LP do oponente diretamente se o campo dele estiver vazio.
- Zere os LP do oponente pra vencer.

## Próximos passos sugeridos

- Trocar os placeholders pelas artes reais dos memes/pessoas.
- Adicionar efeitos sonoros e animações de ataque.
- Adicionar mais cartas ao "pool" em `CARD_POOL` (dentro de `game.js`).
- Adicionar cartas de efeito/magia além de monstros.
