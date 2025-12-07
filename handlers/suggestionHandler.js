const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readJSON, writeJSON } = require('../utils/jsonHandler');
const logger = require('../utils/logger');

// --- Helper Functions ---
// (Now using jsonHandler.js)
// ------------------------

async function handleSuggestionVote(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { customId, user } = interaction;
    const [action, suggestionId] = customId.split('_').slice(1); // suggestion_upvote_1 -> [upvote, 1]

    const suggestionsData = readJSON('suggestions.json');
    const suggestion = suggestionsData.suggestions[suggestionId];

    if (!suggestion) {
        return interaction.editReply({ content: '❌ Esta sugerencia ya no existe.' });
    }

    // --- Lógica de Voto ---
    const upvoters = suggestion.votes.up;
    const downvoters = suggestion.votes.down;
    const hasUpvoted = upvoters.includes(user.id);
    const hasDownvoted = downvoters.includes(user.id);

    let replyMessage = '';

    if (action === 'upvote') {
        if (hasUpvoted) {
            suggestion.votes.up = upvoters.filter(id => id !== user.id);
            replyMessage = '✅ Tu voto a favor ha sido retirado.';
        } else {
            if (hasDownvoted) {
                suggestion.votes.down = downvoters.filter(id => id !== user.id);
            }
            suggestion.votes.up.push(user.id);
            replyMessage = '✅ ¡Gracias por tu voto a favor!';
        }
    } else if (action === 'downvote') {
        if (hasDownvoted) {
            suggestion.votes.down = downvoters.filter(id => id !== user.id);
            replyMessage = '❌ Tu voto en contra ha sido retirado.';
        } else {
            if (hasUpvoted) {
                suggestion.votes.up = upvoters.filter(id => id !== user.id);
            }
            suggestion.votes.down.push(user.id);
            replyMessage = '❌ Tu voto en contra ha sido registrado.';
        }
    }

    // --- Actualizar Contadores y Porcentajes ---
    const totalVotes = suggestion.votes.up.length + suggestion.votes.down.length;
    const upPercentage = totalVotes > 0 ? Math.round((suggestion.votes.up.length / totalVotes) * 100) : 0;
    const downPercentage = totalVotes > 0 ? Math.round((suggestion.votes.down.length / totalVotes) * 100) : 0;
    
    // --- Actualizar Botones ---
    const newButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`suggestion_upvote_${suggestionId}`)
                .setLabel(`A Favor (${suggestion.votes.up.length}) - ${upPercentage}%`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId(`suggestion_downvote_${suggestionId}`)
                .setLabel(`En Contra (${suggestion.votes.down.length}) - ${downPercentage}%`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

    // --- Editar el mensaje original ---
    try {
        await interaction.message.edit({ components: [newButtons] });
        writeJSON('suggestions.json', suggestionsData); // Guardar solo si la edición del mensaje fue exitosa
        await interaction.editReply({ content: replyMessage });
    } catch (error) {
        logger.error("Error al editar la sugerencia:", error);
        await interaction.editReply({ content: '❌ Hubo un error al procesar tu voto. Por favor, inténtalo de nuevo.' });
    }
}

async function handleSuggestionAction(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { customId, user: staffUser } = interaction;
    const [_, action, suggestionId] = customId.split('_'); // suggestion_approve_1 or suggestion_reject_1

    const suggestionsData = readJSON('suggestions.json');
    const userSuggestionsData = readJSON('user_suggestions.json');
    const suggestion = suggestionsData.suggestions[suggestionId];

    if (!suggestion) {
        return interaction.editReply({ content: '❌ Esta sugerencia ya no existe.' });
    }

    if (suggestion.status !== 'pending') {
        return interaction.editReply({ content: `💡 Esta sugerencia ya ha sido **${suggestion.status}**.` });
    }

    const originalAuthorId = suggestion.authorId;
    let replyMessage = '';
    let userNotificationMessage = '';
    let newStatus = '';
    let embedColor;

    if (action === 'approve') {
        newStatus = 'aprobada';
        embedColor = 0x00FF00; // Green
        replyMessage = `✅ Sugerencia #${suggestionId} ha sido **aprobada** por ${staffUser.username}.`;
        userNotificationMessage = `🎉 ¡Tu sugerencia "**${suggestion.title}**" ha sido **APROBADA** por el Staff!`;
    } else if (action === 'reject') {
        newStatus = 'rechazada';
        embedColor = 0xFF0000; // Red
        replyMessage = `🚫 Sugerencia #${suggestionId} ha sido **rechazada** por ${staffUser.username}.`;
        userNotificationMessage = `😔 Lamentamos informarte que tu sugerencia "**${suggestion.title}**" ha sido **RECHAZADA** por el Staff.`;
    }

    // Update suggestion status
    suggestion.status = newStatus;
    suggestion.reviewedBy = staffUser.id;
    suggestion.reviewTimestamp = Date.now();
    writeJSON('suggestions.json', suggestionsData);

    // Decrement active suggestion count for the user
    if (userSuggestionsData[originalAuthorId] && userSuggestionsData[originalAuthorId].active > 0) {
        userSuggestionsData[originalAuthorId].active--;
        writeJSON('user_suggestions.json', userSuggestionsData);
    }

    // Notify original author
    try {
        const originalAuthor = await interaction.client.users.fetch(originalAuthorId);
        await originalAuthor.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Actualización de tu Sugerencia')
                    .setDescription(userNotificationMessage)
                    .addFields(
                        { name: 'Título', value: suggestion.title },
                        { name: 'Descripción', value: suggestion.description.substring(0, 1020) + (suggestion.description.length > 1020 ? '...' : '') },
                        { name: 'Estado', value: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) },
                        { name: 'Revisado por', value: `<@${staffUser.id}>` }
                    )
                    .setColor(embedColor)
                    .setTimestamp(suggestion.reviewTimestamp)
            ]
        });
        replyMessage += `\n✉️ Se ha notificado al autor original.`;
    } catch (error) {
        logger.error(`Error al notificar al autor ${originalAuthorId}:`, error);
        replyMessage += `\n⚠️ No se pudo notificar al autor original (posiblemente con DMs desactivados).`;
    }

    // Update the original suggestion message in the channel
    try {
        const suggestionChannel = interaction.client.channels.cache.get(suggestion.channelId);
        if (suggestionChannel && suggestion.messageId) {
            const originalSuggestionMessage = await suggestionChannel.messages.fetch(suggestion.messageId);
            const originalEmbed = EmbedBuilder.from(originalSuggestionMessage.embeds[0]);

            originalEmbed
                .spliceFields(1, 1, { name: 'Estado', value: newStatus.charAt(0).toUpperCase() + newStatus.slice(1), inline: true }) // Update status field
                .setFooter({ text: `Revisado por ${staffUser.username} el` })
                .setTimestamp(suggestion.reviewTimestamp)
                .setColor(embedColor);

            // Disable buttons
            const disabledComponents = originalSuggestionMessage.components.map(row => {
                return new ActionRowBuilder().addComponents(
                    row.components.map(button => ButtonBuilder.from(button).setDisabled(true))
                );
            });

            await originalSuggestionMessage.edit({ embeds: [originalEmbed], components: disabledComponents });
        }
    } catch (error) {
        logger.error('Error al actualizar el mensaje original de la sugerencia:', error);
        replyMessage += `\n⚠️ No se pudo actualizar el mensaje original de la sugerencia en el canal.`;
    }

    await interaction.editReply({ content: replyMessage });
}

module.exports = { handleSuggestionVote, handleSuggestionAction };
