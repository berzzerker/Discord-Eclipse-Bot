const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readJSON, writeJSON } = require('../../utils/jsonHandler');

const COOLDOWN_MINUTES = 10;
const MAX_ACTIVE_SUGGESTIONS = 3;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerencia')
        .setDescription('Gestiona el sistema de sugerencias de Eclipse Studios.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('crear')
                .setDescription('Crea una nueva sugerencia para el servidor.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('gestionar')
                .setDescription('Gestiona una sugerencia existente (solo para Staff).')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('El ID de la sugerencia a gestionar.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'crear') {
            const userId = interaction.user.id;
            const userSuggestionsData = readJSON('user_suggestions.json');
            const userData = userSuggestionsData[userId] || { lastSuggestion: 0, active: 0 };
            const now = Date.now();

            // --- Verificación de Cooldown ---
            if (userData.lastSuggestion && (now - userData.lastSuggestion) < COOLDOWN_MINUTES * 60 * 1000) {
                const timeLeft = Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - (now - userData.lastSuggestion)) / 60000);
                return interaction.reply({
                    content: `⏳ Debes esperar **${timeLeft} minuto(s)** más antes de poder crear otra sugerencia.`,
                    ephemeral: true,
                });
            }

            // --- Verificación de Límite de Sugerencias Activas ---
            if (userData.active >= MAX_ACTIVE_SUGGESTIONS) {
                return interaction.reply({
                    content: `❌ Has alcanzado el límite de **${MAX_ACTIVE_SUGGESTIONS} sugerencias activas**. Espera a que una de las tuyas sea resuelta.`,
                    ephemeral: true,
                });
            }

            // --- Crear y Mostrar el Modal ---
            const modal = new ModalBuilder()
                .setCustomId('suggestion_create_modal')
                .setTitle('Nueva Sugerencia para Eclipse Studios');

            const titleInput = new TextInputBuilder()
                .setCustomId('suggestion_title')
                .setLabel("Título de la sugerencia")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ej: Añadir un nuevo bot de música')
                .setMaxLength(100)
                .setRequired(true);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('suggestion_description')
                .setLabel("Describe tu sugerencia en detalle")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explica claramente tu idea, por qué sería beneficiosa y cómo podría funcionar.')
                .setMaxLength(2000)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

            modal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(modal);
        }
        // Logic for 'gestionar'
        else if (subcommand === 'gestionar') {
            // Staff permission check (adjust roles/permissions as needed)
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    content: '❌ No tienes permisos para gestionar sugerencias.',
                    ephemeral: true,
                });
            }

            const suggestionId = interaction.options.getString('id');
            const suggestionsData = readJSON('suggestions.json');
            const suggestion = suggestionsData.suggestions[suggestionId];

            if (!suggestion) {
                return interaction.reply({
                    content: `❌ No se encontró ninguna sugerencia con el ID \`${suggestionId}\`.`,
                    ephemeral: true,
                });
            }

            const suggestionEmbed = new EmbedBuilder()
                .setTitle(`Sugerencia #${suggestionId}: ${suggestion.title}`)
                .setDescription(suggestion.description)
                .addFields(
                    { name: 'Autor', value: `<@${suggestion.authorId}>`, inline: true },
                    { name: 'Estado', value: suggestion.status, inline: true },
                    { name: 'Votos a Favor', value: suggestion.votes.up.length.toString(), inline: true },
                    { name: 'Votos en Contra', value: suggestion.votes.down.length.toString(), inline: true }
                )
                .setTimestamp(new Date(suggestion.timestamp))
                .setColor(0x0099FF);

            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`suggestion_approve_${suggestionId}`)
                        .setLabel('Aprobar')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`suggestion_reject_${suggestionId}`)
                        .setLabel('Rechazar')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({
                embeds: [suggestionEmbed],
                components: [actionRow],
                ephemeral: true, // Only staff can see this management message
            });
        }
    },
};
