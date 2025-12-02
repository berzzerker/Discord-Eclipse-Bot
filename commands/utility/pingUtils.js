const { EmbedBuilder } = require('discord.js');

/**
 * Genera y envía el embed de ping.
 * @param {object} context - Objeto de contexto que puede ser una Interaction o un Message.
 * @param {number} latency - La latencia calculada del bot.
 */
async function sendPingEmbed(context, latency) {
    const pingEmbed = new EmbedBuilder()
        .setColor(0x1a1a1a) // Color oscuro para Eclipse Studios
        .setTitle('Ping del Bot 🌘') // Título más sutil
        .addFields(
            { name: 'Latencia del Bot', value: `${latency}ms`, inline: true },
            { name: 'Latencia de la API', value: `${Math.round(context.client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Eclipse Bot', iconURL: context.client.user.displayAvatarURL() });

    if (latency <= 150) { // Umbral para buen ping (150ms o menos)
        pingEmbed.setDescription('**Eclipse Studios ta ON FIRE 🔥**');
    } else {
        pingEmbed.setDescription('**Mmm.. Veo que hay problemas, pero nada que no se pueda arreglar 🔧**');
    }

    if (context.isChatInputCommand && context.isChatInputCommand()) {
        await context.editReply({ content: ' ', embeds: [pingEmbed], ephemeral: true });
    } else { // Es un comando legacy (message)
        await context.reply({ embeds: [pingEmbed] });
    }
}

module.exports = {
    sendPingEmbed
};