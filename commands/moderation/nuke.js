const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { handleNukeCommand } = require('./nukeUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Elimina mensajes del canal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) // Requiere permiso de "Gestionar mensajes"
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de mensajes recientes a eliminar (1-99).')
                .setMinValue(1)
                .setMaxValue(99)
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('todo')
                .setDescription('Elimina todos los mensajes posibles (hasta 99) dentro de los últimos 14 días.')
                .setRequired(false)),
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const todo = interaction.options.getBoolean('todo');

        let countToDelete;
        if (todo) {
            countToDelete = 'all';
        } else if (cantidad) {
            countToDelete = cantidad;
        } else {
            // Si no se especifica nada, por defecto eliminamos 1 mensaje o mostramos un error
            // Para simplificar, si no se especifica 'cantidad' ni 'todo', pediremos 10 mensajes.
            // O podríamos pedir que al menos una opción sea true/dada.
            // Optemos por que si 'todo' no es true y 'cantidad' no se da, mostrar un error.
            const errorEmbed = new EmbedBuilder()
                .setColor(0x1a1a1a)
                .setDescription('Por favor, especifica un número de mensajes a eliminar o selecciona la opción "todo".');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        
        await handleNukeCommand(interaction, countToDelete, 'slash');
    },
};
