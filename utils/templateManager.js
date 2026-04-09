const { run, get, all } = require("../database");

class TemplateManager {
  // Generate 6-character uppercase alphanumeric code
  generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Add a new template (returns the generated code)
  async addTemplate(guildId, templateData) {
    const code = this.generateCode();

    await run(
      `INSERT INTO templates (code, guild_id, name, description, created_at, data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        code,
        guildId,
        templateData.name,
        templateData.description || null,
        Date.now(),
        JSON.stringify(templateData),
      ],
    );

    return code;
  }

  // Get a template by code (GLOBAL - any server can access)
  async getTemplate(code) {
    const row = await get("SELECT * FROM templates WHERE code = ?", [code]);
    if (!row) return null;

    return {
      ...row,
      data: JSON.parse(row.data),
    };
  }

  // Get all templates created in a specific guild (for /templist)
  async getAllTemplates(guildId) {
    return await all(
      `SELECT code, name, description, created_at 
       FROM templates 
       WHERE guild_id = ?
       ORDER BY created_at DESC`,
      [guildId],
    );
  }

  // Delete a template by code (optional, can be added later)
  async deleteTemplate(code) {
    const result = await run("DELETE FROM templates WHERE code = ?", [code]);
    return result.changes > 0;
  }

  // Optional: Get total count of templates for a guild
  async getTemplateCount(guildId) {
    const row = await get(
      "SELECT COUNT(*) as count FROM templates WHERE guild_id = ?",
      [guildId],
    );
    return row.count;
  }
}

module.exports = new TemplateManager();
