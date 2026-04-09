**Snippy – The Ultimate Discord Server Dupe Bot (No Cap, Fr)**

Yo, Snippy’s the bot that lets you **clone your Discord server like a boss** no manual setup, no stress. Made by NEX, it’s the **CTRL+C / CTRL+V** of Discord servers. Save your whole layout, then slap it onto another server with **slash commands only**. No fluff, just **pure efficiency**.

---

### **What’s the Move?**
- **`/template`** – Save your server’s whole **vibe** (roles, channels, the works)
- **`/templist`** – Peep all your saved templates (like a digital mood board)
- **`/temp`** – Import roles, channels, or the **entire server** with one command
- **SQLite storage** – No cloud, no drama, just **local data** (safe & sound)

---

### **Commands (Keep It 100)**
- **`/template name:<name> description:<description>`** – Save your server’s **aesthetic**
- **`/templist`** – Browse your saved templates (like a **Discord Pinterest**)
- **`/temp code:<template_code> server_name:<new_name>`** – **Duplicate that server** like a pro

---

### **Setup (No L, Just W’s)**
1. **`npm install`** – Get the deps (no excuses)
2. **`.env` file** – Copy `.env.example`, plug in your **bot token & client ID**
3. **`npm run deploy`** – Register those **smooth slash commands**
4. **`npm start`** – Fire it up and **let it rip**

---

### **Env File (Don’t Sleep on This)**
```env
DISCORD_TOKEN=your_bot_token_here_keep_it_secret_keep_it_safe
CLIENT_ID=your_app_id_goes_here
```
*(Pro tip: `.env` is ignored so your token stays **secure**—no leaks, no stress.)*

---

### **GitHub Stuff (For the Devs)**
- **`.env` & `templates.db` are ignored** – No accidental commits, no mess
- **Repo’s clean** – No random junk, just **pure, functional code**

---

### **Project Breakdown (For the Tech Heads)**
- **`index.js`** – Bot startup + **command handling** (the **brain**)
- **`deploy-commands.js`** – Slash command **registration** (the **setup**)
- **`commands/`** – Where the **magic happens** (command logic)
- **`utils/templateManager.js`** – **Template storage** (the **vault**)
- **`database.js`** – SQLite **initialization** (the **backbone**)

---

### **Branding Flex (Make It Official)**
This is **Snippy by NEX**—if you want the bot’s name to match, **rename the app in Discord’s dev settings**. No weak branding, just **pure consistency**.

---

**Snippy’s the move.** Clone servers **fast**, keep it **clean**, and **never manually set up roles again**. 🚀