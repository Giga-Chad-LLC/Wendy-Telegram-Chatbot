# Wendy | Mental Health AI Telegram Chatbot

![Header](./assets/readme/header.png)

## 🤝 Participants

---

- Vladislav Artiukhov
- German Bagdasaryan



## 🎉 Awards

---

### 🥇 The solution has won the ["AI-Powered Mental Wellness Support Chatbot"](https://hackformental.com/) hackathon!

The project succeeded in securing **4/9 nominations**:

💻 **Code Quality**</br>
🔄 **Continuous Engagement and Support**</br>
🔒 **Security and Privacy Assurance**</br>
🏗️ **Architecture Scalability**

**We got published on the hackathon's [winners page](https://hackformental.com/winners)!**

## 🌟 Idea

---

**Wendy** is an **AI Telegram chatbot** that has a **personality of a helpful and loving pal** designed to help her peers with mental health issues.

The prompts are designed to make the AI behave like a real person, creating high engagement for continued chatting with Wendy (**implemented**).

Besides the conversation with the AI, the application allows users fill out a personal questionnaire that enriches the knowledge of the AI about her partner (**implemented**).

Users can set up custom notifications, enabling the AI to initiate conversations based on recent changes in users' lives reflected in previous messages (**proposal**). This brings AI a proactive attitude in conversations.

In case of emotional deprivation, AI may suggest the contacts of **local mental health support affiliations** based on user's country of residence. Besides, users may access these contacts in their accounts (implemented via **Telegram webapps**) (**proposed**).


## ▶️ Demos

---

1. **Presentation Defense**: [link](https://www.youtube.com/watch?v=UXNR1TSjhJw&t=179s&ab_channel=VladislavArtiukhov).
2. **Demo for Hackathon**: [link](https://www.youtube.com/watch?v=9Mh6I-XeOs8&t=2s&ab_channel=VladislavArtiukhov).
3. **Extended Demo (a real prolonged conversation)**: [link](https://www.youtube.com/watch?v=xx4KD5zgnsA&t=4s&ab_channel=VladislavArtiukhov).
4. **Live stream with Nominations & winner selection**: [link](https://raptors.wistia.com/medias/8al3d25uv2).

**Start of the conversation:**

_Cold conversation start_ feature is turned off, as it requires a filled out questionnaire and a server hosted on a publicly available server (as far as we know, it is a limitation of the Telegram webapps): 

<img alt="" src="./assets/readme/demos/harry-potter.gif" />
<div style="margin-top:30px;"></div>



**Talking about Harry Potter:**

The prompt contained information that Wendy loves reading fantasy books, such as "Harry Potter" and "Lord of the Rings".

<img alt="" src="./assets/readme/demos/harry-potter.gif" />
<div style="margin-top:30px;"></div>



**Talking about intimate relationship:**

**To our surprise, the LLM created and developed the narrative that was not inserted in the prompt**:
Wendy previously had intimate relationship with a guy named Alex. They broke up because of having too little time to spend together.  

<img alt="" src="./assets/readme/demos/relationship.gif" />


---



## 📝 Project Description

---

### 🚀 Hackathon

The project was implemented during the 3-day hackathon **["AI-Powered Mental Wellness Support Chatbot"](https://hackformental.com/)** (27.06 — 30.06, 2024) held by **[Hackathon Raptors](https://www.raptors.dev/)**.

The main hackathon objectives were to create empathetic AI-user interactions and sustained user engagement, positioning the bot as a bridge to public mental health affiliations.



### ⚙️ Technical features
  - **Cold conversation start**: post questionnaire completion, AI always **initiates the first chat message**; leveraging the **Few Shot Prompting** technique, we create sample conversation between Wendy and the user (based on the questionnaire). This sample is then used for the AI's second prompt to initiate the conversation.
  - **Message summaries**: crafting summaries of chat messages with AI and using them in chat history to preserve more details about past conversations<sup>1</sup> (**implemented**).
  - **AES encryption**: encrypt messages and their summaries before storing them in the database (**implemented**).
  - **Telegram webapp integration**: features, other that chatting, are delivered in a stand-alone web app that is attached to the Wendy Telegram bot as a **Telegram webapp** (**implemented**).

<sup>1</sup> _Chat history consists of a concatenation of summarized and normal chat messages (the exact history structure is defined by a selected history crafting strategy)._


### 🧩 Functional features
  - **Engaging conversation with AI**: utilize **GPT-4o** and **research-based prompting techniques**<sup>1</sup> to make the AI as human-like as possible. 
  - **Periodic and occasional notifications**: user may select time periods when they would love to hear from Wendy and share their thoughts; besides, Wendy may write _occasional messages_ such as happy birthday, New Year, Christmas or users' country local events greetings (**proposed**).
  - **Personalized Questionnaires**: users provide additional information about them to have better more personal dialogs (**implemented**).
  - **Mood classification**: Periodically classify user mood based on chat messages via AI to determine when to suggest contacts for mental health organizations. 
  - **Contacts of local mental health affiliations**: contacts are defined based on user's country of residence and are always present in the Telegram webapp or suggested by Wendy (**proposed**). 
  - **Mental Health Surveys**: users may find standardized self-surveys, such as [Beck](https://en.wikipedia.org/wiki/Beck_Depression_Inventory) and [Children's Depression Inventories](https://en.wikipedia.org/wiki/Children%27s_Depression_Inventory#:~:text=The%20CDI%20is%20a%2027,rating%20from%200%20to%202.), delivered as interactive forms within the Telegram webapp (**proposed**).

<sup>1</sup> _We utilized **Few-Short Prompting**<sup>2</sup> and **Emotional Prompting**<sup>3</sup> techniques that are empirically shown to yield better LLM responses._

<sup>2</sup> _“Language Models are Few-Shot Learners”, Brown et al, 2020._

<sup>3</sup> _“Large Language Models Understand and Can be Enhanced by Emotional Stimuli”, Li et al., 2023._


## 🛠️ Technical details

---

### Stack

<table>
   <th>Technology</th><th>Rationale</th>
   <tr><td><b>TypeScript</b></td><td>Types + rapid development + <code>npm</code></td></tr>
   <tr><td><b>Telegram Bot API</b></td><td>Popular message + advanced APIs</td></tr>
   <tr><td><b>OpenAI API</b></td><td>Robust API + advanced LLMs</td></tr>
   <tr><td><b>PostgreSQL</b></td><td>Popular relational database</td></tr>
   <tr><td><b>Prisma</b></td><td>Best ORM for TypeScript</td></tr>
   <tr><td><b>Docker</b></td><td>Deployment + containerization</td></tr>
   <tr><td><b>Vitest</b></td><td>Rapid unit testing</td></tr>
</table>

### Advanced History Crafting

<div style="display:flex;justify-content:center;">
   <img style="width:50%;margin-right:15px" alt="advanced-history-crafting" src="./assets/readme/advanced-history-crafting.PNG"/>

   <div>The history is a sliding window over the sequence of messages. We greedily try to collect <code>N</code> messages splitting them in halves, where messages from the 1st half (older messages) come as summarized messages, and from the 2nd half as normal ones. It allows to incorporate more information about the past conversations. <i>Messages Summaries are created by an LLM</i>.</div>
</div>

An example of a charted history to the LLM:

```
### Recent updates:
Summarized version of the message:
[Sent by]: user
[Time]: 12 Oct, 2024, 21:00:00
[Summary]: "Tell me about yourself"

Summarized version of the message:
[Sent by]: assistant
[Time]: 12 Oct, 2024, 21:00:30
[Summary]: "I’m Wendy, I love fantasy."


### Last conversation messages:
[Sent by]: user
[Time]: 12 Oct, 2024, 21:00:55
[Message]: "please do not write so much text, it is annoying.."

[Sent by]: assistant
[Time]: 12 Oct, 2024, 21:01:12
[Message]: "I'm sorry about that, Vlad. I'll keep it short."


### Last message:
Hi!
```

### Prompt templates

Prompts are implemented in a way to support dynamic content insertion, allowing use of pre-defined variables. See [`PromptTemplate`](./src/app/llm/prompt/template/PromptTemplate.ts) class for details.


### Questionnaire

Personal questionnaires are implemented as a web form within the Telegram webapp:

<div style="display:flex;justify-content:center">
   <img style="max-height:500px" alt="questionnaire" src="./assets/readme/questionnaire.png"/>
</div>

Once a user sends the form, we store the data in the database for further use in the system prompt for the LLM.


## 👨‍💻 Development

---

### Dependencies

- Docker & docker-compose
- nodejs & npm

To install the project dependencies run:
```bash
make install
# runs: npm install
```


### Environment Variables 

1. Create an `.env` file in the root of the project and insert the following variables:
   ```shell
   # Database:
   # used by `docker/docker-compose.yaml`
   POSTGRES_USER=user 
   POSTGRES_PASSWORD=pass
   POSTGRES_DB=db_name
   POSTGRES_PORT=5432
   # used by Prisma
   DATABASE_URL="postgresql://user:pass@localhost:5432/db_name?schema=public"
   
   # Telegram bot:
   BOT_TOKEN=1234567:AAAAAA-BBBBBBBBBBB-CCCCCCCCCCCC
   
   # OpenAI:
   OPENAI_API_KEY=sdf_fds-fsdasdfasdfasdfsnfsdfsdfadf
   
   # Encryption (optional: if absent no encryption applied):
   ENCRYPTION_KEY=my-encryption-key
   ```

2. To boot up the postgres database in a docker run:
    ```bash
    make compose
   # runs: docker-compose --env-file ./.env -f docker/docker-compose.yaml up -d
    ```

### Server (Telegram Bot)

To start the server run:
```bash
make run
# runs: npx ts-node ./src/index.ts
```

[//]: # ()
[//]: # (## Architecture:)

[//]: # ()
[//]: # (Navigate to this [README.md]&#40;./assets/sequence-diagrams/README.md&#41;.)

[//]: # ()
[//]: # (---)
