// Este es el comando para el prefijo !staff

module.exports = {
    name: 'staff',
    description: 'Muestra el staff actual de Eclipse Studios.',
    async execute(message, args) {
        const staffList = `
🌑 **Equipo Oficial de Eclipse Studios**
*El equipo que hace todo posible*

**Dueño del servidor**/🌘 **Eclipse Owner**
 <@731592242275418133> (berzzerker_)

🔨 **Admin General**
- por rellenar -

🔧 **Moderación**
- por rellenar -

⚙️ **Helper**
- por rellenar -

⚙️ **Event Host**
- por rellenar -
`;
        // La respuesta no puede ser efímera en comandos legacy
        await message.reply({ content: staffList });
    },
};
