const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Abre el panel para la autogestión de roles de Eclipse Studios.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a) // Color negro #1a1a1a
            .setTitle('🎭 Sistema de Roles | Eclipse Studios 🌘')
            .setDescription('Bienvenido al sistema de autogestión de roles de Eclipse Studios. Utiliza los botones a continuación para seleccionar la categoría de roles que te interesa. ¡Recuerda que puedes cambiar tus roles en cualquier momento!\n\n**Selecciona una opción:**');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('roles_divisiones_button')
                    .setLabel('Divisiones')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('roles_habilidades_button') // CAMBIO: CustomId actualizado
                    .setLabel('Habilidades / Conocimientos') // CAMBIO: Label actualizado
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('roles_premium_button')
                    .setLabel('Estéticos premium')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('roles_notificaciones_button')
                    .setLabel('Notificaciones')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true // Solo visible para el usuario que ejecuta el comando
        });
    },
};
