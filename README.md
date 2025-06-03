
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

> Requires a RavenDB database named **genai** at
> `http://live-test.ravendb.net` (no auth needed)

---

## 📁 Important directories

* `lib/` – RavenDB logic, server actions, types, etc. <- non-AI-generated code
* `components/ui` – AI generated UI
* `components/views/` – isolated demos views
* `app/` – routes and layout


