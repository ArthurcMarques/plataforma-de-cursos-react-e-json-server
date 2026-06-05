# Plataforma de Cursos Online

Projeto acadêmico da disciplina de Tecnologias de Construção de Software.

Documentação base do professor:
- `docs/LAB - Plataforma de Cursos.pdf`
- `docs/LAB03_Plataforma_de_Cursos.md`

## Tecnologias

- HTML5
- Bootstrap 5
- React 18
- TypeScript
- Vite
- `localStorage` para persistência simples no navegador

## Estrutura principal

```text
plataforma-cursos/
  index.html
  package.json
  src/
    App.tsx
    main.tsx
    storage.ts
    types.ts
    utils.ts
    components/
      CrudPage.tsx
      Layout.tsx
```

## Funcionalidades implementadas

### Módulo Acadêmico e de Conteúdo
- Categorias: cadastro, listagem e exclusão.
- Cursos: cadastro, listagem e exclusão.
- Módulos por curso: cadastro, listagem e exclusão.
- Aulas por módulo: cadastro, listagem e exclusão.
- Trilhas: cadastro e listagem.
- Trilha x Cursos: vínculo e listagem.

### Módulo de Usuário e Progresso
- Usuários: cadastro, listagem e exclusão.
- Matrículas: cadastro e listagem.
- Progresso de aulas: registro e listagem.
- Avaliações: registro e listagem.
- Certificados: geração com código de verificação, validação simples por progresso e listagem.

### Módulo Financeiro
- Planos: cadastro e listagem.
- Assinaturas: cadastro e listagem.
- Pagamentos: cadastro e listagem.

## Regras e validações já aplicadas

- IDs gerados automaticamente.
- Validação de campos obrigatórios em formulários.
- Validação simples de e-mail.
- Bloqueios simples de duplicidade em entidades chave.
- Relacionamentos por ID entre entidades.
- Cálculo de aulas e horas em cursos com base nas aulas cadastradas.

## Como executar

> Esta versão usa Vite. Não abra o `index.html` diretamente pelo Explorador; rode o servidor local.

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra a URL mostrada no terminal, normalmente:

```text
http://localhost:5173
```

Para validar o build de produção:

```bash
npm run build
```

## Persistência de dados

Os dados ficam salvos no `localStorage` do navegador.

Para limpar:

```js
localStorage.clear()
```

## Observações

- Não usa backend.
- Usa React com TypeScript e Vite.
- Projeto focado em implementação simples e didática.
