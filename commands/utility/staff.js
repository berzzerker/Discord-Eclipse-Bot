const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Muestra el staff actual de Eclipse Studios.'),
    async execute(interaction) {
        const staffList = `
🌑 **Equipo Oficial de Eclipse Studios**
*El equipo que hace todo posible*

**Dueño del servidor**/🌘 **Eclipse Owner**
 <@731592242275418133> (berzzerker_)

🔨 **Admin General**
- por rellenar -

🔧 **Moderación**
- por rellenar -

⚙️ **Helper**
- por rellenar -

⚙️ **Event Host**
- por rellenar -
`;

        await interaction.reply({ content: staffList, ephemeral: true });
    },
};
