# /add-scenario

<!-- Skill sob demanda — só roda quando chamada explicitamente. -->

Adiciona um novo cenário de exemplo ao simulador.

Passos:

1. Perguntar: qual pedido de exemplo (texto que o usuário digitaria) e
   qual caminho ele deveria simular (quais nós acendem, em que ordem)
2. Adicionar o cenário em `server/src/data/scenarios.js`, seguindo o
   formato dos existentes (`keywords`, `steps` com `node`/`title`/`explanation`)
3. Delegar pro subagent `content-accuracy-reviewer` a checagem de que o
   caminho faz sentido pedagogicamente
4. Adicionar o texto do pedido na lista de sugestões do
   `ScenarioPicker.jsx` no client

Não pular o passo 3 — é fácil criar um cenário com a ordem errada sem
perceber.
