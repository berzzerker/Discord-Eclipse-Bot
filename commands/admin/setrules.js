const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getRulesEmbed } = require('./rulesUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setrules')
        .setDescription('Publica el embed con las reglas del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo administradores pueden usar este comando
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('El canal donde se publicarán las reglas. Por defecto, el canal actual.')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement) // Solo canales de texto y anuncios
                .setRequired(false)),
    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('canal') || interaction.channel;

        // Verificar permisos del bot en el canal de destino
        if (!targetChannel.permissionsFor(interaction.client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
            return interaction.reply({ 
                content: `❌ No tengo permisos para enviar mensajes y/o embeds en ${targetChannel}.`, 
                ephemeral: true 
            });
        }

        const rulesEmbed = getRulesEmbed();

        try {
            await targetChannel.send({ embeds: [rulesEmbed] });
            await interaction.reply({ 
                content: `✅ ¡El reglamento de Eclipse Studios ha sido publicado en ${targetChannel}!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error al publicar el embed de reglas:', error);
            await interaction.reply({ 
                content: '❌ Hubo un error al intentar publicar el reglamento. Asegúrate de que el bot tenga los permisos correctos.', 
                ephemeral: true 
            });
        }
    },
};
