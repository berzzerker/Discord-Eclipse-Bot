const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde con Pong! y muestra la latencia del bot.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        const pingEmbed = new EmbedBuilder()
            .setColor(0x1a1a1a) // Color oscuro para Eclipse Studios
            .setTitle('🌌 Pong! 🚀')
            .setDescription(`Latencia del bot: **${latency}ms**\nLatencia de la API: **${Math.round(interaction.client.ws.ping)}ms**`)
            .setTimestamp()
            .setFooter({ text: 'Eclipse Bot', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.editReply({ content: ' ', embeds: [pingEmbed], ephemeral: true });
    },
};
