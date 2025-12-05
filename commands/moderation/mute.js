const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms'); // Usaremos la librería 'ms' para parsear la duración

// --- CONFIGURACIÓN ---
const MUTE_ROLES = {
    chat: '1444946266231672904',
    voice: '1446594613425999975',
    global: '1446594460216459344',
};
const LOG_CHANNEL_ID = '1444252751293976646';
const mutesFilePath = path.join(__dirname, '..', '..', 'data', 'mutes.json');
// --------------------

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
        .setName('mute')
        .setDescription('Aplica un mute a un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a mutear.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('modo')
                .setDescription('El tipo de mute a aplicar.')
                .setRequired(true)
                .addChoices(
                    { name: 'Chat (No puede escribir)', value: 'chat' },
                    { name: 'Voz (No puede hablar)', value: 'voice' },
                    { name: 'Global (Chat y Voz)', value: 'global' }
                ))
        .addStringOption(option =>
            option.setName('duracion')
                .setDescription('Duración del mute (e.g., 10m, 1h, 7d). "Permanente" por defecto.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón del muteo.')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const muteType = interaction.options.getString('modo');
        const durationString = interaction.options.getString('duracion');
        const reason = interaction.options.getString('razon') || 'No se especificó una razón.';
        const staffMember = interaction.member;

        // --- Validaciones ---
        if (targetUser.id === staffMember.id) {
            return interaction.reply({ content: '❌ No puedes mutearte a ti mismo.', ephemeral: true });
        }
        if (targetUser.bot) {
            return interaction.reply({ content: '❌ No puedes mutear a un bot.', ephemeral: true });
        }
        
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) {
            return interaction.reply({ content: '❌ El usuario no se encuentra en el servidor.', ephemeral: true });
        }
        if (targetMember.roles.highest.position >= staffMember.roles.highest.position) {
             return interaction.reply({ content: '❌ No puedes mutear a un usuario con un rol igual or superior al tuyo.', ephemeral: true });
        }

        await interaction.deferReply();
        
        const muteRoleId = MUTE_ROLES[muteType];
        const durationMs = durationString ? ms(durationString) : null;
        const unmuteAt = durationMs ? new Date(Date.now() + durationMs) : null;

        if (durationString && !durationMs) {
            return interaction.editReply({ content: '❌ Formato de duración inválido. Usa (s, m, h, d). Ejemplo: `10m`, `2h`, `7d`.', ephemeral: true });
        }

        // --- Aplicar Mute ---
        try {
            await targetMember.roles.add(muteRoleId, `Muteado por ${staffMember.user.tag}: ${reason}`);
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: `❌ Hubo un error al intentar aplicar el rol de mute. Verifica que mi rol esté por encima del rol de mute y del rol del usuario.`, ephemeral: true });
        }

        // --- Guardar en Log ---
        const mutes = getMutes();
        mutes[targetUser.id] = {
            guildId: interaction.guild.id,
            roleId: muteRoleId,
            unmuteAt: unmuteAt ? unmuteAt.toISOString() : null,
            staffId: staffMember.id,
            reason: reason
        };
        saveMutes(mutes);

        // --- Enviar DM al usuario ---
        const durationForUser = unmuteAt ? `<t:${Math.floor(unmuteAt.getTime() / 1000)}:R>` : 'Permanente';
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFCC00)
                .setTitle(`Has sido muteado en ${interaction.guild.name}`)
                .addFields(
                    { name: 'Tipo de Mute', value: muteType.charAt(0).toUpperCase() + muteType.slice(1) },
                    { name: 'Duración', value: durationForUser },
                    { name: 'Razón', value: reason }
                )
                .setTimestamp()
                .setFooter({ text: 'Puedes contactar a un administrador si crees que es un error.' });
            await targetUser.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`No se pudo enviar DM a ${targetUser.tag}.`);
        }

        // --- Enviar a Canal de Logs ---
        const durationForLog = durationMs ? ms(durationMs, { long: true }) : 'Permanente';
        const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(0xCCCCCC)
                .setTitle('🔇 Usuario Muteado')
                .addFields(
                    { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})`, inline: true },
                    { name: '🛠 Moderador', value: `${staffMember}`, inline: true },
                    { name: '⏳ Duración', value: durationForLog },
                    { name: '📄 Razón', value: reason },
                    { name: '🔩 Tipo', value: muteType.charAt(0).toUpperCase() + muteType.slice(1), inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }

        // --- Confirmar en canal ---
        await interaction.editReply({ content: `✅ **${targetUser.tag}** ha sido muteado. Duración: **${durationForLog}**.`, ephemeral: false });
    },
};
