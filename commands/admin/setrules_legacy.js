const { PermissionFlagsBits } = require('discord.js');
const { getRulesEmbed } = require('./rulesUtils');

module.exports = {
    legacy: {
        name: 'setrules',
        description: 'Publica el embed con las reglas del servidor (comando legacy). Uso: !setrules [#canal_destino]',
    },
    async execute(message, args) {
        // Verificar permisos del usuario
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('⛔ No tienes permisos de administrador para usar este comando.');
        }

        let targetChannel = message.channel; // Por defecto, el canal actual

        // Si se especifica un canal en los argumentos
        if (args.length > 0) {
            const channelMention = args[0];
            const channelId = channelMention.replace(/<#|>/g, ''); // Extraer solo el ID
            const fetchedChannel = await message.guild.channels.fetch(channelId);

            if (fetchedChannel && fetchedChannel.type === 0 || fetchedChannel.type === 5) { // 0 es GUILD_TEXT, 5 es GUILD_NEWS
                targetChannel = fetchedChannel;
            } else {
                return message.reply('❌ No se pudo encontrar el canal especificado o no es un canal de texto/anuncios válido.');
            }
        }

        // Verificar permisos del bot en el canal de destino
        if (!targetChannel.permissionsFor(message.client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
            return message.reply(`❌ No tengo permisos para enviar mensajes y/o embeds en ${targetChannel}.`);
        }

        const rulesEmbed = getRulesEmbed();

        try {
            await targetChannel.send({ embeds: [rulesEmbed] });
            if (targetChannel.id !== message.channel.id) {
                await message.reply(`✅ ¡El reglamento de Eclipse Studios ha sido publicado en ${targetChannel}!`);
            } else {
                await message.delete(); // Eliminar el mensaje del comando si se publicó en el mismo canal
            }
        } catch (error) {
            console.error('Error al publicar el embed de reglas:', error);
            await message.reply('❌ Hubo un error al intentar publicar el reglamento. Asegúrate de que el bot tenga los permisos correctos.');
        }
    },
};
