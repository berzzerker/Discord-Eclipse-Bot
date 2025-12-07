const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const { logTicketClosure } = require('../../utils/ticket-logging.js');
const logger = require('../../utils/logger.js');
const { TICKET_LOG_CHANNEL_ID, TICKET_CATEGORY_ID } = require('../../config.js');

// --- Configuración ---
// ¡IMPORTANTE! Reemplaza estos IDs con los de tu servidor.
const STAFF_ROLE_ID = '1444386198121349311';
// --------------------

// Objeto para almacenar los detalles de cada panel de tickets
const ticketPanels = {
    general: {
        customId: 'ticket_open_general',
        label: 'Abrir Ticket',
        style: ButtonStyle.Secondary,
        title: '#🎫﹥tickets-general',
        description: 'Si necesitas ayuda con un problema en el servidor, el chat, dudas, reportes o cualquier cosa, abre un ticket y el staff te ayudará lo más rápido posible.'
    },
    staff: {
        customId: 'ticket_open_staff',
        label: 'Iniciar Entrevista',
        style: ButtonStyle.Success,
        title: '#⚖️﹥reclutamiento-staff',
        description: '¿Quieres formar parte del equipo de staff? Prepárate bien antes de abrir este ticket, porque al hacerlo iniciarás una entrevista formal. Si pasas, entras al staff. Si no, GG. Ven con mentalidad de tiburón.'
    },
    roblox: {
        customId: 'ticket_open_roblox',
        label: 'Iniciar Entrevista',
        style: ButtonStyle.Primary,
        title: '#🔨﹥reclutamiento-roblox',
        description: '¿Quieres entrar al equipo oficial de desarrollo Roblox de Eclipse Studios? Al abrir este ticket comenzarás una entrevista técnica y de actitud. Si pasas, formarás parte del estudio como desarrollador oficial. Ven preparado.'
    },
    events: {
        customId: 'ticket_open_events',
        label: 'Iniciar Entrevista',
        style: ButtonStyle.Primary,
        title: '#🛠️﹥reclutamiento-events',
        description: '¿Quieres ser parte del equipo que crea los eventos más épicos de Minecraft en hispanohablante? Al abrir este ticket iniciarás una entrevista para Event Host / Event Helper. Si convences, serás parte del equipo oficial de eventos.'
    },
    indie: {
        customId: 'ticket_open_indie',
        label: 'Iniciar Entrevista',
        style: ButtonStyle.Primary,
        title: '#🎨﹥reclutamiento-indie',
        description: '¿Quieres desarrollar juegos indie profesionales con Eclipse Studios? Al abrir este ticket comenzarás una entrevista técnica y creativa. Si pasas, formarás parte del equipo oficial de desarrollo indie (Unity, Godot, Unreal…). Ven con portfolio y ganas de crear.'
    }
};

// --- LÓGICA DE CIERRE DE TICKET ---
async function startTicketClosure(interaction, client) {
    const { channel, member, user: closerUser } = interaction;

    if (channel.parentId !== TICKET_CATEGORY_ID) {
        return interaction.reply({ content: '❌ Este comando solo puede usarse en un canal de ticket.', ephemeral: true });
    }
    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ No tienes permisos para cerrar este ticket.', ephemeral: true });
    }
    if (client.closingTickets.has(channel.id)) {
        return interaction.reply({ content: 'Este ticket ya está en proceso de cierre.', ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_close_cancel')
            .setLabel('Cancelar Cierre')
            .setStyle(ButtonStyle.Secondary)
    );

    const closeMsg = await channel.send({
        content: `⚠️ Ticket marcado para cierre por ${interaction.user}. Este canal se eliminará en 10 segundos...`,
        components: [row]
    });

    const timeoutId = setTimeout(async () => {
        client.closingTickets.delete(channel.id);

        // --- LOGGING Y TRANSCRIPCIÓN ---
        await logTicketClosure(client, channel, closerUser);

        const topic = channel.topic;
        if (topic && topic.includes('Ticket de')) {
            const userIdMatch = topic.match(/\((\d{17,19})\)/);
            if (userIdMatch && userIdMatch[1]) {
                const userId = userIdMatch[1];
                client.openTickets.delete(userId);
                logger.info(`[Ticket System] Usuario ${userId} eliminado de la lista de tickets abiertos.`);
            }
        }

        await channel.delete('Cierre de ticket completado.');

    }, 10000); // 10 segundos

    client.closingTickets.set(channel.id, { timeoutId, closeMsgId: closeMsg.id });
    await interaction.reply({ content: '¡El proceso de cierre ha comenzado!', ephemeral: true });
}

async function handleTicketButton(interaction, client) {
    const { customId, channel } = interaction;

    if (customId === 'ticket_close_start') {
        await startTicketClosure(interaction, client);
    } else if (customId === 'ticket_close_cancel') {
        const closingInfo = client.closingTickets.get(channel.id);
        if (closingInfo) {
            clearTimeout(closingInfo.timeoutId);
            client.closingTickets.delete(channel.id);
            await channel.messages.delete(closingInfo.closeMsgId).catch(error => logger.error('Error eliminando mensaje de cierre de ticket', error));
            await interaction.reply({ content: '✅ Cierre de ticket cancelado.', ephemeral: true });
        }
    }
}


module.exports = {
    STAFF_ROLE_ID,
    TICKET_CATEGORY_ID,
    TICKET_LOG_CHANNEL_ID,
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Comandos para el sistema de tickets.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels) // Cambiado a ManageChannels para coherencia
        .addSubcommand(subcommand =>
            subcommand
                .setName('channelsetup')
                .setDescription('Configura un panel para abrir tickets en un canal específico.')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('El canal donde se enviará el panel de tickets.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('tipo')
                        .setDescription('El tipo de panel de tickets a configurar.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Soporte General', value: 'general' },
                            { name: 'Reclutamiento Staff', value: 'staff' },
                            { name: 'Reclutamiento Roblox', value: 'roblox' },
                            { name: 'Reclutamiento Eventos', value: 'events' },
                            { name: 'Reclutamiento Indie', value: 'indie' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Inicia el proceso para cerrar el ticket actual.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Añade un usuario a este ticket.')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('El usuario a añadir.')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Quita un usuario de este ticket.')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('El usuario a quitar.')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('Renombra el ticket actual.')
                .addStringOption(option =>
                    option.setName('nuevo_nombre')
                        .setDescription('El nuevo nombre para el canal del ticket.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        const { client } = interaction;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'channelsetup') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: '❌ Solo los administradores pueden usar este comando.', ephemeral: true });
            }
            const targetChannel = interaction.options.getChannel('canal');
            const ticketType = interaction.options.getString('tipo');
            const panelInfo = ticketPanels[ticketType];

            if (!panelInfo) {
                return interaction.reply({ content: '❌ Tipo de panel no válido.', ephemeral: true });
            }

            if (!targetChannel.permissionsFor(interaction.client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ViewChannel])) {
                return interaction.reply({ content: `❌ No tengo permisos para ver o enviar mensajes y embeds en ${targetChannel}.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(0x1a1a1a)
                .setTitle(panelInfo.title)
                .setDescription(panelInfo.description);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(panelInfo.customId)
                        .setLabel(panelInfo.label)
                        .setStyle(panelInfo.style)
                        .setEmoji('🎫')
                );

            try {
                await targetChannel.send({ embeds: [embed], components: [row] });
                await interaction.reply({
                    content: `✅ El panel de tickets de "${panelInfo.title}" ha sido configurado en ${targetChannel}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error al configurar el panel de tickets:', error);
                await interaction.reply({ content: '❌ Hubo un error al enviar el mensaje al canal seleccionado.', ephemeral: true });
            }
        } else if (subcommand === 'close') {
            await startTicketClosure(interaction, client);
        }
    },
    handleButton: handleTicketButton,
};
