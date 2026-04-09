# Snippy

Snippy is a Discord server template bot developed by NEX.

It lets you save a server layout as a reusable template and apply that template to another server with slash commands.

## Features

- Save a server structure with `/template`
- Browse saved templates with `/templist`
- Import roles, channels, or a full template with `/temp`
- Store template data locally with SQLite

## Commands

- `/template name:<name> description:<description>`
- `/templist`
- `/temp code:<template_code> server_name:<new_name>`

## Setup

1. Install dependencies with `npm install`
2. Create a local `.env` file from `.env.example`
3. Add your Discord bot token and client ID to `.env`
4. Register slash commands with `npm run deploy`
5. Start the bot with `npm start`

## Environment Variables

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
```

## GitHub Notes

- `.env` is ignored so your token is not committed
- `templates.db` is ignored and will be recreated automatically when the bot starts
- The repository is now cleaned for publishing without bundled runtime data

## Project Structure

- `index.js` starts the bot and handles interactions
- `deploy-commands.js` registers slash commands
- `commands/` contains the slash command handlers
- `utils/templateManager.js` manages template storage
- `database.js` initializes the SQLite database

## Branding Note

This repo is branded as `Snippy` by `NEX`. If you also want the Discord bot account itself to display the name `Snippy`, update the application username in Discord's developer settings.
