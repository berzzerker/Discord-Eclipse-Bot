const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'roles',
    description: 'Abre el panel para la autogestión de roles de Eclipse Studios.',
    // La ejecución para comandos legacy (prefijo) usa el objeto 'message' en lugar de 'interaction'
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a) // Color negro #1a1a1a
            .setTitle('Sistema de Roles | Eclipse Studios')
            .setDescription('Bienvenido al sistema de autogestión de roles de Eclipse Studios. Utiliza los botones a continuación para seleccionar la categoría de roles que te interesa. ¡Recuerda que puedes cambiar tus roles en cualquier momento!\n\n**Selecciona una opción:**');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('roles_divisiones_button')
                    .setLabel('Divisiones')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('roles_habilidades_button')
                    .setLabel('Habilidades / Conocimientos')
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

        // Los comandos de prefijo usan message.reply() o message.channel.send()
        // La opción 'ephemeral' no está disponible aquí.
        await message.reply({
            embeds: [embed],
            components: [row],
        });
    },
};
