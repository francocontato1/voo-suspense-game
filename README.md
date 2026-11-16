# VOO 0471 — Altitude de Cruzeiro

Um jogo de suspense e investigação em primeira pessoa, hiper-realista, que roda direto no navegador.
A história se passa dentro de um **Airbus A321neoLR** em cruzeiro noturno sobre o Atlântico (Recife → Lisboa, FL370).
Um passageiro aparece morto no lavatório traseiro e ninguém sabe quem foi. O assassino ainda está a bordo, e pretende agir de novo.

**Jogar:** versão web em `index.html` + pasta `assets3d/` (GitHub Pages), ou o arquivo único `dist/voo0471_offline.html` (~21 MB, tudo embutido, funciona offline).

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
- **Prólogo / Ato I, Comandante Ricardo Valença:** cockpit, chamada do interfone, regra dos dois pilotos e caminhada pela cabine às escuras. Uma passageira agarra o braço do comandante no meio do corredor. Na cena do crime, ele examina o corpo, a placa da porta (inspeção 3D), a carteira e o PIN do celular da vítima, e interroga os passageiros.
- **Ato II, Marta Quintela, chefe de cabine:** um trolley se solta na turbulência e espalha € 380 mil. Marta arranca a confissão do comissário, amplia a foto do jornalista, escuta escondida o telefonema do empresário atrás da cortina e encontra o padre parado na porta do lavatório, atrás dela. Depois ele vai se sentar ao lado da testemunha, e a bengala cai no corredor.
- **Clímax:** refém na galley traseira, cena com câmeras cinematográficas, escolhas sob pressão, QTE com o extintor de Halon e a contenção do assassino.
- Final bom, seis finais ruins (acusar a pessoa errada tem consequência) e checkpoint no Ato II.

## Realismo
- Seção de cabine real da família A320: largura 3,70 m, pitch 31"/79 cm, 3-3, corredor ~50 cm, bagageiros, PSUs, janelas a cada 53 cm, portas L1/R1/L4/R4, saídas sobre as asas.
- Cockpit com PFD, ND, ECAM e MCDU animados no padrão Airbus, overhead, pedestal, sidesticks.
- **Pessoas reais**: 23 avatares Microsoft Rocketbox (MIT) com blendshapes faciais (expressões, piscar, fala) e animações de captura de movimento.
- Céu real (cubemap da Via Láctea), textura lunar, mar de nuvens ao luar e flash da luz estroboscópica de ponta de asa.
- Pipeline cinematográfico: HDR + MSAA, bloom em cascata, ACES, grão de filme, aberração cromática, vinheta, sujeira de lente, letterbox nas cenas.
- **Trilha com instrumentos reais** (FluidR3 GM, CC BY 3.0): contrabaixo, cello, cordas em tremolo, violino, coro, piano, tímpanos, taiko, prato reverso, orchestra hit e celesta, conduzidos por um diretor musical em cinco estados e com stingers orquestrais nos sustos.
- Ambiência sintetizada em tempo real (Web Audio, HRTF 3D): ruído de fuselagem, fans LEAP-1A, ar-condicionado, vento no para-brisa, chimes Airbus e passos.

## Desenvolvimento
```bash
npm install          # meshoptimizer (só para reprocessar a cabeça)
node tools/build.mjs # gera index.html (web), dist/web/ e dist/voo0471_offline.html
```
O código-fonte está em `src/js/*.js` (concatenado na ordem do nome do arquivo), `src/style.css` e `src/template.html`. Os assets ficam em `assets/`.

## Créditos e licenças
- three.js r160, MIT.
- Microsoft Rocketbox Avatar Library (MIT): avatares e animações.
- FluidR3 GM, de Frank Wen (CC BY 3.0), via gleitz/midi-js-soundfonts: amostras da trilha.
- Cubemap MilkyWay, textura lunar e lens dirt: exemplos do three.js.
- Atlântica Linhas Aéreas, o voo AT0471, a Operação Maré Alta e todos os personagens são fictícios.
