## Evolv - Engenharia Corporal

**Desenvolvido por:** Grupo Vitalis

O **Evolv** é muito mais que um aplicativo de academia. É um software focado em alta performance, progressão de carga (Sobrecarga Progressiva) e mapeamento analítico de hipertrofia muscular. Construído com uma interface "Dark Glassmorphism", ele oferece uma experiência de usuário (UX) premium e imersiva.

---

## Principais Funcionalidades (Frontend)

* **Treinos Inteligentes:** Calendário interativo e separação por divisão (A, B, C, D) com checkboxes dinâmicos.
* **Registro de Séries (PRs):** Cronômetro de descanso nativo e atualização automática de Carga Máxima (1RM).
* **Mapeamento Biomecânico:** Um modelo anatômico interativo. O algoritmo calcula o volume de treino (Séries x Reps x Carga) e o RPE para colorir os músculos (Verde = Evoluindo, Amarelo = Manutenção, Vermelho = Estagnado).
* **Medidas & Índices Pro:** Cálculo automático de IMC, Massa Magra Limpa, Meta de Água e o padrão ouro do fisiculturismo: o FFMI (Índice de Massa Livre de Gordura).
* **Comunidade Evolv:** Feed de atividades em tempo real, Calculadora de Tonelagem Automática na criação de posts, sistema de "Hype" (likes) e Ranking Semanal de Volume (Tonelagem).

---

## Tecnologias Utilizadas

* **React.js:** Biblioteca principal para construção das interfaces.
* **React Router Dom:** Para o roteamento seguro entre as páginas (SPA).
* **CSS3 Avançado:** Estilização responsiva, animações CSS e efeitos de "Glassmorphism" (vidro fosco).
* **Lucide React:** Biblioteca de ícones vetoriais.
* **LocalStorage API:** Utilizado temporariamente como Mock (Dublê) de banco de dados para garantir o funcionamento do fluxo de dados no Frontend.

---

## Como executar o projeto localmente

Siga o passo a passo abaixo para rodar o Evolv na sua máquina.

### Pré-requisitos
Você precisará ter o [Node.js](https://nodejs.org/) instalado no seu computador.

### Passo a passo

1. **Clone este repositório:**
   Abra o seu terminal e rode o comando:
   ```bash
   git clone https://github.com/MiguelMaranhao/Evolv-Frontend.git


2. **Acesse a pasta do projeto:**

```bash
cd evolv-frontend
```

**Instale as dependências:**
O projeto utiliza bibliotecas externas como o React Router e o Lucide Icons. Para baixá-las, rode:

```bash
npm install
```
**Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```
(Se você criou o projeto usando Create React App em vez de Vite, o comando será npm start)

**Acesse no Navegador:**
O terminal mostrará um link (geralmente http://localhost:5173 ou http://localhost:3000). Segure Ctrl e clique no link para abrir o aplicativo.

 Dica de Visualização: Pressione F12 no navegador e ative o modo mobile (celular) para ter a experiência correta, pois o Evolv foi desenhado no formato Mobile First!
