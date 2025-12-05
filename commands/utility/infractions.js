const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function getWarnings() {
    try {
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        console.error('Error al leer warnings.json:', error);
        return {};
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infractions')
        .setDescription('Muestra tu historial de advertencias en el servidor.'),

    async execute(interaction) {
        const targetUser = interaction.user;
        const warnings = getWarnings();
        const userWarnings = warnings[targetUser.id];

        if (!userWarnings || userWarnings.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x77DD77) // Verde
                .setTitle('✅ Sin Infracciones')
                .setDescription('¡Felicidades! No tienes ninguna advertencia en tu historial.')
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFCC00) // Amarillo
            .setTitle(`📜 Tu Historial de Advertencias (${userWarnings.length})`)
            .setDescription('A continuación se listan las advertencias que has recibido.');

        userWarnings.forEach(warn => {
            const warnTimestamp = new Date(warn.id);
            const formattedDate = `<t:${Math.floor(warnTimestamp.getTime() / 1000)}:f>`;
            embed.addFields({
                name: `Fecha: ${formattedDate}`,
                value: `**Razón:** ${warn.reason}`
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
