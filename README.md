# RotMG Account Manager

Tracker de conta para **Realm of the Mad God**: personagens, pots (8/8), exaltações, vault, pets, cemitério e coleção de itens UT/ST.

Site estático, sem build e sem dependências. Os dados ficam salvos no `localStorage` do navegador.

## Rodando localmente

Por usar ES modules, o app precisa ser servido por HTTP (abrir o `index.html` direto com `file://` não funciona):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Qualquer servidor estático serve (`npx serve`, extensão Live Server do VS Code etc.).

## Publicando no GitHub Pages

1. Suba o repositório para o GitHub.
2. Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.
3. O site fica em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

## Estrutura

```
index.html              página raiz (carrega CSS e js/main.js)
css/
  base.css              tokens de cor, layout, header, botões
  components.css        cards de item, modais, vault, inventário
  home.css              tela de contas, dashboard, progressão da conta
  characters.css        personagens, pots, exaltações, cemitério
  pets.css              pets, pet yard, fusão
js/
  main.js               ponto de entrada
  state.js              estado, load/save no localStorage, migrações
  utils.js              helpers genéricos (esc, uid, datas)
  data/
    items.js            catálogo de itens e classes
    game.js             constantes do jogo (pots, exalts, níveis de conta, pets)
    sprites.js          mapa nome → arquivo de sprite
  logic/                regras sem DOM (stats, vault, exalts, pets, capacidade)
  ui/
    core.js             roteador de telas, header, modais genéricos
    icons.js            ícones pixel-art e helpers de sprite
  views/                uma tela por arquivo (saves, home, characters, vault…)
assets/sprites/         PNGs de classes, itens, lápides e UI
```

### Onde mexer

- **Item novo ou drop errado**: `js/data/items.js`. Para o sprite, adicione o PNG em `assets/sprites/items/<categoria>/` e a entrada em `js/data/sprites.js` (sem sprite, aparece um ícone genérico).
- **Tela nova**: crie `js/views/minhaTela.js`, exporte a função `renderX` e adicione o caso em `render()` no `js/ui/core.js`.
- **Regra de jogo** (capacidade do vault, fusão de pets etc.): `js/logic/`.

## Dados salvos

Tudo fica em `localStorage` na chave `rotmg-account-v3`. Os dados pertencem ao navegador e ao endereço do site, então trocar de domínio (ex.: de `localhost` para o GitHub Pages) começa com as contas vazias.
