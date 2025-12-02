const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Define el prefijo para los comandos legacy
const PREFIX = '!';

// Crea una nueva instancia del cliente de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

// Colección para almacenar los comandos de barra
client.commands = new Collection();
// Colección para almacenar los comandos legacy (prefijo)
client.legacyCommands = new Collection();

// Carga los archivos de comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		
		// Carga comandos de barra
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} 
		// Carga comandos legacy
		if ('legacy' in command && 'execute' in command) {
			client.legacyCommands.set(command.legacy.name, command);
		}
		
		// Advertencia si un archivo no es ni slash ni legacy
		if (!('data' in command || 'legacy' in command) || !('execute' in command)) {
			console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades "data" o "legacy" y/o "execute" requeridas.`);
		}
	}
}

// Evento 'ready': se ejecuta una vez cuando el bot inicia sesión
client.once('ready', () => {
    console.log(`¡${client.user.tag} ha iniciado sesión y está listo! 🚀`);
});

// Evento 'interactionCreate': maneja las interacciones (comandos de barra)
client.on('interactionCreate', async interaction => {
    // Si no es un comando de barra, ignóralo
    if (!interaction.isChatInputCommand()) return;

    // Busca el comando en la colección del cliente
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error al ejecutar este comando. ¡Contacta a un administrador! 🐛', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando. ¡Contacta a un administrador! 🐛', ephemeral: true });
        }
    }
});

// Evento 'messageCreate': maneja los comandos legacy (prefijo)
client.on('messageCreate', async message => {
    // Ignora mensajes de bots y mensajes que no empiezan con el prefijo
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.legacyCommands.get(commandName);

    if (!command) return; // Si no es un comando legacy válido, ignorar

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al ejecutar ese comando legacy. ¡Contacta a un administrador! 🐛');
    }
});

// Inicia sesión en Discord con el token de tu bot
client.login(process.env.DISCORD_TOKEN);

// Servidor HTTP simple para mantener el bot activo en Replit
const http = require('http');
http.createServer(function (req, res) {
    res.write("Bot de Eclipse Studios está activo! 🌌");
    res.end();
}).listen(3000);
