const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const templateManager = require("../utils/templateManager");
const { BOT_NAME, BOT_DEVELOPER } = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Save current server structure as a template")
    .addStringOption((option) =>
      option.setName("name").setDescription("Template name").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Template description")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply();

    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description") || "";
    const guild = interaction.guild;

    try {
      const templateData = {
        name,
        description,
        roles: await this.collectRoles(guild),
        categories: await this.collectCategories(guild),
        channels: await this.collectChannels(guild),
      };

      const code = await templateManager.addTemplate(guild.id, templateData);

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("Template Saved")
        .setDescription("Server structure has been saved as a template.")
        .addFields(
          { name: "Template Code", value: `\`${code}\``, inline: true },
          { name: "Name", value: name, inline: true },
          {
            name: "Stats",
            value: `${templateData.roles.length} roles | ${templateData.channels.length} channels`,
            inline: false,
          },
        )
        .setFooter({
          text: `Use /temp ${code} to apply this template | ${BOT_NAME} by ${BOT_DEVELOPER}`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: `Failed to save template. Check ${BOT_NAME}'s permissions.`,
      });
    }
  },

  async collectRoles(guild) {
    const roles = await guild.roles.fetch();
    return roles
      .filter((role) => !role.managed && role.name !== "@everyone" && role.editable)
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        name: role.name,
        color: role.hexColor,
        permissions: role.permissions.toArray(),
        position: role.position,
        mentionable: role.mentionable,
        hoist: role.hoist,
      }));
  },

  async collectCategories(guild) {
    const channels = await guild.channels.fetch();
    return channels
      .filter((channel) => channel.type === 4)
      .sort((a, b) => a.position - b.position)
      .map((category) => ({
        id: category.id,
        name: category.name,
        position: category.position,
      }));
  },

  async collectChannels(guild) {
    const channels = await guild.channels.fetch();
    return channels
      .filter((channel) => channel.type !== 4)
      .filter((channel) => channel.manageable)
      .sort((a, b) => a.position - b.position)
      .map((channel) => ({
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parentId: channel.parentId,
        topic: channel.topic || null,
        nsfw: channel.nsfw || false,
        bitrate: channel.bitrate || null,
        userLimit: channel.userLimit || null,
        rateLimitPerUser: channel.rateLimitPerUser || null,
      }));
  },
};
