# Plataforma de Cursos Online

Projeto acadêmico da disciplina de Tecnologias de Construção de Software.

Documentação base do professor:
- `docs/LAB - Plataforma de Cursos.pdf`
- `docs/LAB03_Plataforma_de_Cursos.md`

## Tecnologias

- HTML5
- Bootstrap 5
- React 18 via CDN
- JavaScript puro
- `localStorage` para persistência simples no navegador

## Estrutura principal

```text
plataforma-cursos/
  index.html
  pages/
    categorias.html
    cursos.html
    usuarios.html
    modulos.html
    aulas.html
    matriculas.html
    progresso-aulas.html
    avaliacoes.html
    trilhas.html
    trilha-cursos.html
    certificados.html
    planos.html
    assinaturas.html
    pagamentos.html
  js/
    reactApp.js
    main.js
    models/
    storage/localStorage.js
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
- Relacionamentos por ID entre entidades (usuário, curso, módulo, aula, plano, assinatura).
- Cálculo de aulas e horas em cursos com base nas aulas cadastradas.

## Padrão de interface

- Navbar React com navegação por módulos.
- Dashboard com contadores principais.
- Formulários inline e listagens como área principal.
- Coluna `Ações` com botões diretos.

## Como executar

1. Abra o `index.html` no navegador.
2. Aguarde o carregamento dos scripts CDN do React, ReactDOM e Bootstrap.
3. Navegue entre as telas pelo menu.
4. Cadastre dados de exemplo.

> Observação: a versão React atual não exige `npm install` nem etapa de build.

## Persistência de dados

Os dados ficam salvos no `localStorage` do navegador.

Para limpar:

```js
localStorage.clear()
```

## Observações

- Não usa backend.
- Usa React por CDN para manter execução simples em ambiente acadêmico.
- Projeto focado em implementação simples e didática.


