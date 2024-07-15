# Wendy | The Telegram Chatbot

---

## Participants 

---

- Vladislav Artiukhov
- German Bagdasaryan



## 🎉 Awards 🎉

---

### 🥇 The solution has won the hackathon!!! 🥇

The project succeeded in securing **4/9 nominations**:

💻 **Code Quality**</br>
🔄 **Continuous Engagement and Support**</br>
🔒 **Security and Privacy Assurance**</br>
🏗️ **Architecture Scalability**


## Idea

---

**Wendy** is an **AI Telegram chatbot** that has a **personality of a helpful and loving pal** designed to help her peers with mental health issues.

The prompts are designed to make the AI behave like a real person, creating high engagement for continued chatting with Wendy (**implemented**).

Besides the conversation with the AI, the application allows users fill out a personal questionnaire that enriches the knowledge of the AI about her partner (**implemented**).

Users can set up custom notifications, enabling the AI to initiate conversations based on recent changes in users' lives reflected in previous messages (**proposal**). This brings AI a proactive attitude in conversations.

In case of emotional deprivation, AI may suggest the contacts of **local mental health support affiliations** based on user's country of residence. Besides, users may access these contacts in their accounts (implemented via **Telegram webapps**) (**proposed**).


## Project Description

---

### Hackathon

The project was implemented during the 3-day hackathon **["AI-Powered Mental Wellness Support Chatbot"](https://hackformental.com/)** (27.06 — 30.06, 2024) held by **[Hackathon Raptors](https://www.raptors.dev/)**.

The main hackathon objectives were to create empathetic AI-user interactions and sustained user engagement, positioning the bot as a bridge to public mental health affiliations.



### Technical features
  - **Cold conversation start**: post questionnaire completion, AI always **initiates the first chat message**; leveraging the **Few Shot Prompting** technique, we create sample conversation between Wendy and the user (based on the questionnaire). This sample is then used for the AI's second prompt to initiate the conversation.
  - **Message summaries**: crafting summaries of chat messages with AI and using them in chat history to preserve more details about past conversations<sup>1</sup> (**implemented**).
  - **AES encryption**: encrypt messages and their summaries before storing them in the database (**implemented**).
  - **Telegram webapp integration**: features, other that chatting, are delivered in a stand-alone web app that is attached to the Wendy Telegram bot as a **Telegram webapp** (**implemented**).

<sup>1</sup> _Chat history consists of a concatenation of summarized and normal chat messages (the exact history structure is defined by a selected history crafting strategy)._


### Functional features
  - **Engaging conversation with AI**: utilize **GPT-4o** and **research-based prompting techniques**<sup>1</sup> to make the AI as human-like as possible. 
  - **Periodic and occasional notifications**: user may select time periods when they would love to hear from Wendy and share their thoughts; besides, Wendy may write _occasional messages_ such as happy birthday, New Year, Christmas or users' country local events greetings (**proposed**).
  - **Personalized Questionnaires**: users provide additional information about them to have better more personal dialogs (**implemented**).
  - **Mood classification**: Periodically classify user mood based on chat messages via AI to determine when to suggest contacts for mental health organizations. 
  - **Contacts of local mental health affiliations**: contacts are defined based on user's country of residence and are always present in the Telegram webapp or suggested by Wendy (**proposed**). 
  - **Mental Health Surveys**: users may find standardized self-surveys, such as [Beck](https://en.wikipedia.org/wiki/Beck_Depression_Inventory) and [Children's Depression Inventories](https://en.wikipedia.org/wiki/Children%27s_Depression_Inventory#:~:text=The%20CDI%20is%20a%2027,rating%20from%200%20to%202.), delivered as interactive forms within the Telegram webapp (**proposed**).

<sup>1</sup> _We utilized **Few-Short Prompting**<sup>2</sup> and **Emotional Prompting**<sup>3</sup> techniques that are empirically shown to yield better LLM responses._

<sup>2</sup> _“Language Models are Few-Shot Learners”, Brown et al, 2020._

<sup>3</sup> _“Large Language Models Understand and Can be Enhanced by Emotional Stimuli”, Li et al., 2023._


## Technical details

---



## Demos:

---



## Development:

---

### Dependencies

- Docker & docker-compose
- nodejs & npm

To install the project dependencies run:
```bash
make install
# runs: npm install
```


### Database

1. Create an `.env` file in the root of the project and insert the following variables:
   ```shell
   # used by `docker/docker-compose.yaml`
   POSTGRES_USER=user 
   POSTGRES_PASSWORD=pass
   POSTGRES_DB=db_name
   POSTGRES_PORT=5432
   
   # used by Prisma
   DATABASE_URL="postgresql://user:pass@localhost:5432/db_name?schema=public"
   
   # user for Telegram API
   BOT_TOKEN=1234567:AAAAAA-BBBBBBBBBBB-CCCCCCCCCCCC
   OPENAI_API_KEY=sdf_fds-fsdasdfasdfasdfsnfsdfsdfadf
   ```

2. To boot up the postgres database in a docker run:
    ```bash
    make compose
   # runs: docker-compose --env-file ./.env -f docker/docker-compose.yaml up
    ```

### Server

To start the server run:
```bash
make run
# runs: npx ts-node ./src/index.ts
```


## Architecture:

Navigate to this [README.md](./assets/sequence-diagrams/README.md).

---



```
### Recent updates:
Summarized version of the message:
[Sent by]: user
[Summary]: "Tell me about yourself"

Summarized version of the message:
[Sent by]: assistant
[Summary]: "I’m Wendy, I love fantasy."

### Last conversation messages:
[Sent by]: user
[Message]: "please do not write so much text, it is annoying.."

[Sent by]: assistant
[Message]: "I'm sorry about that, Vlad. I'll keep it short."

### Last message:
Hi!
```