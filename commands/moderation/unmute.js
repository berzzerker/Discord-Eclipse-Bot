const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const mutesFilePath = path.join(__dirname, '..', '..', 'data', 'mutes.json');
const LOG_CHANNEL_ID = '1444252751293976646'; // Canal de logs

// --- Helper Functions ---
function getMutes() {
    try {
        const data = fs.readFileSync(mutesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        console.error('Error al leer mutes.json:', error);
        return {};
    }
}

function saveMutes(data) {
    try {
        fs.writeFileSync(mutesFilePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('Error al guardar en mutes.json:', error);
    }
}
// ------------------------

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Quita manualmente el mute a un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a desmutear.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón para quitar el mute.')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó una razón.';
        const staffMember = interaction.member;
        
        await interaction.deferReply();

        const mutes = getMutes();
        const muteInfo = mutes[targetUser.id];

        if (!muteInfo) {
            return interaction.editReply({ content: `❌ El usuario **${targetUser.tag}** no se encuentra muteado.`, ephemeral: true });
        }

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) {
            // Si el usuario no está en el servidor, simplemente limpiamos el registro
            delete mutes[targetUser.id];
            saveMutes(mutes);
            return interaction.editReply({ content: `✅ El usuario no estaba en el servidor. Se ha limpiado su registro de mute.`, ephemeral: false });
        }

        try {
            await targetMember.roles.remove(muteInfo.roleId, `Unmute por ${staffMember.user.tag}: ${reason}`);
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: `❌ Hubo un error al intentar quitar el rol de mute. Verifica los permisos.`, ephemeral: true });
        }

        // Limpiar del registro
        delete mutes[targetUser.id];
        saveMutes(mutes);

        // --- Enviar a Canal de Logs ---
        const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0x77DD77) // Verde claro
                .setTitle('🔊 Usuario Desmuteado')
                .addFields(
                    { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})`, inline: true },
                    { name: '🛠 Moderador', value: `${staffMember}`, inline: true },
                    { name: '📄 Razón', value: reason }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
        
        // Enviar DM
        try {
            await targetUser.send(`Has sido desmuteado en **${interaction.guild.name}** por un moderador.`);
        } catch (error) {
            console.log(`No se pudo enviar DM a ${targetUser.tag}.`);
        }

        await interaction.editReply({ content: `✅ **${targetUser.tag}** ha sido desmuteado manualmente.`, ephemeral: false });
    },
};
