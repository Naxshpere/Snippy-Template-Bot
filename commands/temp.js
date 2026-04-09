const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const templateManager = require("../utils/templateManager");
const { BOT_NAME, BOT_DEVELOPER } = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("temp")
    .setDescription("Apply a saved template to this server")
    .addStringOption((option) =>
      option.setName("code").setDescription("Template code").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("server_name")
        .setDescription("New server name")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const code = interaction.options.getString("code").toUpperCase();
    const serverName = interaction.options.getString("server_name");

    const template = await templateManager.getTemplate(code);

    if (!template) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setDescription("Invalid template code. Use `/templist` to see available templates."),
        ],
        ephemeral: true,
      });
    }

    const previewEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("Template Preview")
      .setDescription(`**${template.name}**\n${template.description || "*No description*"}`)
      .addFields(
        {
          name: "Statistics",
          value: `${template.data.roles.length} Roles\n${template.data.categories.length} Categories\n${template.data.channels.length} Channels`,
          inline: true,
        },
        {
          name: "New Server Name",
          value: `**${serverName}**`,
          inline: true,
        },
        {
          name: "Created",
          value: `<t:${Math.floor(template.created_at / 1000)}:R>`,
          inline: true,
        },
      )
      .setFooter({
        text: `Select what to import below | ${BOT_NAME} by ${BOT_DEVELOPER}`,
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`import_${code}_${serverName}`)
        .setLabel("Import All")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`roles_${code}_${serverName}`)
        .setLabel("Roles Only")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`channels_${code}_${serverName}`)
        .setLabel("Channels Only")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`cancel_${code}_${serverName}`)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({
      embeds: [previewEmbed],
      components: [row],
    });
  },

  async handleButton(interaction, action, code, serverName) {
    if (action === "cancel") {
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2b2d31)
            .setDescription("Template import cancelled."),
        ],
        components: [],
      });
      return;
    }

    const template = await templateManager.getTemplate(code);
    if (!template) {
      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setDescription("Template not found. It may have been deleted."),
        ],
        components: [],
      });
    }

    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2b2d31)
          .setDescription(
            `${BOT_NAME} is importing ${action === "import" ? "all components" : action}. This may take a moment.`,
          ),
      ],
      components: [],
    });

    try {
      const guild = interaction.guild;

      await guild.setName(serverName);

      if (action === "import" || action === "roles") {
        await this.importRoles(guild, template.data.roles);
      }

      if (action === "import" || action === "channels") {
        await this.importChannels(guild, template.data);
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle("Import Complete")
            .setDescription(
              `Successfully imported ${action === "import" ? "all components" : action} from template \`${code}\` into **${serverName}**!`,
            ),
        ],
        components: [],
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setDescription(`Import failed: ${error.message}`),
        ],
        components: [],
      });
    }
  },

  async importRoles(guild, rolesData) {
    const existingRoles = guild.roles.cache.filter(
      (role) => !role.managed && role.name !== "@everyone" && role.editable,
    );

    for (const role of existingRoles.values()) {
      await role.delete().catch(() => {});
      await this.delay(300);
    }

    const sortedRoles = [...rolesData].sort((a, b) => a.position - b.position);
    for (const roleData of sortedRoles) {
      await guild.roles.create({
        name: roleData.name,
        color: roleData.color,
        permissions: roleData.permissions,
        mentionable: roleData.mentionable,
        hoist: roleData.hoist,
        position: roleData.position,
      });
      await this.delay(300);
    }
  },

  async importChannels(guild, templateData) {
    const existingChannels = guild.channels.cache.filter((channel) => channel.manageable);
    for (const channel of existingChannels.values()) {
      await channel.delete().catch(() => {});
      await this.delay(300);
    }

    const categoryMap = new Map();
    for (const categoryData of templateData.categories) {
      const category = await guild.channels.create({
        name: categoryData.name,
        type: 4,
        position: categoryData.position,
      });
      categoryMap.set(categoryData.id, category.id);
      await this.delay(300);
    }

    const sortedChannels = [...templateData.channels].sort(
      (a, b) => a.position - b.position,
    );
    for (const channelData of sortedChannels) {
      await guild.channels.create({
        name: channelData.name,
        type: channelData.type,
        position: channelData.position,
        parent: channelData.parentId ? categoryMap.get(channelData.parentId) : null,
        topic: channelData.topic,
        nsfw: channelData.nsfw,
        bitrate: channelData.bitrate,
        userLimit: channelData.userLimit,
        rateLimitPerUser: channelData.rateLimitPerUser,
      });
      await this.delay(300);
    }
  },

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
