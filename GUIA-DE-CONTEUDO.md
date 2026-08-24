# Guia de Criação de Conteúdo — Manual de Jiu-Jitsu Palms Sports

Este guia existe para que qualquer texto escrito pela equipe chegue já no formato final do site, pronto para ser inserido no projeto sem retrabalho.

---

## 1. Como usar este guia

1. Escreva o seu conteúdo normalmente (Word, Google Docs, bloco de notas, e-mail — tanto faz).
2. Abra uma IA (ChatGPT, Claude, Gemini) e **anexe este arquivo** (`GUIA-DE-CONTEUDO.md`) na conversa.
3. Cole o **prompt** da seção 12 e substitua o `[COLE SEU TEXTO AQUI]` pelo seu texto.
4. A IA devolve os arquivos prontos. Copie a resposta e envie para o responsável pelo projeto.

> Não altere as regras do guia ao colar. Ele é a especificação técnica do site — se as regras não forem seguidas, o site quebra ou a página não é publicada.

> Trabalhando dentro do Claude Code neste projeto? Não precisa deste fluxo: peça direto ao agente `fumadocs-writer`, que escreve os arquivos no lugar certo.

---

## 2. O que deve ser entregue

Em **uma única resposta**, a IA deve entregar quatro coisas:

| # | Item | Descrição |
| - | ---- | --------- |
| 1 | Arquivo `.mdx` em **inglês** | Com o caminho completo onde ele deve ser salvo |
| 2 | Arquivo `.mdx` em **português** | Mesmo conteúdo, mesma estrutura, traduzido |
| 3 | Trecho do `meta.json` | Para que a página apareça no menu lateral |
| 4 | Lista de imagens | Nome dos arquivos de imagem citados (se houver) |

O site é **bilíngue**. Uma página só é considerada completa quando existe nas duas línguas.

---

## 3. Frontmatter (obrigatório)

Todo arquivo `.mdx` **começa** com um bloco entre `---`, sem nenhuma linha em branco antes:

```mdx
---
title: Requisitos para o Teste
description: Requisitos mínimos para que os alunos sejam elegíveis aos testes de promoção.
---
```

Regras:

- Use **apenas** os campos `title` e `description`. Nenhum outro campo é permitido.
- `title` — curto, 2 a 5 palavras. É o que aparece no menu e no topo da página.
- `description` — **uma frase só**, terminando em ponto final. É o que aparece abaixo do título e no Google.
- Se o `title` ou a `description` contiver `:` (dois pontos), coloque o valor entre aspas duplas.
- Não use markdown (`**`, `[]()`, `#`) dentro do frontmatter. Só texto puro.
- Traduza `title` e `description` no arquivo em português.

---

## 4. Corpo do documento

Regras de estrutura:

- **Nunca use `#` (título nível 1)** no corpo. O título já vem do frontmatter.
- Comece com **um ou dois parágrafos de introdução**, sem título, explicando o assunto da página.
- Use `##` para as seções principais e `###` para subseções. Nada mais fundo que `###`.
- Parágrafos curtos: 1 a 4 linhas. Nada de blocos enormes de texto.
- Use `---` (linha horizontal) para separar seções grandes quando ajudar a leitura.
- Listas com `-`. Listas numeradas com `1.` só quando a ordem realmente importa.
- **Negrito** para regras obrigatórias, números e prazos. Nunca use itálico para dar ênfase.

Tom de escrita — este é um manual operacional para instrutores:

- Escreva no imperativo institucional: "o instrutor **deve**", "é **obrigatório**", "**não é permitido**".
- Objetivo e direto. Sem linguagem de marketing, sem "nós achamos que", sem emoji.
- Sempre que houver um número, deixe-o explícito: **80 minutos**, **10 minutos antes**, **30 aulas**.

---

## 5. Componentes permitidos

Só os componentes abaixo podem ser usados. **Qualquer outro componente, tag HTML ou `import` está proibido.**

> **Nenhum componente precisa de `import`.** Todos já estão registrados no projeto. Se a IA escrever uma linha de `import`, apague.

**Regra que vale para todos os componentes abaixo:** deixe uma **linha em branco depois da tag de abertura e antes da tag de fechamento**. Sem isso, o texto de dentro não é formatado.

### 5.1 Callout — caixas de destaque

Use para avisos, alertas e informações importantes.

```mdx
<Callout type="info">

Texto informativo, complementar ou uma dica útil.

</Callout>

<Callout type="warn">

Aviso importante. Algo que o instrutor precisa prestar atenção.

</Callout>

<Callout type="error">

Proibição ou consequência grave. Algo que **não pode** acontecer.

</Callout>
```

Regras do Callout:

- Os três tipos disponíveis são exatamente: `info`, `warn`, `error`. Não invente outros.
- Um Callout tem no máximo 3 ou 4 linhas. Não coloque seções inteiras dentro dele.
- Não use mais de 2 Callouts seguidos.

### 5.2 Steps — passo a passo

Use **apenas** para sequências ordenadas (estrutura de uma aula, etapas de um procedimento). Uma lista de requisitos sem ordem é uma lista com `-`, não é Steps.

```mdx
<Steps>

<Step>

### Ativação Articular

Descrição do que acontece nesta etapa.

</Step>

<Step>

### Aquecimento

Descrição do que acontece nesta etapa.

</Step>

</Steps>
```

Regras do Steps:

- Cada `<Step>` começa com um `###` que dá nome à etapa.
- Deixe linha em branco depois de `<Steps>`, `<Step>` e antes dos fechamentos.

### 5.3 Tabelas

Use para comparações, listas de requisitos e quadros de horários.

```mdx
| Promoção | Requisitos Mínimos |
| -------- | ------------------ |
| **Grau 1** | 30 aulas de Jiu-Jitsu |
| **Faixa Branca → Faixa Azul** | • 3 aulas de Jiu-Jitsu<br />• Participação em **2 competições** |
```

Regras das tabelas:

- Toda tabela precisa da linha de separação (`| --- | --- |`) logo abaixo do cabeçalho.
- Para listar vários itens dentro de uma célula, use `•` e `<br />` — **nunca** quebre a linha de verdade dentro da tabela.
- Máximo de 3 colunas. Tabelas mais largas não cabem no celular.

### 5.4 Cards — páginas de índice

Use apenas em páginas de índice, que apontam para as subpáginas de uma seção.

```mdx
<Cards>
  <Card
    title="Introdução"
    description="O que este manual abrange e uma visão geral do programa."
    href="/pt/docs/introduction"
  />
</Cards>
```

Atenção: o `href` do Card é a **única** exceção à regra dos links relativos da seção 5.8 — aqui o caminho é absoluto e **precisa** do idioma: `/pt/docs/...` no arquivo em português, `/en/docs/...` no arquivo em inglês.

### 5.5 Tabs — variações paralelas

Use quando o mesmo procedimento tem versões paralelas (por faixa, por dia da semana, por base).

```mdx
<Tabs items={['Faixa Azul', 'Faixa Roxa']}>

<Tab value="Faixa Azul">

Conteúdo da Faixa Azul.

</Tab>

<Tab value="Faixa Roxa">

Conteúdo da Faixa Roxa.

</Tab>

</Tabs>
```

Não force Tabs. Se as versões não forem realmente paralelas, use `##` normais.

### 5.6 Accordions — detalhe que pode ficar recolhido

Use para perguntas frequentes, exceções longas e detalhes opcionais que atrapalham a leitura principal.

```mdx
<Accordions type="single">

<Accordion title="E se o aluno perder o booklet?">

O oficial supervisor geral do Jiu-Jitsu deve ser comunicado.

</Accordion>

</Accordions>
```

### 5.7 Files — estrutura de pastas

Use para representar uma estrutura de pastas e arquivos, física ou digital.

```mdx
<Files>

<Folder name="Relatórios" defaultOpen>

<File name="injury-report.pdf" />

</Folder>

</Files>
```

### 5.8 Links

```mdx
Veja o [Código de Vestimenta](../professional-conduct/dress-code).
```

Regras dos links:

- O link é **relativo ao arquivo atual**, como um caminho de pasta: `../test/test-requirements`, `./booklet`.
- **Não coloque o idioma no caminho.** O site resolve sozinho, e o mesmo link funciona no arquivo em inglês e no arquivo em português — é por isso que usamos relativo.
- **Nunca** escreva `/docs/...`. Esse formato quebra.
- Não coloque `.mdx` no final do link.
- Para apontar para uma seção específica, acrescente `#` mais o título da seção em minúsculas com hífens: `../professional-conduct/dress-code#durante-as-aulas`.
- Se você não souber o caminho exato da outra página, **não invente**: escreva o nome da seção em **negrito** e adicione o comentário `<!-- LINK: confirmar caminho -->` na linha. O responsável ajusta depois.

### 5.9 Imagens

```mdx
![Formulário de presença](/attendance-form.png)
```

Regras das imagens:

- O arquivo de imagem vai na pasta `public/` do projeto — por isso o caminho começa com `/` e **não** inclui `public`.
- Nome do arquivo em minúsculas, sem acento e sem espaço, separado por hífen: `scorecard-header.png`.
- Sempre escreva um texto descritivo entre os colchetes.
- Envie os arquivos de imagem junto com o texto, com exatamente esses nomes.
- Toda imagem abre em tela cheia ao ser clicada — isso é automático, não precisa de nada.
- Se a imagem ficar larga demais, envolva com `<div className="mx-auto max-w-sm">` (com linha em branco antes e depois da imagem).

---

## 6. Proibido (quebra o site)

- Qualquer componente que não esteja na seção 5. O site tem outros componentes (`<TypeTable>`, `<Banner>`, `<InlineTOC>`), mas eles exigem configuração técnica e não são para uso da equipe — se o seu conteúdo parecer pedir um deles, descreva a necessidade no final da resposta em vez de escrever a tag.
- **Qualquer linha de `import`.** Todos os componentes da seção 5 já estão disponíveis.
- Tags HTML soltas (`<span>`, `<b>`, `<p>`, `<img>`). As únicas exceções são `<br />` dentro de tabelas e `<div className="...">` para limitar a largura de uma imagem.
- O símbolo `<` solto no texto. Se precisar escrever "menor que", escreva por extenso ou use `&lt;`.
- Chaves `{` e `}` soltas no texto. Se precisar, escreva `&#123;` e `&#125;`.
- Títulos nível 1 (`#`) no corpo.
- Blocos de código com três crases dentro do conteúdo do manual (isto aqui é um manual de procedimentos, não documentação de software).

---

## 7. Onde o arquivo vai ficar

O conteúdo vive em `content/docs/en/...` (inglês) e `content/docs/pt/...` (português). **As pastas têm exatamente os mesmos nomes nos dois idiomas** — só o conteúdo é traduzido:

| Assunto | Pasta (nos dois idiomas) |
| ------- | ------------------------ |
| Introdução, visão geral, cadeia de comando | `introduction/` |
| Conduta profissional, vestimenta | `professional-conduct/` |
| Desenvolvimento profissional, avaliação anual | `professional-development/` |
| Recursos humanos, férias | `human-resources/` |
| Aulas do dia a dia | `procedures/daily-classes/` |
| Booklet do aluno, estampas | `procedures/booklet/` |
| Documentação, formulários, relatórios | `procedures/documentation/` |
| Testes e promoções de alunos | `procedures/test/` |

Regras de nome de arquivo:

- **O nome do arquivo é o mesmo nos dois idiomas, e sempre em inglês.** `lesson-structure.mdx` em `en/` e em `pt/`. Não traduza nome de arquivo.
- Minúsculas, sem acento, sem espaço, separado por hífen. Extensão sempre `.mdx`.
- Se o assunto não se encaixar em nenhuma pasta da tabela, **não crie uma pasta nova**: use a pasta mais próxima e escreva um aviso no final da resposta dizendo que uma nova seção pode ser necessária.

Cada arquivo entregue deve vir com o caminho completo escrito acima dele, assim:

```
content/docs/en/procedures/test/test-requirements.mdx
content/docs/pt/procedures/test/test-requirements.mdx
```

---

## 8. Entrada no `meta.json` (menu lateral)

Uma página nova só aparece no menu se o nome do arquivo (sem `.mdx`) for adicionado ao `meta.json` da pasta — **nos dois idiomas**. Cada arquivo entregue precisa vir acompanhado da indicação de onde entrar:

```
Adicionar em content/docs/pt/procedures/test/meta.json:

{
  "title": "Teste",
  "pages": [
    "test-requirements",
    "scorecard",
    "nome-do-novo-arquivo"
  ]
}
```

Regras:

- A ordem da lista `pages` é a ordem que aparece no menu. Indique em qual posição a página nova deve entrar.
- O nome dentro de `pages` é o nome do arquivo **sem** a extensão `.mdx`, e é idêntico nos dois idiomas.
- Não altere o `title` do `meta.json` existente.

---

## 9. Pareamento entre inglês e português

Os dois arquivos são a mesma página em idiomas diferentes. Portanto:

- **Mesma quantidade de seções, na mesma ordem.**
- **Mesmos Callouts, nos mesmos lugares, com o mesmo `type`.**
- **Mesmas tabelas, com as mesmas linhas e colunas.**
- **Mesmo nome de arquivo e mesmo caminho de pasta.**
- Só o idioma muda: texto, `title`, `description` e títulos das seções. Os links relativos são idênticos nos dois arquivos.
- Termos técnicos de Jiu-Jitsu que já são usados em português permanecem em português nos dois arquivos quando for o padrão do esporte (ex.: *Jiu-Jitsu*, nomes de faixas seguem o idioma do arquivo).
- Números, prazos e requisitos **têm que ser idênticos** nas duas versões. Um erro de tradução em um número é um erro de procedimento.

---

## 10. Checklist final

Antes de entregar, confira item por item:

- [ ] O frontmatter existe, está no topo, e tem só `title` e `description`.
- [ ] A `description` é uma única frase terminando em ponto.
- [ ] Não existe `#` no corpo do documento.
- [ ] A página começa com parágrafo de introdução, não com um título.
- [ ] **Não existe nenhuma linha de `import`.**
- [ ] Todo componente tem linha em branco depois da abertura e antes do fechamento.
- [ ] O `type` de todo Callout é `info`, `warn` ou `error`.
- [ ] Toda tabela tem a linha `| --- | --- |` e no máximo 3 colunas.
- [ ] Todo link interno é relativo (`../pasta/pagina`), sem idioma e sem `.mdx`.
- [ ] Não há nenhum componente ou tag HTML fora da seção 5.
- [ ] Não há `<` nem `{` soltos no texto.
- [ ] Os dois arquivos (en e pt) têm exatamente a mesma estrutura de seções e o mesmo nome.
- [ ] Os caminhos completos dos dois arquivos estão escritos.
- [ ] O trecho do `meta.json` está incluído, para os dois idiomas.

---

## 11. Exemplo completo

**Arquivo 1 — `content/docs/en/professional-conduct/punctuality.mdx`**

```mdx
---
title: Punctuality
description: Arrival and punctuality standards required from all instructors.
---

Punctuality is a core requirement of the Palms Sports Jiu-Jitsu Program. Instructors represent the program from the moment they arrive at the base.

## Arrival Time

Instructors must be on the mat, in full uniform, **at least 10 minutes before** the scheduled class start time.

| Situation | Required Arrival |
| --------- | ---------------- |
| **Regular class** | 10 minutes before |
| **Promotion test** | 30 minutes before |
| **Competition** | 60 minutes before |

<Callout type="warn">

Arriving after the scheduled class time is considered a breach of the operational standard and must be reported to the base coordinator.

</Callout>

## Reporting Absences

If an instructor is unable to attend a scheduled class, the base coordinator must be informed **at least 12 hours in advance**, following the [Chain of Command](../introduction/chain-of-command).

<Callout type="error">

Missing a class without prior notice is not acceptable under any circumstance.

</Callout>
```

**Arquivo 2 — `content/docs/pt/professional-conduct/punctuality.mdx`**

```mdx
---
title: Pontualidade
description: Padrões de chegada e pontualidade exigidos de todos os instrutores.
---

A pontualidade é um requisito essencial do Programa de Jiu-Jitsu da Palms Sports. O instrutor representa o programa desde o momento em que chega à base.

## Horário de Chegada

Os instrutores devem estar no tatame, com o uniforme completo, **no mínimo 10 minutos antes** do horário previsto para o início da aula.

| Situação | Chegada Exigida |
| -------- | --------------- |
| **Aula regular** | 10 minutos antes |
| **Teste de promoção** | 30 minutos antes |
| **Competição** | 60 minutos antes |

<Callout type="warn">

Chegar após o horário previsto da aula é considerado uma quebra do padrão operacional e deve ser comunicado ao coordenador da base.

</Callout>

## Comunicação de Ausências

Caso o instrutor não possa comparecer a uma aula programada, o coordenador da base deve ser informado com **no mínimo 12 horas de antecedência**, seguindo a [Cadeia de Comando](../introduction/chain-of-command).

<Callout type="error">

Faltar a uma aula sem aviso prévio não é aceitável em nenhuma circunstância.

</Callout>
```

Repare que o link é **idêntico nos dois arquivos** — é essa a vantagem do link relativo.

**Trecho 3 — `meta.json`**

```
Adicionar "punctuality" em content/docs/en/professional-conduct/meta.json, após "dress-code".
Adicionar "punctuality" em content/docs/pt/professional-conduct/meta.json, após "dress-code".
```

---

## 12. Prompt

Anexe este arquivo na conversa, cole o prompt abaixo e troque `[COLE SEU TEXTO AQUI]` pelo seu texto:

```
Siga o guia em anexo e gere os arquivos .mdx do Manual de Jiu-Jitsu da Palms Sports
a partir do texto abaixo. Não invente regras, números ou procedimentos que não
estejam no texto — se faltar alguma informação, pergunte no final da resposta.

TEXTO:

[COLE SEU TEXTO AQUI]
```
