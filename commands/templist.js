const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const templateManager = require("../utils/templateManager");
const { BOT_NAME, BOT_DEVELOPER } = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("templist")
    .setDescription("List all saved templates for this server"),

  async execute(interaction) {
    const templates = await templateManager.getAllTemplates(interaction.guildId);

    if (templates.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2b2d31)
            .setDescription("No templates found. Create one with `/template`."),
        ],
        ephemeral: true,
      });
    }

    const itemsPerPage = 5;
    const pages = Math.ceil(templates.length / itemsPerPage);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const pageTemplates = templates.slice(start, end);

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("Saved Templates")
        .setDescription(`Page ${page + 1}/${pages}`)
        .setFooter({
          text: `Total: ${templates.length} template(s) | ${BOT_NAME} by ${BOT_DEVELOPER}`,
        })
        .setTimestamp();

      pageTemplates.forEach((template, index) => {
        embed.addFields({
          name: `${start + index + 1}. ${template.name}`,
          value: `Code: \`${template.code}\`\nCreated: <t:${Math.floor(template.created_at / 1000)}:R>${template.description ? `\nDescription: ${template.description}` : ""}`,
          inline: false,
        });
      });

      return embed;
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev_page")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(pages <= 1),
    );

    const response = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: [row],
      fetchReply: true,
    });

    if (pages <= 1) return;

    const collector = response.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "Only the command user can navigate.",
          ephemeral: true,
        });
      }

      if (i.customId === "prev_page") {
        currentPage--;
      } else if (i.customId === "next_page") {
        currentPage++;
      }

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev_page")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next_page")
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === pages - 1),
      );

      await i.update({
        embeds: [generateEmbed(currentPage)],
        components: [newRow],
      });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev_page")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("next_page")
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      );

      await response.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
