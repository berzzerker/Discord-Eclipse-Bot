const { EmbedBuilder } = require("discord.js");

// DEBES REEMPLAZAR ESTE ID CON EL ID REAL DE TU ROL DE STAFF
const STAFF_ROLE_ID = "1444386198121349311";

function getRulesEmbed() {
    const rulesDescription = [
        "**✨ Respeto y Convivencia**",
        "- Trata a los demás con amabilidad y respeto. No se tolera el acoso, la discriminación ni el discurso de odio de ningún tipo.",
        "- Mantenemos un ambiente positivo y seguro para todos. Evita el contenido NSFW (Not Safe For Work), gore o cualquier cosa explícita.",
        "- No satures el chat con mensajes repetitivos, imágenes excesivas o invitaciones no autorizadas a otros servidores.",
        "",
        "**📡 Comunicación y Canales**",
        "- Publica tus mensajes en el canal apropiado. Usa <#1444246780790308919> para charla general, <#1445506527086776473> para preguntas, etc.",
        "- El idioma oficial del servidor es el español. Por favor, usa el español en los canales públicos.",
        "- No compartas información personal tuya o de otros sin consentimiento explícito. Protege tu identidad y la de los demás.",
        "",
        "**📩 Sistema de tickets**",
        "- Los tickets son una herramienta en el server para hacer canales nuevos para lo que su tipo de ticket respecta, ya sean entrevistas o ayuda del staff, puedes abrir solo 1 ticket cada 10 minutos y puede haber solo 1 ticket creado por usuario a la vez, la mayoría de la información de los tickets puede ser documentada y guardada para su posterior revisión, ya sean entrevistas o casos en donde ayudamos con algún problema en el server.",
        "",
        "**⚖️ Cumplimiento y Moderación**",
        "- Además de nuestras reglas, debes cumplir con los Términos de Servicio de Discord y las Directrices de la Comunidad.",
        `- Las decisiones del equipo de Staff son finales. Si tienes alguna duda o problema, contacta a un miembro del Staff (<@&${STAFF_ROLE_ID}>).`,
        "",
        "**💎 ¡Disfruta tu Estancia!**",
        "- Participa, comparte tus ideas y disfruta de la comunidad. 🌠",
    ].join("\n");

    const rulesEmbed = new EmbedBuilder()
        .setColor(0x1a1a1a) // Color oscuro para Eclipse Studios
        .setTitle("📜 Reglamento de Eclipse Studios")
        .setDescription(
            `¡Bienvenido! Para mantener la armonía en nuestro Estudio y Comunidad, te pedimos que sigas estas simples reglas. Su incumplimiento podría llevar a consecuencias inevitables.\n\n` +
                rulesDescription,
        )
        .setFooter({
            text: "Al permanecer en este servidor, aceptas cumplir con estas reglas. Gracias por hacer de Eclipse Studios un lugar increíble.",
        })
        .setTimestamp();

    return rulesEmbed;
}

module.exports = {
    getRulesEmbed,
};
