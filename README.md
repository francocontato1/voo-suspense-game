# VOO 0471 — Altitude de Cruzeiro

Um jogo de suspense e investigação em primeira pessoa, hiper-realista, que roda direto no navegador.
A história se passa dentro de um **Airbus A321neoLR** em cruzeiro noturno sobre o Atlântico (Recife → Lisboa, FL370).
Um passageiro aparece morto no lavatório traseiro e ninguém sabe quem foi. O assassino ainda está a bordo, e pretende agir de novo.

**Jogar:** abra o `index.html` (arquivo único e autocontido, ~2,3 MB, funciona offline) ou acesse a versão publicada no GitHub Pages.

## Como jogar
| Ação | Teclado/mouse | Celular |
|---|---|---|
| Andar | WASD / setas | joystick esquerdo |
| Olhar | mouse (clique para capturar) | arrastar à direita |
| Interagir / avançar diálogo | E, Enter ou clique | botão E |
| Escolhas | 1–4, ou mover o mouse + clique | toque |
| Lanterna | F | botão Luz |
| Correr (só em perseguição) | Shift | botão Correr |
| Caderno de pistas | Tab / N | botão Caderno |
| Pausa | Esc | — |

## Estrutura
- **Prólogo / Ato I — Comandante Ricardo Valença:** cockpit, chamada do interfone, regra dos dois, caminhada pela cabine às escuras, cena do crime.
- **Ato II — Marta Quintela, chefe de cabine:** interrogatórios, documentos (manifesto, escala, relatório sigiloso), provas físicas, acusação pelo interfone e clímax.
- Final bom, finais ruins e checkpoint no Ato II.

## Realismo
- Seção de cabine real da família A320: largura 3,70 m, pitch 31"/79 cm, 3-3, corredor ~50 cm, bagageiros, PSUs, janelas a cada 53 cm, portas L1/R1/L4/R4, saídas sobre as asas.
- Cockpit com PFD, ND, ECAM e MCDU animados no padrão Airbus, overhead, pedestal, sidesticks.
- Cabeça humana **escaneada em 3D** (Lee Perry-Smith / Infinite Realities, CC BY 3.0), com LOD para 150+ passageiros gerado com meshoptimizer.
- Céu real (cubemap da Via Láctea), textura lunar, mar de nuvens ao luar e flash da luz estroboscópica de ponta de asa.
- Pipeline cinematográfico: HDR + MSAA, bloom em cascata, ACES, grão de filme, aberração cromática, vinheta, sujeira de lente, letterbox nas cenas.
- Áudio 100% sintetizado em tempo real (Web Audio): ruído de fuselagem, fans LEAP-1A, ar-condicionado, vento no para-brisa, chimes Airbus, passos, HRTF 3D, trilha de tensão com reverb de convolução.

## Desenvolvimento
```bash
npm install          # meshoptimizer (só para reprocessar a cabeça)
node tools/build.mjs # gera index.html e dist/index.html
```
O código-fonte está em `src/js/*.js` (concatenado na ordem do nome do arquivo), `src/style.css` e `src/template.html`. Os assets ficam em `assets/`.

## Créditos e licenças
- three.js r160, MIT.
- "Infinite, 3D Head Scan" por Lee Perry-Smith (Infinite Realities), CC BY 3.0, via repositório do three.js.
- Cubemap MilkyWay, textura lunar e lens dirt: exemplos do three.js.
- Atlântica Linhas Aéreas, o voo AT0471, a Operação Maré Alta e todos os personagens são fictícios.
