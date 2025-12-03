const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

// Define los roles de división con sus IDs (PLACEHOLDERS, DEBES REEMPLAZARLOS CON TUS IDS REALES)
const DIVISION_ROLES = [
    { name: '🌿 Eclipse Events', id: '1444266274375864482' },
    { name: '🎮 Eclipse Roblox', id: '1444261762709983312' },
    { name: '🌅 Eclipse Studios', id: '1444269229892440187' },
];

module.exports = {
    // Función para mostrar el menú desplegable de divisiones
    async showMenu(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_division_role')
            .setPlaceholder('Selecciona tus divisiones...')
            .setMinValues(0) // Puede no seleccionar ninguna si lo desea
            .setMaxValues(DIVISION_ROLES.length); // Permite seleccionar todas las divisiones

        DIVISION_ROLES.forEach(role => {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(role.name)
                    .setValue(role.id)
            );
        });

        const row = new ActionRowBuilder().addComponents(select);

        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a) // Color negro #1a1a1a
            .setTitle('Selección de Divisiones | Eclipse Studios')
            .setDescription('Elige las divisiones a las que perteneces. Puedes seleccionar una o varias divisiones. Las divisiones que no selecciones serán eliminadas de tus roles.');

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true, // Solo visible para el usuario
        });
    },

    // Función para manejar la selección del menú desplegable de divisiones
    async handleSelect(interaction) {
        const selectedRoleIds = interaction.values; // Ahora es un array de IDs seleccionados
        const member = interaction.member;
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
            return;
        }

        // Obtener todos los IDs de los roles de división definidos
        const allDivisionRoleIds = DIVISION_ROLES.map(r => r.id);

        // Roles de división actuales del miembro
        const currentMemberDivisionRoleIds = member.roles.cache
            .filter(role => allDivisionRoleIds.includes(role.id))
            .map(role => role.id);

        const rolesToAdd = selectedRoleIds.filter(id => !currentMemberDivisionRoleIds.includes(id));
        const rolesToRemove = currentMemberDivisionRoleIds.filter(id => !selectedRoleIds.includes(id));

        try {
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove, 'Removiendo roles de división no seleccionados.');
            }
            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd, 'Añadiendo roles de división seleccionados.');
            }

            let confirmationMessage;
            if (selectedRoleIds.length === 0) {
                confirmationMessage = '✅ Se han eliminado todos tus roles de división.';
            } else {
                const selectedRoleNames = selectedRoleIds
                    .map(id => DIVISION_ROLES.find(r => r.id === id)?.name)
                    .filter(name => name);
                confirmationMessage = `✅ Roles de división actualizados: ${selectedRoleNames.join(', ')}`;
            }
            
            await interaction.update({
                content: confirmationMessage,
                embeds: [], // Limpiar el embed para solo mostrar el mensaje de confirmación
                components: [], // Quitar el menú una vez seleccionado
                ephemeral: true
            });

        } catch (error) {
            console.error(`Error al gestionar roles de división para ${member.user.tag}: ${error}`);
            await interaction.update({
                content: '❌ Hubo un error al intentar gestionar tus roles. Asegúrate de que el bot tenga los permisos adecuados y que los IDs de los roles sean correctos.',
                embeds: [],
                components: [],
                ephemeral: true
            });
        }
    },
};