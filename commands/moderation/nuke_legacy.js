const { handleNukeCommand } = require('./nukeUtils');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    legacy: {
        name: 'nuke',
        description: 'Elimina mensajes del canal (comando legacy). Uso: !nuke [cantidad|all]',
    },
    async execute(message, args) {
        let countToDelete;

        if (args[0] === 'all') {
            countToDelete = 'all';
        } else if (args[0] && !isNaN(parseInt(args[0]))) {
            const num = parseInt(args[0]);
            if (num >= 1 && num <= 99) {
                countToDelete = num;
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0x1a1a1a)
                    .setDescription('❌ Para `!nuke`, la cantidad debe ser un número entre 1 y 99, o "all".');
                return message.reply({ embeds: [errorEmbed] });
            }
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor(0x1a1a1a)
                .setDescription('❌ Uso incorrecto de `!nuke`. Por favor, usa `!nuke [cantidad]` (1-99) o `!nuke all`.');
            return message.reply({ embeds: [errorEmbed] });
        }
        
        await handleNukeCommand(message, countToDelete, 'legacy');
    },
};
