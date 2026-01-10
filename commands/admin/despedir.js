const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
// Importamos la configuración de roles del otro archivo para no repetirla
const { ROLES_CONFIG } = require('./asignar.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('despedir')
        .setDescription('Quita TODOS los roles de Team y Trabajo a un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario al que despedir (quitar roles)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('usuario');
        
        // Juntamos todos las IDs de roles posibles en una sola lista plana
        const allRoleIds = [
            ...ROLES_CONFIG.TEAMS.map(r => r.value),
            ...ROLES_CONFIG.TRABAJOS.map(r => r.value)
        ];

        await interaction.deferReply({ ephemeral: false });

        let rolesRemoved = [];
        let errors = [];

        // Iteramos sobre todos los roles definidos
        for (const roleId of allRoleIds) {
            if (targetUser.roles.cache.has(roleId)) {
                try {
                    await targetUser.roles.remove(roleId);
                    // Buscamos el nombre para el reporte
                    const roleName = [...ROLES_CONFIG.TEAMS, ...ROLES_CONFIG.TRABAJOS].find(r => r.value === roleId)?.name || roleId;
                    rolesRemoved.push(roleName);
                } catch (error) {
                    console.error(`Error quitando rol ${roleId}:`, error);
                    errors.push(roleId);
                }
            }
        }

        if (rolesRemoved.length > 0) {
            let message = `✅ **¡Usuario despedido!** Se han retirado los siguientes roles a ${targetUser}:\n\n`;
            message += rolesRemoved.map(r => `• ${r}`).join('\n');
            
            if (errors.length > 0) {
                message += `\n\n⚠️ No se pudieron quitar ${errors.length} roles (posiblemente por jerarquía).`;
            }

            await interaction.editReply({ content: message });
        } else {
            await interaction.editReply({ 
                content: `⚠️ El usuario ${targetUser} no tenía ningún rol de Team o Trabajo asignado.` 
            });
        }
    },
};
