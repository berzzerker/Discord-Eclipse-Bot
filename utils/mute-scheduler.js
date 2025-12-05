const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const mutesFilePath = path.join(__dirname, '..', 'data', 'mutes.json');
const LOG_CHANNEL_ID = '1444252751293976646'; // Mismo canal de logs para consistencia

function getMutes() {
    try {
        const data = fs.readFileSync(mutesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        console.error('Error al leer mutes.json en el scheduler:', error);
        return {};
    }
}

function saveMutes(data) {
    try {
        fs.writeFileSync(mutesFilePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('Error al guardar en mutes.json en el scheduler:', error);
    }
}

async function checkMutes(client) {
    const mutes = getMutes();
    const now = new Date();
    let updated = false;

    for (const userId in mutes) {
        const muteInfo = mutes[userId];
        if (muteInfo.unmuteAt && new Date(muteInfo.unmuteAt) <= now) {
            try {
                const guild = await client.guilds.fetch(muteInfo.guildId);
                const member = await guild.members.fetch(userId).catch(() => null);
                
                if (member) {
                    await member.roles.remove(muteInfo.roleId, 'Duración de mute expirada.');
                    console.log(`[Mute Scheduler] Se ha desmuteado a ${member.user.tag}.`);

                    // Enviar log de unmute
                    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor(0x77DD77) // Verde claro
                            .setTitle('🔊 Usuario Desmuteado (Auto)')
                            .addFields(
                                { name: '👤 Usuario', value: `${member.user} (${member.user.tag})` },
                                { name: '📄 Razón', value: 'Duración de mute expirada.' }
                            )
                            .setTimestamp();
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            } catch (error) {
                console.error(`[Mute Scheduler] Error al procesar el unmute para ${userId}:`, error);
            }
            
            delete mutes[userId];
            updated = true;
        }
    }

    if (updated) {
        saveMutes(mutes);
    }
}

function start(client) {
    console.log('[Mute Scheduler] El planificador de mutes ha sido iniciado.');
    // Revisa cada 30 segundos
    setInterval(() => checkMutes(client), 30000); 
}

module.exports = { start };
