const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// --- Módulos de Roles ---
// Se importan aquí para que el manejador de interacciones pueda usarlos.
const divisionRoles = require('./commands/roles/division.js');
const equipoRoles = require('./commands/roles/equipo.js');
const notificacionesRoles = require('./commands/roles/notificaciones.js');
// -------------------------

const PREFIX = '!';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();
client.legacyCommands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // CORRECCIÓN: Lógica de carga mejorada
        // Si tiene 'data' y 'execute', es un comando de barra.
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } 
        // Si tiene 'name' y 'execute' pero NO 'data', es un comando de prefijo.
        else if ('name' in command && 'execute' in command) {
            client.legacyCommands.set(command.name, command);
        } 
        else {
            console.log(`[WARNING] El comando en ${filePath} no es un comando válido (falta 'data'/'name' o 'execute').`);
        }
    }
}

client.once('ready', () => {
    console.log(`¡${client.user.tag} ha iniciado sesión y está listo! 🚀`);
});

// --- MANEJADOR DE INTERACCIONES CORREGIDO ---
client.on('interactionCreate', async interaction => {
    // Maneja Comandos de Barra
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No se encontró ningún comando de barra que coincida con ${interaction.commandName}.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
            }
        }
    }
    // Maneja Botones
    else if (interaction.isButton()) {
        try {
            if (interaction.customId === 'roles_divisiones_button') {
                await divisionRoles.showMenu(interaction);
            } else if (interaction.customId === 'roles_habilidades_button') {
                await equipoRoles.showMenu(interaction);
            } else if (interaction.customId === 'roles_notificaciones_button') {
                await notificacionesRoles.showMenu(interaction);
            }
            // `roles_premium_button` se ignora por ahora
        } catch (error) {
            console.error('Error manejando botón:', error);
            await interaction.reply({ content: 'Hubo un error al procesar esta acción.', ephemeral: true });
        }
    }
    // Maneja Menús Desplegables
    else if (interaction.isStringSelectMenu()) {
        try {
            if (interaction.customId === 'select_division_role') {
                await divisionRoles.handleSelect(interaction);
            } else if (interaction.customId === 'select_habilidades_roles') {
                await equipoRoles.handleSelect(interaction);
            } else if (interaction.customId === 'select_notificaciones_roles') {
                await notificacionesRoles.handleSelect(interaction);
            }
        } catch (error) {
            console.error('Error manejando menú de selección:', error);
            await interaction.update({ content: 'Hubo un error al actualizar tus roles.', components: [], ephemeral: true });
        }
    }
});
// -----------------------------------------

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.legacyCommands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al ejecutar ese comando.');
    }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
http.createServer(function (req, res) {
    res.write("Bot de Eclipse Studios está activo! 🌌");
    res.end();
}).listen(3000);
