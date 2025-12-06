const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const LOG_CHANNEL_ID = '1444252751293976646'; // Canal de logs

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor. Puede volver a unirse.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a expulsar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón de la expulsión.')
                .setRequired(true)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon');
        const staffMember = interaction.member;

        await interaction.deferReply();

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // --- Validaciones ---
        if (!targetMember) {
            return interaction.editReply({ content: '❌ No se pudo encontrar al usuario en este servidor.', ephemeral: true });
        }
        if (targetUser.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ No puedes expulsarte a ti mismo.', ephemeral: true });
        }
        if (targetMember.roles.highest.position >= staffMember.roles.highest.position) {
            return interaction.editReply({ content: '❌ No puedes expulsar a un miembro con un rol igual o superior al tuyo.', ephemeral: true });
        }
        if (!targetMember.kickable) {
            return interaction.editReply({ content: '❌ No puedo expulsar a este usuario. Es posible que tenga un rol superior al mío o que me falten permisos.', ephemeral: true });
        }

        // --- Notificar al usuario por DM ---
        const kickTimestamp = new Date();
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF8C00) // Naranja oscuro
                .setTitle(`Has sido expulsado de ${interaction.guild.name}`)
                .addFields(
                    { name: 'Razón', value: reason },
                    { name: 'Fecha', value: `<t:${Math.floor(kickTimestamp.getTime() / 1000)}:f>` }
                )
                .setFooter({ text: 'Nota: Una expulsión no es un baneo, puedes volver a unirte si tienes una invitación.' })
                .setTimestamp();
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`No se pudo enviar DM de expulsión a ${targetUser.tag}.`);
        }

        // --- Expulsar al miembro ---
        try {
            await targetMember.kick(reason);
        } catch (error) {
            console.error('Error al expulsar:', error);
            return interaction.editReply({ content: `❌ Ocurrió un error inesperado al intentar expulsar al usuario.` });
        }
        
        // --- Enviar a Canal de Logs ---
        const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0xFF8C00)
                .setTitle('👢 Usuario Expulsado')
                .addFields(
                    { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})` },
                    { name: '🛠 Moderador', value: `${staffMember.user} (${staffMember.user.tag})` },
                    { name: '📄 Razón', value: reason },
                    { name: '⏰ Fecha', value: `<t:${Math.floor(kickTimestamp.getTime() / 1000)}:f>` }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }

        // --- Confirmar acción ---
        await interaction.editReply({ content: `✅ **${targetUser.tag}** ha sido expulsado del servidor.` });
    },
};
