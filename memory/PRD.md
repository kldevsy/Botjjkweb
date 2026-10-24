# PRD — Grimório do Feiticeiro (Guia Dashboard do Bot)

## Problema original
"Criar um site guia com informações aba cards e tudo interativo sobre as técnicas(tudo) Bosses espadas equipamentos tipo um Guia dashboard enviei o ZIP com as informações"

## Escolhas do usuário
- Tema escuro anime/jogo, cards animados e profissionais
- Busca + filtros + modal de detalhes + comparação entre itens
- Somente leitura (dados do ZIP)
- Idiomas PT / EN / ES

## Arquitetura
- Backend FastAPI: JSON do ZIP copiado para /app/backend/data; normalizado em memória por guide_data.py (raridades, tipos, stats, seções genéricas). Sem banco.
- Endpoints: /api/categories, /api/items/{cat}?q&raridade&tipo&sort&order, /api/items/{cat}/{id}, /api/search?q, /api/dashboard
- Frontend React: Layout (sidebar + header), Dashboard, CategoryPage, DetailModal (abas), CompareTray/Dialog, GlobalSearch (Ctrl+K), i18n context

## Implementado (jun/2026)
- 9 categorias: Técnicas 78, Bosses 31, Espadas 53, Equipamentos 84, Amuletos 22, Grimórios 10, NPCs 11, Raids 13, Habilidades 3
- Dashboard com contadores, gráfico de raridade, tipos de técnica, top bosses/espadas/técnicas
- Cards animados com cor por raridade e fallback estilizado (ícone + kanji) quando imagem falha
- Modal com Visão geral / Habilidades / Mecânicas / Drops & extras; link compartilhável ?item=
- Comparação de até 3 itens da mesma categoria com barras e troféu
- Tradução da interface PT/EN/ES (dados permanecem em PT)
- Testado: backend 100%, frontend 95% → bugs corrigidos (overflow mobile, toast duplicado)

## Backlog
- P1: Tradução automática dos textos dos itens (EN/ES)
- P1: Montador de build (técnica + espada + equipamentos + amuletos com soma de stats)
- P2: Favoritos salvos no navegador; página de calculadora de dano; upload de novo ZIP para atualizar dados
