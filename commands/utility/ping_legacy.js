const { sendPingEmbed } = require('./pingUtils'); // Importa la función compartida

module.exports = {
    legacy: {
        name: 'ping',
        description: 'Responde con Pong! y muestra la latencia del bot (comando legacy).',
    },
    async execute(message, args) {
        const sent = await message.reply({ content: 'Pinging...', fetchReply: true });
        // Para comandos legacy, la latencia se calcula diferente, desde el mensaje original.
        const latency = sent.createdTimestamp - message.createdTimestamp;

        await sendPingEmbed(message, latency); // Usa la función compartida
    },
};
