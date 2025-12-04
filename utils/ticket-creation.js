const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Importar la configuración desde el comando de ticket.
// Ahora la exportación está corregida y esto funcionará.
const { STAFF_ROLE_ID, TICKET_CATEGORY_ID } = require('../commands/tickets/ticket.js');

const countersFilePath = path.join(__dirname, '..', 'data', 'ticketCounters.json');

// Esta función se encargará de toda la lógica de creación de canales.
async function createTicketChannel(interaction, ticketType, reason) {
    const { guild, user } = interaction;

    // --- Lógica de Nomenclatura y Contadores ---
    let channelName;
    let topic = `Ticket de ${user.tag} (${user.id}). Tipo: ${ticketType}.`;
    if (reason) {
        topic += ` Motivo: ${reason}`;
    }

    if (ticketType === 'general') {
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        channelName = `ticket-${randomDigits}`;
    } else {
        try {
            // Usamos la versión síncrona para simplicidad en este flujo.
            // Para un bot a gran escala, se podría refactorizar a async/await con fs.promises.
            const counters = JSON.parse(fs.readFileSync(countersFilePath, 'utf-8'));
            const newCount = (counters[ticketType] || 0) + 1;
            counters[ticketType] = newCount;
            fs.writeFileSync(countersFilePath, JSON.stringify(counters, null, 2));
            
            const formattedCount = String(newCount).padStart(3, '0');
            channelName = `entrevista-${ticketType}-${formattedCount}`;
        } catch (error) {
            console.error('Error al leer/escribir el contador de tickets:', error);
            await interaction.followUp({ content: '❌ Hubo un error interno al generar el número de ticket. Por favor, contacta a un administrador.', ephemeral: true });
            return null;
        }
    }

    // --- Creación del Canal ---
    try {
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: topic,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles],
                },
                {
                    id: STAFF_ROLE_ID,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels],
                },
            ],
        });

        // --- Mensaje de Bienvenida con Botones ---
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setTitle(`Bienvenido a tu ticket, ${user.username}`)
            .setDescription(reason ? `**Motivo:**\n${reason}` : 'El staff te atenderá en breve.')
            .setFooter({ text: `Eclipse Studios | Ticket System` })
            .setTimestamp();

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close_start')
                    .setLabel('Cerrar')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Reclamar')
                    .setEmoji('👑')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_add_user')
                    .setLabel('Añadir')
                    .setEmoji('➕')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_remove_user')
                    .setLabel('Quitar')
                    .setEmoji('➖')
                    .setStyle(ButtonStyle.Secondary)
            );
            
        await channel.send({ 
            content: `<@&${STAFF_ROLE_ID}>, <@${user.id}> ha abierto un nuevo ticket.`, 
            embeds: [welcomeEmbed],
            components: [actionRow] 
        });
        
        return channel;

    } catch (error) {
        console.error(`Error al crear el canal del ticket:`, error);
        await interaction.followUp({ content: '❌ Hubo un error al crear tu canal de ticket. Asegúrate de que el bot tenga permisos de "Gestionar Canales" y que la categoría de tickets exista.', ephemeral: true });
        return null;
    }
}

module.exports = { createTicketChannel };
