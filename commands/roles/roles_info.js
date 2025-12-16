const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles-info')
        .setDescription('Muestra una guía completa de todos los roles disponibles en Eclipse Studios.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a) // Color negro como en otros embeds del bot
            .setTitle('¡Bienvenidos a Eclipse Studios! 🌑')
            .setDescription(
                'Aquí tienes una guía completa y clara de todos los roles disponibles en nuestro Discord. Esta lista te ayudará a entender qué hace cada rol, para que sepas exactamente a qué te postulas si quieres unirte al equipo o qué beneficios tienen los roles de comunidad.\n\n' +
                'Los roles están divididos en categorías para que sea más fácil encontrarlos.'
            )
            .addFields(
                {
                    name: '🔹 Staff (Equipo de Moderación y Administración)',
                    value:
                        '🌘 **Eclipse Owner** → Dueño y fundador del estudio. Tiene el control total y la última palabra en todas las decisiones.\n' +
                        '🔨 **Admin General** → Administrador global. Gestiona todo el servidor y toma decisiones importantes.\n' +
                        '🔧 **Moderador / Staff** → Encargado de mantener el orden diario: warns, mutes, bans y organización general.\n' +
                        '⚙️ **Helper** → Ayuda en tickets, resuelve dudas de la comunidad y tiene permisos leves de moderación.'
                },
                {
                    name: '🔹 Equipo de Desarrollo y Creación',
                    value:
                        '**Roblox Division**\n\n' +
                        '🌟 **Roblox Division Manager** → Control total de la división Roblox: planea, publica, cierra proyectos y juegos.\n' +
                        '👑 **Líder Luau** → Lidera y gestiona al equipo de programadores en Luau (Roblox Studio).\n' +
                        '👑 **Líder Builder Roblox** → Lidera y gestiona al equipo de construcción en Roblox.\n' +
                        '🧑‍💻 **Programador Roblox** → Programa en Luau: gameplay, sistemas, optimización, etc.\n' +
                        '🏗️ **Builder Roblox** → Construye mapas, decoraciones, estructuras y detalles en Roblox Studio.\n' +
                        '🏃 **Animador Roblox** → Crea animaciones para rigs, cinemáticas y movimientos.\n' +
                        '🗽 **Modelador 3D** → Modela en Blender, Maya, Blockbench o Roblox Studio.\n' +
                        '🎨 **Artista Roblox** → Crea arte visual del juego (UI, thumbnails, efectos, etc.).\n' +
                        '🔦 **Tester Roblox** → Prueba los juegos, reporta bugs y da feedback detallado.\n\n' +

                        '**Minecraft Events**\n\n' +
                        '🌟 **Minecraft Events Manager** → Control total de la división de eventos de Minecraft.\n' +
                        '👑 **Líder Builder Minecraft** → Lidera al equipo de construcción para eventos.\n' +
                        '👑 **Líder Java** → Lidera al equipo de programación Java para eventos.\n' +
                        '🏗️ **Builder Minecraft** → Construye megaestructuras, mapas y detalles para eventos.\n' +
                        '🧑‍💻 **Java Dev** → Programa plugins, comandos, mods o datapacks para servidores y eventos.\n' +
                        '⚙️ **Event Host** → Dirige el evento en vivo, toma decisiones importantes (pausar, revivir jugadores, etc.).\n' +
                        '⚙️ **Event Helper** → Ayuda durante los eventos: resuelve dudas, devuelve items, modera en vivo.\n' +
                        '🔦 **Minecraft Event Tester** → Prueba los eventos antes de su lanzamiento y da feedback.\n\n' +

                        '**Indie Games & Roles Versátiles (sirven para todas las divisiones)**\n\n' +
                        '🧑‍💻 **Programador Indie** → Programa en engines como Unity, Unreal, Godot, etc. (gameplay, UI, IA, networking).\n' +
                        '✍️ **Game Designer** → Diseña mecánicas, balance, progresión y narrativa de los juegos.\n' +
                        '📱 **UI/UX Designer** → Diseña interfaces, menús, HUD y experiencia de usuario.\n' +
                        '🎶 **Compositor** → Crea música original para juegos, eventos o trailers.\n' +
                        '🎵 **SFX Designer** → Crea efectos de sonido para juegos y eventos.\n' +
                        '🖌️ **Diseñador Gráfico** → Thumbnails, banners, icons, promocionales y arte publicitario.\n' +
                        '👾 **2D Artist / Pixel Art** → Sprites, texturas, ilustraciones y pixel art.\n' +
                        '🗽 **Modelador 3D** → Modelado 3D avanzado (Blender, Maya, Blockbench).\n' +
                        '🍃 **VFX / Partículas** → Crea efectos visuales y partículas para cualquier proyecto.\n' +
                        '🗣️ **Actor de Voz** → Graba voces para personajes, narración o diálogos.\n' +
                        '🗣️ **Traductor** → Traduce textos, subtítulos, nombres de items, etc.\n' +
                        '👑 **Content Manager / Trailer Editor** → Crea trailers y contenido para YouTube/TikTok.\n' +
                        '🔥 **Social Media Manager** → Gestiona y publica en nuestras redes sociales.'
                },
                {
                    name: '🔹 Roles de Comunidad y Premios',
                    value:
                        '🏆 **Campeón del Evento** → Ganador oficial de al menos un evento de Minecraft.\n' +
                        '❤️ **Pilar de la Comunidad** → Miembro que siempre ayuda a los nuevos y mantiene buena vibra.\n' +
                        '🎉 **Alma de la Fiesta** → El que organiza squads, integra gente y anima el servidor.\n' +
                        '🌟 **Verified Creator** → Creador de contenido oficial o aliado de Eclipse Studios.\n' +
                        '🌟 **Nitro Booster** → Booster del servidor (¡gracias por el apoyo!).\n' +
                        '🤝 **Eclipse Partner** → Servidor aliado o partner oficial.\n' +
                        '💎 **Miembro OG** → Uno de los primeros 100 miembros.\n' +
                        '⭐ **Miembro Activo** → Muy activo en el servidor (alto nivel o presencia constante).\n' +
                        '🌙 **Eclipse VIP / ⚡ Neon Eclipse / ☄️ Cosmic Eclipse** → Roles estéticos premium (boosters o eventos especiales).\n' +
                        '🖤 **Void Walker** → Rol estético secreto (solo el Owner lo otorga).'
                },
                {
                    name: '🔹 Notificaciones (para estar al día)',
                    value:
                        '🔔 **Notificaciones Eventos** → Ping para eventos de Minecraft.\n' +
                        '🔔 **Notificaciones Roblox** → Ping para playtests y actualizaciones Roblox.\n' +
                        '🔔 **Notificaciones Indie** → Ping para devlogs y pruebas de juegos indie.'
                },
                {
                    name: '\u200B', // Espacio en blanco para separar el pie de página
                    value:
                        'Si quieres postularte a algún rol del equipo, abre un ticket y dinos a cuál/cuáles te interesa aplicar. ¡Estamos buscando talento apasionado por Roblox, Minecraft y juegos indie!\n' +
                        '¡Gracias por ser parte de Eclipse Studios! 🌑✨'
                }
            );

        await interaction.reply({
            embeds: [embed],
            ephemeral: false // Esto permite que todos vean el embed
        });
    },
};
