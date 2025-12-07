const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
// Coge todas las carpetas de comandos del directorio de comandos que creaste anteriormente
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Coge todos los archivos de comandos de la carpeta de comandos
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Coge la propiedad data de cada SlashCommandBuilder para el despliegue
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`);
		}
	}
}

// Construye y prepara una instancia del módulo REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Y despliega tus comandos
(async () => {
	try {
		console.log(`🚀 Iniciando el despliegue de ${commands.length} comandos de aplicación (/).`);

		// El método put se usa para actualizar completamente todos los comandos en un Gremio con el conjunto actual.
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`✅ Se recargaron ${data.length} comandos de aplicación (/) con éxito en el servidor de pruebas.`);
	} catch (error) {
		// Y por supuesto, asegúrate de atrapar y registrar cualquier error.
		console.error(error);
	}
})();
