const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendPingEmbed } = require('./pingUtils'); // Importa la función compartida

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde con Pong! y muestra la latencia del bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        await sendPingEmbed(interaction, latency); // Usa la función compartida
    },
};
