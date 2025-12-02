const { EmbedBuilder } = require('discord.js');

function getRulesEmbed() {
    const rulesEmbed = new EmbedBuilder()
        .setColor(0x1a1a1a) // Color oscuro para Eclipse Studios
        .setTitle('📜 Reglamento de Eclipse Studios 🌌')
        .setDescription(
            `¡Bienvenido! Para mantener la armonía en nuestro Estudios y Comunidad, te pedimos que sigas estas simples reglas. Su incumplimiento podría llevar a consecuencias inevitables.\n\n` +
            `✨\n **Respeto y Convivencia**\n` +
            `Respeta a Todos los miembros: Trata a los demás con amabilidad y respeto. No se tolera el acoso, la discriminación ni el discurso de odio de ningún tipo.\n` +
            `Ambiente Seguro: Mantenemos un ambiente positivo y seguro para todos. Evita el contenido NSFW (Not Safe For Work), gore o cualquier cosa explícita.\n` +
            `No Spam ni Flood: No satures el chat con mensajes repetitivos, imágenes excesivas o invitaciones no autorizadas a otros servidores.\n\n` +
            `📡\n **Comunicación y Canales**\n` +
            `Usa los Canales Correctos: Publica tus mensajes en el canal apropiado. Usa <#1444246780790308919> para charla general, <#1445506527086776473> para preguntas, etc.\n` +
            `Idioma Principal: El idioma oficial del servidor es el español. Por favor, usa el español en los canales públicos.\n` +
            `Privacidad: No compartas información personal tuya o de otros sin consentimiento explícito. Protege tu identidad y la de los demás.\n\n` +
            `⚖️\n **Cumplimiento y Moderación**\n` +
            `Sigue las Directrices de Discord: Además de nuestras reglas, debes cumplir con los Términos de Servicio de Discord y las Directrices de la Comunidad.\n` +
            `Decisión del Staff: Las decisiones del equipo de Staff son finales. Si tienes alguna duda o problema, contacta a un <@1444386198121349311>.\n\n` +
            `💎\n **¡Disfruta tu Estancia!**\n` +
            `Sé Activo y Diviértete: Participa, comparte tus ideas y disfruta de la comunidad. 🌠\n\n` +
            // `Imagen` (Si hay una URL de imagen, se puede añadir aquí: .setImage('URL_DE_LA_IMAGEN_AQUI'))
        )
        .setFooter({ text: 'Al permanecer en este servidor, aceptas cumplir con estas reglas. Gracias por hacer de Eclipse Studios un lugar increíble.' })
        .setTimestamp();

    return rulesEmbed;
}

module.exports = {
    getRulesEmbed
};
