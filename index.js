const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');

// Crea una nueva instancia del cliente de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Colección para almacenar los comandos
client.commands = new Collection();

// Carga los archivos de comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Establece un nuevo elemento en la Collection con la clave como el nombre del comando y el valor como el módulo exportado
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`);
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

// Inicia sesión en Discord con el token de tu bot
client.login(process.env.DISCORD_TOKEN);
