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
- JSON Server para API REST local

## Estrutura principal

```text
plataforma-cursos/
  index.html
  package.json
  src/
    App.tsx
    api.ts
    main.tsx
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

Rode a API local em um terminal:

```bash
npm run server
```

Ela ficará disponível em:

```text
http://localhost:3001
```

Em outro terminal, rode o servidor de desenvolvimento:

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

Os dados ficam salvos no arquivo `db.json` e são acessados pela aplicação por meio do JSON Server.

O frontend usa `http://localhost:3001` como URL padrão da API. Para mudar esse endereço, defina a variável de ambiente `VITE_API_URL`.

Para restaurar a base inicial, substitua o conteúdo de `db.json` pela versão original do repositório.

As principais coleções expostas pela API são: `usuarios`, `categorias`, `cursos`, `modulos`, `aulas`, `matriculas`, `progressoAulas`, `avaliacoes`, `trilhas`, `trilhasCursos`, `certificados`, `planos`, `assinaturas` e `pagamentos`.

## Observações

- Usa JSON Server como backend local.
- Usa React com TypeScript e Vite.
- Projeto focado em implementação simples e didática.
