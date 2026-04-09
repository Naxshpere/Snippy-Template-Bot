require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_NAME, BOT_DEVELOPER } = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    console.log(`[${BOT_NAME}] Loaded command: ${command.data.name}`);
  } else {
    console.log(`[${BOT_NAME}] Command ${file} is missing required properties.`);
  }
}

client.once("clientReady", () => {
  console.log(`[${BOT_NAME}] ${client.user.tag} is online and ready.`);
  console.log(`[${BOT_NAME}] Developed by ${BOT_DEVELOPER}.`);
  console.log(`[${BOT_NAME}] Serving ${client.guilds.cache.size} guild(s).`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xed4245)
        .setDescription(`${BOT_NAME} ran into an error while executing this command.`);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
    return;
  }

  if (!interaction.isButton()) {
    return;
  }

  const customId = interaction.customId;

  if (
    customId.startsWith("import_") ||
    customId.startsWith("roles_") ||
    customId.startsWith("channels_") ||
    customId.startsWith("cancel_")
  ) {
    const parts = customId.split("_");
    const action = parts[0];
    const code = parts[1];
    const serverName = parts.slice(2).join("_");

    const tempCommand = client.commands.get("temp");
    if (tempCommand && tempCommand.handleButton) {
      await tempCommand.handleButton(interaction, action, code, serverName);
    } else {
      await interaction.reply({
        content: "Template command not found.",
        ephemeral: true,
      });
    }
    return;
  }

  if (customId === "prev_page" || customId === "next_page") {
    return;
  }

  await interaction.reply({
    content: "Unknown button interaction.",
    ephemeral: true,
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("DISCORD_TOKEN is not set in your .env file.");
  process.exit(1);
}

client.login(token);
