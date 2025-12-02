const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const CONFIRM_ID = 'nuke_confirm';
const CANCEL_ID = 'nuke_cancel';
const TIMEOUT_DURATION = 30 * 1000; // 30 segundos

async function handleNukeCommand(context, countToDelete, type = 'slash') {
    const channel = context.channel;
    const author = context.member || context.author; // Member para Interactions, Author para Messages

    // 1. Verificar permisos del usuario
    if (!author.permissions.has(PermissionFlagsBits.ManageMessages)) {
        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setDescription('⛔ No tienes permisos para eliminar mensajes (Gestionar mensajes).');
        if (type === 'slash') {
            return context.reply({ embeds: [embed], ephemeral: true });
        } else {
            return context.reply({ embeds: [embed] });
        }
    }

    // 2. Verificar permisos del bot
    if (!channel.permissionsFor(context.client.user).has(PermissionFlagsBits.ManageMessages)) {
        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setDescription('❌ No tengo permisos para eliminar mensajes en este canal. Necesito "Gestionar mensajes".');
        if (type === 'slash') {
            return context.reply({ embeds: [embed], ephemeral: true });
        } else {
            return context.reply({ embeds: [embed] });
        }
    }

    // 3. Preparar mensaje de confirmación
    const confirmationEmbed = new EmbedBuilder()
        .setColor(0x1a1a1a)
        .setTitle('🚨 Confirmación de Nuke 🌘')
        .setDescription(`¿Estás seguro de que quieres eliminar **${countToDelete === 'all' ? 'todos los mensajes posibles (hasta 99)' : countToDelete}** mensajes en este canal?`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(CONFIRM_ID)
                .setLabel('✅ Confirmar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(CANCEL_ID)
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Secondary),
        );

    const replyOptions = { embeds: [confirmationEmbed], components: [row], ephemeral: true };
    let confirmationMessage;

    if (type === 'slash') {
        await context.reply(replyOptions);
        confirmationMessage = await context.fetchReply();
    } else {
        confirmationMessage = await context.reply(replyOptions);
    }

    // 4. Esperar la interacción del botón
    const collector = channel.createMessageComponentCollector({
        filter: i => i.user.id === author.id,
        time: TIMEOUT_DURATION,
        max: 1 // Solo necesitamos una respuesta (confirmar o cancelar)
    });

    collector.on('collect', async i => {
        if (i.customId === CONFIRM_ID) {
            await i.update({ components: [] }); // Eliminar botones
            try {
                let deletedCount = 0;
                if (countToDelete === 'all') {
                    // Fetch up to 99 messages that are not older than 14 days
                    const fetched = await channel.messages.fetch({ limit: 99 });
                    const deletable = fetched.filter(msg => Date.now() - msg.createdTimestamp < 1209600000); // 14 days in ms
                    if (deletable.size > 0) {
                        await channel.bulkDelete(deletable, true);
                        deletedCount = deletable.size;
                    }
                } else {
                    // Fetch messages up to the requested count, then filter by 14 days (bulkDelete limit)
                    const fetched = await channel.messages.fetch({ limit: countToDelete });
                    const deletable = fetched.filter(msg => Date.now() - msg.createdTimestamp < 1209600000);
                    if (deletable.size > 0) {
                        await channel.bulkDelete(deletable, true);
                        deletedCount = deletable.size;
                    }
                }

                const resultEmbed = new EmbedBuilder()
                    .setColor(0x1a1a1a)
                    .setTitle('🗑️ Nuke Ejecutado 🌙')
                    .setDescription(`Se han eliminado **${deletedCount}** mensajes en este canal.`);

                await i.followUp({ embeds: [resultEmbed], ephemeral: true });
                // Eliminar el mensaje de confirmación original si no fue ephemeral para evitar spam
                if (type === 'legacy' && !confirmationMessage.ephemeral) {
                    try { await confirmationMessage.delete(); } catch {}
                }

            } catch (error) {
                console.error("Error al eliminar mensajes:", error);
                const errorEmbed = new EmbedBuilder()
                    .setColor(0x1a1a1a)
                    .setTitle('❌ Error al Ejecutar Nuke')
                    .setDescription('Hubo un problema al intentar eliminar los mensajes. Asegúrate de que los mensajes no sean demasiado antiguos (más de 14 días) o que el bot tenga los permisos correctos.');
                await i.followUp({ embeds: [errorEmbed], ephemeral: true });
            }
        } else if (i.customId === CANCEL_ID) {
            await i.update({ components: [] }); // Eliminar botones
            const cancelEmbed = new EmbedBuilder()
                .setColor(0x1a1a1a)
                .setDescription('🚫 Nuke cancelado. No se eliminaron mensajes.');
            await i.followUp({ embeds: [cancelEmbed], ephemeral: true });
            if (type === 'legacy' && !confirmationMessage.ephemeral) {
                try { await confirmationMessage.delete(); } catch {}
            }
        }
    });

    collector.on('end', async collected => {
        if (collected.size === 0) {
            // No hubo respuesta dentro del tiempo límite
            if (confirmationMessage && !confirmationMessage.deleted) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0x1a1a1a)
                    .setDescription('⏳ Tiempo agotado. Nuke cancelado automáticamente.');
                try {
                    await confirmationMessage.edit({ embeds: [timeoutEmbed], components: [] });
                } catch (err) {
                    console.error("Error al editar mensaje de confirmación por timeout:", err);
                }
            }
        }
    });
}

module.exports = {
    handleNukeCommand,
};