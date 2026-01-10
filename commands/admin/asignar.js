const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// ---------------------------------------------------------
// ⚙️ CONFIGURACIÓN DE IDs DE ROLES
// ---------------------------------------------------------
const ROLES_CONFIG = {
    // --- 🟢 ROLES DE TEAM ---
    TEAMS: [
        { name: '🔴 Roblox Team', value: '1447378544287158282' },
        { name: '🌑 Eclipse Team', value: '1447378863863758960' },
        { name: '🟩 Minecraft Team', value: '1447378736109453443' }
    ],

    // --- 💼 TODOS LOS TRABAJOS (Juntos) ---
    TRABAJOS: [
        // ROBLOX
        { name: '🌟 Roblox Division Manager', value: '1447288646154850335' },
        { name: '👑 Lider Luau', value: '1447287034053005442' },
        { name: '👑 Lider Builder Roblox', value: '1447287906933932092' },
        { name: '🧑‍💻 Programador Roblox', value: '1444792740725391422' },
        { name: '🏗️ Builder Roblox', value: '1444407158363132197' },
        { name: '🏃 Animador Roblox', value: '1444605243496071229' },
        { name: '🗽 Modelador 3D', value: '1447352668623339571' },
        { name: '🎨 Artista Roblox', value: '1444407482641285161' },
        { name: '🔦 Tester Roblox', value: '1444381758555422790' },
        
        // MINECRAFT
        { name: '🌟 Minecraft Events Manager', value: '1447313591312318648' },
        { name: '👑 Lider Builder Minecraft', value: '1447344174675263608' },
        { name: '👑 Lider Java', value: '1444802997271138387' },
        { name: '🏗️ Builder Minecraft', value: '1444407326147874981' },
        { name: '🧑‍💻 Java Dev', value: '1444802813640314971' },
        { name: '⚙️ Event Host', value: '1444803882004775052' },
        { name: '⚙️ Event Helper', value: '1444605626683625656' },
        { name: '🔦 Minecraft Event Tester', value: '1448025740686790687' },

        // GENERAL
        { name: '🎵 Compositor', value: '1447697821221261403' },
        { name: '🖌️ Diseñador Gráfico', value: '1444803681185956024' },
        { name: '🧑‍💻 Programador Indie', value: '1444605481133019146' },
        { name: '✍️ Game Designer', value: '1447699089666867402' },
        { name: '📱 UI/UX Designer', value: '1444798630459342928' },
        { name: '🎵 SFX Designer', value: '1459475900792967240' },
        { name: '🗣️ Actor de Voz', value: '1447697998174879806' },
        { name: '🍃 VFX / Particulas', value: '1447698731884482701' },
        { name: '🗣️ Traductor', value: '1444803316604342304' },
        { name: '👾 2D Artist / Pixel Art', value: '1447702796563382340' },
        { name: '👑 Content Manager', value: '1448830354776391773' },
        { name: '🔥 Social Media Manager', value: '1448829540301541477' }
    ]
};

module.exports = {
    // Exportamos la configuración para usarla en el comando de despedir
    ROLES_CONFIG,
    
    data: new SlashCommandBuilder()
        .setName('asignar')
        .setDescription('Asigna roles de Team o Trabajos a un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        
        // --- OPCIÓN 1: TEAM ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('team')
                .setDescription('Asigna roles principales de Team')
                .addUserOption(option => option.setName('usuario').setDescription('El usuario').setRequired(true))
                .addStringOption(option =>
                    option.setName('rol')
                        .setDescription('Selecciona el Team')
                        .setRequired(true)
                        .addChoices(...ROLES_CONFIG.TEAMS)
                )
        )

        // --- OPCIÓN 2: TRABAJO (Con Autocompletado) ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('trabajo')
                .setDescription('Asigna cualquier rol de trabajo')
                .addUserOption(option => option.setName('usuario').setDescription('El usuario').setRequired(true))
                .addStringOption(option =>
                    option.setName('rol')
                        .setDescription('Escribe para buscar el rol de trabajo...')
                        .setRequired(true)
                        .setAutocomplete(true) // ✨ Activa el autocompletado
                )
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = ROLES_CONFIG.TRABAJOS;
        
        // Filtra los trabajos que coincidan con lo que escribe el usuario (máximo 25 resultados)
        const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue)).slice(0, 25);
        
        await interaction.respond(
            filtered.map(choice => ({ name: choice.name, value: choice.value })),
        );
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getMember('usuario');
        const roleId = interaction.options.getString('rol');

        // Buscar el nombre del rol basado en la ID para el mensaje
        let roleName = "Desconocido";
        let allRoles = [...ROLES_CONFIG.TEAMS, ...ROLES_CONFIG.TRABAJOS];
        const roleObj = allRoles.find(r => r.value === roleId);
        if (roleObj) roleName = roleObj.name;

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({
                content: `❌ **Error:** No encontré el rol con ID 
${roleId}
. Verifica la configuración.`, 
                ephemeral: true 
            });
        }

        try {
            if (targetUser.roles.cache.has(roleId)) {
                return interaction.reply({
                    content: `⚠️ El usuario ${targetUser} ya tiene el rol **${roleName}**.`,
                    ephemeral: true 
                });
            }

            await targetUser.roles.add(role);
            await interaction.reply({
                content: `✅ Se ha otorgado el rol **${roleName}** a ${targetUser}.`, 
                ephemeral: false 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ **Error:** No pude dar el rol. Asegúrate de que mi rol (del bot) esté por encima de **${roleName}** en la jerarquía.`, 
                ephemeral: true 
            });
        }
    },
};