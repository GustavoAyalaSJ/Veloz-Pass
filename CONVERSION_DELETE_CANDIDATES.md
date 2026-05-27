# Arquivos candidatos para deletar (após validar a migração)

## Importante (antes de deletar)
- A conversão do React depende do backend servir os arquivos corretos.
- Seu `server.js` no `SGDB/veloz-pass-react` ainda aponta para **vários** `index2.html..index6.html` que **não existem** em `SGDB/veloz-pass-react/public/` (ele só tem `index.html` e `Assets/`).
- Por isso, **não deletar nada do backend/HTML** ainda sem confirmar se vai manter o fluxo antigo ou se vai trocar o `server.js` para servir o React.

---

## 1) Candidatos “legado” do front antigo (fora do React)
Esses arquivos parecem pertencer ao HTML/JS antigo (multis-script `public/src/script*.js`, múltiplos `index2..index6.html`) e normalmente não são mais usados quando o React passa a ser a UI.

> Só delete se você NÃO estiver usando mais esses HTMLs/JS legados.

- `SGDB/public/index.html`
- `SGDB/public/index2.html`
- `SGDB/public/index3.html`
- `SGDB/public/index4.html`
- `SGDB/public/index5.html`
- `SGDB/public/index6.html`
- `SGDB/public/src/script1.js`
- `SGDB/public/src/script2.js`
- `SGDB/public/src/script3.js`
- `SGDB/public/src/script4.js`
- `SGDB/public/src/script5.js`
- `SGDB/public/src/script6.js`

---

## 2) Candidatos “legado” dentro do React public (somente se você padronizar React build)
Hoje o `server.js` serve `SGDB/veloz-pass-react/public` como static. Mas o React (via CRA) normalmente gera um build em `build/`.

> Como seu `SGDB/veloz-pass-react/public/` contém só `index.html` e `Assets/`, eu só recomendo deletar coisas antigas se você tiver certeza do novo entrypoint.

- `SGDB/veloz-pass-react/public/index.html`  
  - **Atenção:** só delete se você criar um novo entrypoint padrão do React (CRA build) e ajustar o `server.js`.

---

## 3) Candidatos para não deletar (por agora)
- `SGDB/veloz-pass-react/server.js` (precisa estar alinhado com o novo fluxo)
- `SGDB/veloz-pass-react/src/**` (você vai usar como base do React)
- `SGDB/veloz-pass-react/public/Assets/**` (imagens usadas no frontend)

---

## Checklist mínimo antes de deletar qualquer coisa
- [ ] Confirmar se as rotas do backend (`/dashboard`, `/recarga`, etc.) apontam para o React correto.
- [ ] Confirmar se o entrypoint do React está sendo servido (normalmente um único `index.html` com `root` + bundle do React).
- [ ] Rodar local e validar:
  - [ ] `/introduction`
  - [ ] `/dashboard`
  - [ ] `/recarga`
  - [ ] `/historico`
  - [ ] `/carteira_digital`

---

## Status observado (importante)
- Em `SGDB/veloz-pass-react/public/` só existe `index.html` e `Assets/`.
- Porém o `server.js` tenta servir `index2.html..index6.html`.
- Isso sugere que o projeto React ainda está “meio” no mundo antigo.

