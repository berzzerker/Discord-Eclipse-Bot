const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '..', '..', 'data', 'warnings.json');
const LOG_CHANNEL_ID = '1444252751293976646'; // Canal de logs de bots

// --- Helper Functions ---
function getWarnings() {
    try {
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        console.error('Error al leer warnings.json:', error);
        return {};
    }
}

function saveWarnings(data) {
    try {
        fs.writeFileSync(warningsFilePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('Error al guardar en warnings.json:', error);
    }
}
// ------------------------

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Gestiona las advertencias de los usuarios.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Añade una advertencia a un usuario.')
                .addUserOption(option => option.setName('usuario').setDescription('El usuario a advertir.').setRequired(true))
                .addStringOption(option => option.setName('razon').setDescription('La razón de la advertencia.').setRequired(true))
                .addAttachmentOption(option => option.setName('prueba').setDescription('Una imagen o archivo como prueba de la infracción.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Quita una advertencia específica de un usuario.')
                .addUserOption(option => option.setName('usuario').setDescription('El usuario al que se le quitará la advertencia.').setRequired(true))
                .addStringOption(option => option.setName('warn_id').setDescription('El ID de la advertencia a quitar (es la fecha y hora).').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Limpia todas las advertencias de un usuario.')
                .addUserOption(option => option.setName('usuario').setDescription('El usuario al que se le limpiarán las advertencias.').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            await handleAddWarning(interaction);
        } else if (subcommand === 'remove') {
            await handleRemoveWarning(interaction);
        } else if (subcommand === 'clear') {
            await handleClearWarnings(interaction);
        }
    },
};

async function handleAddWarning(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon');
    const proof = interaction.options.getAttachment('prueba');
    const staffMember = interaction.user;

    if (targetUser.id === staffMember.id) {
        return interaction.reply({ content: '❌ No puedes advertirte a ti mismo.', ephemeral: true });
    }
    if (targetUser.bot) {
        return interaction.reply({ content: '❌ No puedes advertir a un bot.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const warnings = getWarnings();
    if (!warnings[targetUser.id]) {
        warnings[targetUser.id] = [];
    }

    const newWarning = {
        id: new Date().toISOString(),
        staffId: staffMember.id,
        reason: reason,
        proofURL: proof ? proof.url : null,
    };

    warnings[targetUser.id].push(newWarning);
    const warningCount = warnings[targetUser.id].length;
    saveWarnings(warnings);

    // --- Notificar por DM ---
    try {
        const dmEmbed = new EmbedBuilder()
            .setColor(0xFFCC00)
            .setTitle('Has recibido una advertencia')
            .setDescription(`Has sido advertido en **${interaction.guild.name}**.`)
            .addFields(
                { name: 'Razón', value: reason },
                { name: 'Número de advertencias', value: `${warningCount} de 3` }
            )
            .setTimestamp();
        if (proof) {
            dmEmbed.setImage(proof.url);
        }
        await targetUser.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.log(`No se pudo enviar DM de advertencia a ${targetUser.tag}.`);
    }

    // --- Enviar a Canal de Logs ---
    const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠ Advertencia aplicada')
            .addFields(
                { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})`},
                { name: '🛠 Moderador', value: `${staffMember} (${staffMember.tag})`},
                { name: '📄 Razón', value: reason }
            )
            .setTimestamp();
        if (proof) {
            logEmbed.addFields({ name: '🔗 Prueba', value: `[Ver Archivo](${proof.url})` });
            if (proof.contentType.startsWith('image/')) {
                 logEmbed.setImage(proof.url);
            }
        }
        await logChannel.send({ embeds: [logEmbed] });
    }
    
    // --- Ban en 3 advertencias ---
    if (warningCount >= 3) {
        delete warnings[targetUser.id];
        saveWarnings(warnings);

        await interaction.editReply({ content: `✅ Advertencia registrada. El usuario **${targetUser.tag}** alcanzó 3 advertencias y será baneado.` });
        
        try {
            await targetUser.send({ content: `Has sido baneado de **${interaction.guild.name}** por acumular 3 advertencias.`});
        } catch (error) {
             console.log(`No se pudo enviar DM de baneo a ${targetUser.tag}.`);
        }

        await interaction.guild.members.ban(targetUser, { reason: 'Acumulación de 3 advertencias.' });

        const banLogEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔨 Usuario Baneado (Auto)')
            .addFields(
                { name: '👤 Usuario', value: `${targetUser} (${targetUser.tag})`},
                { name: '📄 Razón', value: `Acumulación de 3 advertencias. Última razón: ${reason}` }
            )
            .setTimestamp();
        if (logChannel) await logChannel.send({ embeds: [banLogEmbed] });

    } else {
        await interaction.editReply({ content: `✅ Advertencia registrada para **${targetUser.tag}**. Ahora tiene **${warningCount}** advertencia(s).`, ephemeral: false });
    }
}

async function handleRemoveWarning(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    const warnId = interaction.options.getString('warn_id');

    const warnings = getWarnings();
    if (!warnings[targetUser.id] || warnings[targetUser.id].length === 0) {
        return interaction.reply({ content: `❌ El usuario **${targetUser.tag}** no tiene ninguna advertencia.`, ephemeral: true });
    }

    const initialCount = warnings[targetUser.id].length;
    warnings[targetUser.id] = warnings[targetUser.id].filter(w => w.id !== warnId);
    
    if (warnings[targetUser.id].length === initialCount) {
        return interaction.reply({ content: `❌ No se encontró una advertencia con el ID \`${warnId}\` para ese usuario.`, ephemeral: true });
    }

    if (warnings[targetUser.id].length === 0) {
        delete warnings[targetUser.id];
    }

    saveWarnings(warnings);
    await interaction.reply({ content: `✅ Se ha eliminado la advertencia con ID \`${warnId}\` del usuario **${targetUser.tag}**.`, ephemeral: false });
}

async function handleClearWarnings(interaction) {
    const targetUser = interaction.options.getUser('usuario');
    
    const warnings = getWarnings();
    if (!warnings[targetUser.id] || warnings[targetUser.id].length === 0) {
        return interaction.reply({ content: `❌ El usuario **${targetUser.tag}** no tiene ninguna advertencia para limpiar.`, ephemeral: true });
    }

    delete warnings[targetUser.id];
    saveWarnings(warnings);

    await interaction.reply({ content: `✅ Todas las advertencias de **${targetUser.tag}** han sido eliminadas.`, ephemeral: false });
}
