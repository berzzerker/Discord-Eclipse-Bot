const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

// Define los roles de habilidades/conocimientos con sus IDs (PLACEHOLDERS, DEBES REEMPLAZARLOS CON TUS IDS REALES)
const SKILL_ROLES = [ // CAMBIO: Nombre de la constante
    { name: '🧑‍💻 Luau Dev', id: '1444382672112844911' },
    { name: '☕ Java Dev', id: '1444383658772398160' },
    { name: '⚙️ Indie Dev', id: '1444383406350794763' },
    { name: '🏗️ Builder', id: '1444384015426785513' },
    { name: '🗿 3D Modeler', id: '1444263485788782693' },
    { name: '🎨 Pixel / UI Artist', id: '1444383543500214323' },
    { name: '🎵 Compositor', id: '1444384562120495335' },
    { name: '✍️ Diseñador de Juego', id: '1444384644601741392' },
    { name: '🧪 Tester', id: '1444381758555422790' },
    { name: '🎨 Artista', id: '1444390523346485340' }
];

module.exports = {
    // Función para mostrar el menú desplegable de roles de habilidades
    async showMenu(interaction) {
        const memberRoles = interaction.member.roles.cache.map(r => r.id);
        
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_habilidades_roles') // CAMBIO: CustomId actualizado
            .setPlaceholder('Selecciona tus habilidades / conocimientos...') // CAMBIO: Placeholder actualizado
            .setMinValues(0)
            .setMaxValues(SKILL_ROLES.length);

        const options = SKILL_ROLES.map(role => // CAMBIO: Referencia a SKILL_ROLES
            new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id)
                .setDefault(memberRoles.includes(role.id))
        );
        select.addOptions(options);

        const row = new ActionRowBuilder().addComponents(select);

        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setTitle('Habilidades / Conocimientos | Eclipse Studios') // CAMBIO: Título actualizado
            .setDescription('Elige tus habilidades o conocimientos. Puedes seleccionar uno o varios roles. Las selecciones que hagas reemplazarán tus roles de habilidades actuales.'); // CAMBIO: Descripción actualizada

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
        
        const allSkillRoleIds = SKILL_ROLES.map(r => r.id); // CAMBIO: Referencia a SKILL_ROLES

        const currentMemberSkillRoleIds = member.roles.cache
            .filter(role => allSkillRoleIds.includes(role.id))
            .map(role => role.id);

        const rolesToAdd = selectedRoleIds.filter(id => !currentMemberSkillRoleIds.includes(id));
        const rolesToRemove = currentMemberSkillRoleIds.filter(id => !selectedRoleIds.includes(id));

        try {
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove, 'Actualizando roles de habilidades/conocimientos.');
            }
            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd, 'Actualizando roles de habilidades/conocimientos.');
            }

            let confirmationMessage;
            if (selectedRoleIds.length === 0) {
                confirmationMessage = '✅ Se han eliminado todos tus roles de habilidades/conocimientos.';
            } else {
                const selectedRoleNames = selectedRoleIds
                    .map(id => SKILL_ROLES.find(r => r.id === id)?.name) // CAMBIO: Referencia a SKILL_ROLES
                    .filter(name => name);
                confirmationMessage = `✅ Habilidades / Conocimientos actualizados: ${selectedRoleNames.join(', ')}`; // CAMBIO: Mensaje de confirmación
            }
            
            await interaction.update({
                content: confirmationMessage,
                embeds: [],
                components: [],
                ephemeral: true
            });

        } catch (error) {
            console.error(`Error al gestionar roles de habilidades/conocimientos para ${member.user.tag}: ${error}`);
            await interaction.update({
                content: '❌ Hubo un error al intentar gestionar tus roles. Asegúrate de que el bot tenga los permisos adecuados y que los IDs de los roles sean correctos.',
                embeds: [],
                components: [],
                ephemeral: true
            });
        }
    },
};