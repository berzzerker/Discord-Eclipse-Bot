const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

// Define los roles de notificación con sus IDs (PLACEHOLDERS, DEBES REEMPLAZARLOS CON TUS IDS REALES)
const NOTIFICATION_ROLES = [
    { name: '🔔 Notificaciones Eventos', id: '1444388035729948682' },
    { name: '🔔 Notificaciones Roblox', id: '1444388183524769842' },
    { name: '🔔 Notificaciones Indie', id: '1444388295172690121' },
];

module.exports = {
    // Función para mostrar el menú desplegable de roles de notificación
    async showMenu(interaction) {
        const memberRoles = interaction.member.roles.cache.map(r => r.id);
        
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_notificaciones_roles')
            .setPlaceholder('Selecciona las notificaciones que deseas recibir...')
            .setMinValues(0) // Permite deseleccionar todos
            .setMaxValues(NOTIFICATION_ROLES.length); // Sin límite máximo

        const options = NOTIFICATION_ROLES.map(role => 
            new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id)
                .setDefault(memberRoles.includes(role.id)) // Pre-selecciona los roles que ya tiene
        );
        select.addOptions(options);

        const row = new ActionRowBuilder().addComponents(select);

        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setTitle('Notificaciones | Eclipse Studios')
            .setDescription('Elige las notificaciones que te gustaría recibir. Puedes seleccionar una o varias. Las selecciones que hagas reemplazarán tus roles de notificación actuales.');

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
        });
    },

    // Función para manejar la selección del menú
    async handleSelect(interaction) {
        const selectedRoleIds = interaction.values;
        const member = interaction.member;
        
        const allNotificationRoleIds = NOTIFICATION_ROLES.map(r => r.id);

        const currentMemberNotificationRoleIds = member.roles.cache
            .filter(role => allNotificationRoleIds.includes(role.id))
            .map(role => role.id);

        const rolesToAdd = selectedRoleIds.filter(id => !currentMemberNotificationRoleIds.includes(id));
        const rolesToRemove = currentMemberNotificationRoleIds.filter(id => !selectedRoleIds.includes(id));

        try {
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove, 'Actualizando roles de notificación.');
            }
            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd, 'Actualizando roles de notificación.');
            }

            let confirmationMessage;
            if (selectedRoleIds.length === 0) {
                confirmationMessage = '✅ Se han eliminado todas tus notificaciones.';
            } else {
                const selectedRoleNames = selectedRoleIds
                    .map(id => NOTIFICATION_ROLES.find(r => r.id === id)?.name)
                    .filter(name => name);
                confirmationMessage = `✅ Notificaciones actualizadas: ${selectedRoleNames.join(', ')}`;
            }
            
            await interaction.update({
                content: confirmationMessage,
                embeds: [],
                components: [],
                ephemeral: true
            });

        } catch (error) {
            console.error(`Error al gestionar roles de notificación para ${member.user.tag}: ${error}`);
            await interaction.update({
                content: '❌ Hubo un error al intentar gestionar tus roles. Asegúrate de que el bot tenga los permisos adecuados y que los IDs de los roles sean correctos.',
                embeds: [],
                components: [],
                ephemeral: true
            });
        }
    },
};