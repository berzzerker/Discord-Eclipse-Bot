const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles-info')
        .setDescription('Muestra una guía completa de todos los roles disponibles en Eclipse Studios.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setTitle('¡Bienvenidos a Eclipse Studios! 🌑')
            .setDescription(
                'Aquí tienes una guía completa de todos los roles disponibles en nuestro Discord. Esta lista te ayudará a entender qué hace cada rol.\n\n' +
                'Los roles están divididos en categorías para que sea más fácil encontrarlos.'
            )
            .addFields(
                {
                    name: '🔹 Staff (Equipo de Moderación)',
                    value:
                        '🌘 **Eclipse Owner** → Dueño y fundador del estudio.\n' +
                        '🔨 **Admin General** → Administrador global del servidor.\n' +
                        '🔧 **Moderador / Staff** → Mantiene el orden: warns, mutes, bans.\n' +
                        '⚙️ **Helper** → Ayuda en tickets y resuelve dudas.'
                },
                {
                    name: '🔹 Roblox Division',
                    value:
                        '🌟 **Roblox Division Manager** → Control total de la división Roblox.\n' +
                        '👑 **Líder Luau** → Lidera al equipo de programadores Luau.\n' +
                        '👑 **Líder Builder Roblox** → Lidera al equipo de construcción.\n' +
                        '🧑‍💻 **Programador Roblox** → Programa en Luau.\n' +
                        '🏗️ **Builder Roblox** → Construye mapas y estructuras.\n' +
                        '🏃 **Animador Roblox** → Crea animaciones.\n' +
                        '🗽 **Modelador 3D** → Modela en Blender, Maya, etc.\n' +
                        '🎨 **Artista Roblox** → Arte visual (UI, thumbnails).\n' +
                        '🔦 **Tester Roblox** → Prueba juegos y reporta bugs.'
                },
                {
                    name: '🔹 Minecraft Events',
                    value:
                        '🌟 **Minecraft Events Manager** → Control total de eventos MC.\n' +
                        '👑 **Líder Builder Minecraft** → Lidera construcción para eventos.\n' +
                        '👑 **Líder Java** → Lidera programación Java.\n' +
                        '🏗️ **Builder Minecraft** → Construye mapas para eventos.\n' +
                        '🧑‍💻 **Java Dev** → Programa plugins y mods.\n' +
                        '⚙️ **Event Host** → Dirige eventos en vivo.\n' +
                        '⚙️ **Event Helper** → Ayuda durante eventos.\n' +
                        '🔦 **Minecraft Event Tester** → Prueba eventos.'
                },
                {
                    name: '🔹 Indie Games & Roles Versátiles',
                    value:
                        '🧑‍💻 **Programador Indie** → Unity, Unreal, Godot, etc.\n' +
                        '✍️ **Game Designer** → Diseña mecánicas y narrativa.\n' +
                        '📱 **UI/UX Designer** → Interfaces y experiencia de usuario.\n' +
                        '🎶 **Compositor** → Música original.\n' +
                        '🎵 **SFX Designer** → Efectos de sonido.\n' +
                        '🖌️ **Diseñador Gráfico** → Thumbnails, banners, icons.\n' +
                        '👾 **2D Artist / Pixel Art** → Sprites y texturas.\n' +
                        '🍃 **VFX / Partículas** → Efectos visuales.\n' +
                        '🗣️ **Actor de Voz** → Voces para personajes.\n' +
                        '🗣️ **Traductor** → Traduce textos del juego.\n' +
                        '👑 **Content Manager** → Trailers y contenido.\n' +
                        '🔥 **Social Media Manager** → Redes sociales.'
                },
                {
                    name: '🔹 Roles de Comunidad y Premios',
                    value:
                        '🏆 **Campeón del Evento** → Ganador de evento MC.\n' +
                        '❤️ **Pilar de la Comunidad** → Ayuda a los nuevos.\n' +
                        '🎉 **Alma de la Fiesta** → Anima el servidor.\n' +
                        '🌟 **Verified Creator** → Creador de contenido oficial.\n' +
                        '🌟 **Nitro Booster** → Booster del servidor.\n' +
                        '🤝 **Eclipse Partner** → Partner oficial.\n' +
                        '💎 **Miembro OG** → Primeros 100 miembros.\n' +
                        '⭐ **Miembro Activo** → Muy activo en el servidor.\n' +
                        '🌙 **Eclipse VIP** → Rol estético premium.\n' +
                        '🖤 **Void Walker** → Rol secreto del Owner.'
                },
                {
                    name: '🔹 Notificaciones',
                    value:
                        '🔔 **Notificaciones Eventos** → Ping para eventos MC.\n' +
                        '🔔 **Notificaciones Roblox** → Ping para Roblox.\n' +
                        '🔔 **Notificaciones Indie** → Ping para juegos indie.'
                },
                {
                    name: '\u200B',
                    value:
                        'Si quieres postularte a algún rol, abre un ticket y dinos cuál te interesa. ¡Estamos buscando talento! 🌑✨'
                }
            );

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    },
};
