const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { TICKET_LOG_CHANNEL_ID } = require('../config.js');

/**
 * Genera una transcripción de texto a partir de los mensajes de un canal.
 * @param {import('discord.js').TextChannel} channel El canal del cual generar la transcripción.
 * @returns {Promise<string>} Una cadena de texto con la transcripción.
 */
async function generateTranscript(channel) {
    let transcript = `--- Transcripción del Ticket #${channel.name} ---\n\n`;
    const messages = await channel.messages.fetch({ limit: 100 });
    
    // Invertir los mensajes para que estén en orden cronológico
    const orderedMessages = Array.from(messages.values()).reverse();

    orderedMessages.forEach(msg => {
        const timestamp = msg.createdAt.toLocaleString('es-ES', { timeZone: 'UTC' });
        transcript += `[${timestamp}] ${msg.author.tag}: ${msg.content}\n`;
        if (msg.attachments.size > 0) {
            msg.attachments.forEach(att => {
                transcript += `> Adjunto: ${att.url}\n`;
            });
        }
    });

    transcript += `\n--- Fin de la Transcripción ---`;
    return transcript;
}

/**
 * Registra el cierre de un ticket en el canal de logs.
 * @param {import('discord.js').Client} client El cliente del bot.
 * @param {import('discord.js').TextChannel} channel El canal del ticket que se cerró.
 * @param {import('discord.js').User} closerUser El usuario que inició el cierre.
 */
async function logTicketClosure(client, channel, closerUser) {
    try {
        const logChannel = await client.channels.fetch(TICKET_LOG_CHANNEL_ID);
        if (!logChannel || !logChannel.isTextBased()) {
            console.error('[Ticket Logging] No se encontró el canal de logs o no es un canal de texto.');
            return;
        }

        const transcriptContent = await generateTranscript(channel);
        const transcriptAttachment = new AttachmentBuilder(Buffer.from(transcriptContent), {
            name: `transcript-${channel.name}.txt`,
        });

        // Extraer el creador del ticket del topic
        let ticketCreator = 'No encontrado';
        const topic = channel.topic;
        if (topic && topic.includes('Ticket de')) {
            const userIdMatch = topic.match(/\((\d{17,19})\)/);
            if (userIdMatch && userIdMatch[1]) {
                ticketCreator = `<@${userIdMatch[1]}>`;
            }
        }

        const logEmbed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setTitle('Ticket Cerrado')
            .setAuthor({ name: 'Sistema de Logs de Tickets', iconURL: client.user.displayAvatarURL() })
            .addFields(
                { name: 'Ticket', value: `#${channel.name}`, inline: true },
                { name: 'Cerrado por', value: closerUser.tag, inline: true },
                { name: 'Creador del Ticket', value: ticketCreator, inline: true },
                { name: 'Fecha de Cierre', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            )
            .setTimestamp();

        await logChannel.send({
            embeds: [logEmbed],
            files: [transcriptAttachment],
        });

    } catch (error) {
        console.error('[Ticket Logging] Error al registrar el cierre del ticket:', error);
    }
}

module.exports = { logTicketClosure };
