
# 🧠 RavenDB Demo Explorer

A minimal Next.js app showcasing RavenDB’s AI features:  
- 🔍 AI Product Explorer (Vector Search + multilingual support)  
- 🎧 Intelligent Helpdesk (GenAI summaries + sales detection)  
- 🛒 Shopping AI Agent (conversational ordering + stock check)

## ⚙️ Setup

```bash
pnpm install
pnpm dev
````

Runs at [http://localhost:3000](http://localhost:3000)

> Requires a RavenDB server running on your machine, with database named **genai**
> `http://127.0.0.1:8080` (unsecured) 

---

## 📁 Important directories

* `lib/` – RavenDB logic, server actions, types, etc. <- non-AI-generated code
* `components/ui` – AI generated UI
* `components/views/` – isolated demos views
* `app/` – routes and layout


![image](https://github.com/user-attachments/assets/f98b375e-9dc0-4420-bbf5-50988737c5e5)
![image](https://github.com/user-attachments/assets/0cf5c032-a6be-424c-8c3c-1c48df4c79e6)


