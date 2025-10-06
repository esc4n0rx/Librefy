# Librefy

Librefy é um aplicativo móvel para amantes de livros. Ele permite que você descubra novos livros, organize sua biblioteca pessoal e leia seus livros favoritos em qualquer lugar.

##  Funcionalidades

*   **Autenticação Completa**: Login com e-mail/senha e social (Google).
*   **Gerenciamento de Perfil**: Atualize suas informações de perfil.
*   **Descoberta de Livros**: Explore, filtre e pesquise livros.
*   **Biblioteca Pessoal**: Adicione/remova livros, marque como favoritos e acompanhe o progresso.
*   **Leitor de Livros**: Interface de leitura personalizável com temas, fontes e espaçamento.
*   **Criação e Edição**: Escreva e gerencie seus próprios livros e capítulos.
*   **Avaliações e Comentários**: Avalie e comente sobre os livros.

##  Tecnologias Utilizadas

*   **React Native**: Framework para desenvolvimento de aplicativos móveis.
*   **Expo**: Plataforma para facilitar o desenvolvimento com React Native.
*   **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
*   **Supabase**: Backend como serviço para autenticação e banco de dados.
*   **Firebase**: Para autenticação social (Google).
*   **Expo Router**: Para navegação baseada em arquivos.

##  Começando

Siga as instruções abaixo para rodar o projeto localmente.

### Pré-requisitos

*   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
*   [npm](https://www.npmjs.com/)

### Instalação

1.  Clone o repositório:

    ```bash
    git clone https://github.com/esc4n0rx/librefy.git
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

### Rodando o Aplicativo

1.  Inicie o servidor de desenvolvimento:

    ```bash
    npm start
    ```

2.  Abra o aplicativo em um emulador ou em seu dispositivo físico usando o aplicativo Expo Go.

##  Estrutura do Projeto

```
Librefy/
├── app/                # Arquivos de rota e telas
├── assets/             # Imagens, fontes e outros assets
├── components/         # Componentes reutilizáveis
├── constants/          # Constantes do projeto
├── contexts/           # Contextos do React
├── hooks/              # Hooks personalizados
├── services/           # Serviços de API
└── types/              # Tipos e interfaces do TypeScript
```

<details>
<summary> Lógica Principal e Hooks</summary>

| Hook                  | Descrição                                                                              |
| --------------------- | -------------------------------------------------------------------------------------- |
| `useAuth`             | Fornece o contexto de autenticação, incluindo informações do usuário e funções de login/logout. |
| `useAutoSave`         | Salva dados automaticamente após um determinado período de inatividade.                  |
| `useGoogleAuth`       | Gerencia o fluxo de autenticação com o Google.                                         |
| `useImageAuth`        | Autentica e carrega imagens de uma API protegida.                                      |
| `useReadingProgress`  | Salva e carrega o progresso de leitura de um capítulo.                                   |
| `useThemeColor`       | Retorna cores com base no tema atual (claro/escuro).                                     |

</details>

<details>
<summary> Serviços</summary>

| Serviço               | Descrição                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `AuthService`         | Gerencia a autenticação de e-mail/senha (registro, login, logout, redefinição de senha).             |
| `BookService`         | Gerencia todas as operações relacionadas a livros (CRUD de livros e capítulos, biblioteca do usuário). |
| `ContentService`      | Gerencia conteúdos especiais de um livro (resumo, dedicatória, etc.).                             |
| `DiscoverService`     | Busca e filtra livros públicos para a seção de descoberta.                                           |
| `ReadingService`      | Salva e recupera o progresso de leitura do usuário.                                                   |
| `ReviewService`       | Gerencia avaliações e comentários de livros.                                                          |
| `SocialAuthService`   | Gerencia a autenticação social (atualmente apenas Google).                                            |
| `UploadService`       | Faz upload de arquivos (capas de livros, etc.) para um serviço de armazenamento externo.             |

</details>

<details>
<summary> Modelos de Dados</summary>

### `User`

| Campo         | Tipo     | Descrição                               |
| ------------- | -------- | ----------------------------------------- |
| `id`          | `string` | ID único do usuário (UUID).               |
| `email`       | `string` | E-mail do usuário.                        |
| `full_name`   | `string` | Nome completo do usuário.                 |
| `avatar_url`  | `string` | URL da imagem de perfil do usuário.       |

### `Book`

| Campo         | Tipo        | Descrição                               |
| ------------- | ----------- | ----------------------------------------- |
| `id`          | `string`    | ID único do livro (UUID).                 |
| `author_id`   | `string`    | ID do autor do livro.                     |
| `title`       | `string`    | Título do livro.                          |
| `synopsis`    | `string`    | Sinopse do livro.                         |
| `status`      | `BookStatus`| Status do livro (`draft`, `published`).   |

### `BookChapter`

| Campo            | Tipo       | Descrição                               |
| ---------------- | ---------- | ----------------------------------------- |
| `id`             | `string`   | ID único do capítulo (UUID).              |
| `book_id`        | `string`   | ID do livro ao qual o capítulo pertence.  |
| `title`          | `string`   | Título do capítulo.                       |
| `chapter_number` | `number`   | Número do capítulo na ordem de leitura.   |
| `content`        | `string`   | Conteúdo do capítulo em Markdown.         |

</details>

##  Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.
