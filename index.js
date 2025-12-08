const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
const {
    Client,
    Collection,
    GatewayIntentBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    EmbedBuilder,
} = require("discord.js");
const { createTicketChannel } = require("./utils/ticket-creation.js");
const { logTicketClosure } = require("./utils/ticket-logging.js");
const { TICKET_CATEGORY_ID } = require("./commands/tickets/ticket.js");

const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
    res.send("Bot de Eclipse Studios está activo! ⚡");
});

app.listen(port, "0.0.0.0", () => {
    console.log("Servidor web escuchando en el puerto 5000");
});

// --- Módulos de Roles ---
const divisionRoles = require("./commands/roles/division.js");
const equipoRoles = require("./commands/roles/equipo.js");
const notificacionesRoles = require("./commands/roles/notificaciones.js");
// -------------------------

const PREFIX = "!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
client.legacyCommands = new Collection();
client.openTickets = new Set();
client.ticketCooldowns = new Set();
client.closingTickets = new Map();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else if ("name" in command && "execute" in command) {
            client.legacyCommands.set(command.name, command);
        } else {
            console.log(
                `[WARNING] El comando en ${filePath} no es un comando válido (falta 'data'/'name' o 'execute').`,
            );
        }
    }
}

client.once("ready", () => {
    console.log(`¡${client.user.tag} ha iniciado sesión y está listo! 🚀`);
});

// --- LÓGICA DE CIERRE DE TICKET ---
async function startTicketClosure(interaction) {
    const { channel, member, user: closerUser } = interaction;

    if (channel.parentId !== TICKET_CATEGORY_ID) {
        return interaction.reply({
            content: "❌ Este comando solo puede usarse en un canal de ticket.",
            ephemeral: true,
        });
    }
    if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({
            content: "❌ No tienes permisos para cerrar este ticket.",
            ephemeral: true,
        });
    }
    if (client.closingTickets.has(channel.id)) {
        return interaction.reply({
            content: "Este ticket ya está en proceso de cierre.",
            ephemeral: true,
        });
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_close_cancel")
            .setLabel("Cancelar Cierre")
            .setStyle(ButtonStyle.Secondary),
    );

    const closeMsg = await channel.send({
        content: `⚠️ Ticket marcado para cierre por ${interaction.user}. Este canal se eliminará en 10 segundos...`,
        components: [row],
    });

    const timeoutId = setTimeout(async () => {
        client.closingTickets.delete(channel.id);

        // --- LOGGING Y TRANSCRIPCIÓN ---
        await logTicketClosure(client, channel, closerUser);

        const topic = channel.topic;
        if (topic && topic.includes("Ticket de")) {
            const userIdMatch = topic.match(/\((\d{17,19})\)/);
            if (userIdMatch && userIdMatch[1]) {
                const userId = userIdMatch[1];
                client.openTickets.delete(userId);
                console.log(
                    `[Ticket System] Usuario ${userId} eliminado de la lista de tickets abiertos.`,
                );
            }
        }

        await channel.delete("Cierre de ticket completado.");
    }, 10000); // 10 segundos

    client.closingTickets.set(channel.id, {
        timeoutId,
        closeMsgId: closeMsg.id,
    });
    await interaction.reply({
        content: "¡El proceso de cierre ha comenzado!",
        ephemeral: true,
    });
}

// --- MANEJADOR DE INTERACCIONES ---
client.on("interactionCreate", async (interaction) => {
    const { user, channel, member } = interaction;

    // Maneja Comandos de Barra
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            if (interaction.commandName === "ticket") {
                const subcommand = interaction.options.getSubcommand();

                if (["close", "add", "remove", "rename"].includes(subcommand)) {
                    if (channel.parentId !== TICKET_CATEGORY_ID) {
                        return interaction.reply({
                            content:
                                "❌ Este comando solo puede usarse en un canal de ticket.",
                            ephemeral: true,
                        });
                    }
                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.ManageChannels,
                        )
                    ) {
                        return interaction.reply({
                            content:
                                "❌ No tienes permisos para gestionar este ticket.",
                            ephemeral: true,
                        });
                    }
                }

                if (subcommand === "close") {
                    await startTicketClosure(interaction);
                } else if (subcommand === "add") {
                    const targetUser = interaction.options.getUser("usuario");
                    await channel.permissionOverwrites.edit(targetUser.id, {
                        ViewChannel: true,
                        SendMessages: true,
                    });
                    await interaction.reply({
                        content: `✅ Se ha añadido a ${targetUser} al ticket.`,
                        ephemeral: true,
                    });
                } else if (subcommand === "remove") {
                    const targetUser = interaction.options.getUser("usuario");
                    await channel.permissionOverwrites.delete(targetUser.id);
                    await interaction.reply({
                        content: `✅ Se ha quitado a ${targetUser} del ticket.`,
                        ephemeral: true,
                    });
                } else if (subcommand === "rename") {
                    const newName =
                        interaction.options.getString("nuevo_nombre");
                    await channel.setName(newName);
                    await interaction.reply({
                        content: `✅ El ticket ha sido renombrado a \`${newName}\`.`,
                        ephemeral: true,
                    });
                } else {
                    await command.execute(interaction);
                }
            } else {
                await command.execute(interaction);
            }
        } catch (error) {
            console.error("Error ejecutando comando:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "Hubo un error al ejecutar este comando.",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "Hubo un error al ejecutar este comando.",
                    ephemeral: true,
                });
            }
        }
    }
    // Maneja Botones
    else if (interaction.isButton()) {
        try {
            const customId = interaction.customId;

            if (customId.startsWith("ticket_open_")) {
                if (client.openTickets.has(user.id))
                    return interaction.reply({
                        content: "❌ Ya tienes un ticket abierto.",
                        ephemeral: true,
                    });
                if (client.ticketCooldowns.has(user.id))
                    return interaction.reply({
                        content:
                            "⏳ Debes esperar un poco antes de abrir otro ticket.",
                        ephemeral: true,
                    });

                const ticketType = customId.split("_")[2];
                if (ticketType === "general") {
                    const modal = new ModalBuilder()
                        .setCustomId("ticket_modal_general")
                        .setTitle("Abrir Ticket de Soporte General");
                    const reasonInput = new TextInputBuilder()
                        .setCustomId("ticket_reason")
                        .setLabel("¿Cuál es el motivo de tu ticket?")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Ej: "Tengo un problema con..."')
                        .setRequired(true);
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(reasonInput),
                    );
                    await interaction.showModal(modal);
                } else {
                    await interaction.deferReply({ ephemeral: true });
                    const newChannel = await createTicketChannel(
                        interaction,
                        ticketType,
                    );
                    if (newChannel) {
                        client.openTickets.add(user.id);
                        client.ticketCooldowns.add(user.id);
                        setTimeout(
                            () => client.ticketCooldowns.delete(user.id),
                            120000,
                        );
                        await interaction.editReply({
                            content: `✅ ¡Tu ticket ha sido creado en ${newChannel}!`,
                        });
                    }
                }
            } else if (customId === "ticket_close_start") {
                await startTicketClosure(interaction);
            } else if (customId === "ticket_close_cancel") {
                const closingInfo = client.closingTickets.get(channel.id);
                if (closingInfo) {
                    clearTimeout(closingInfo.timeoutId);
                    client.closingTickets.delete(channel.id);
                    await channel.messages
                        .delete(closingInfo.closeMsgId)
                        .catch(console.error);
                    await interaction.reply({
                        content: "✅ Cierre de ticket cancelado.",
                        ephemeral: true,
                    });
                }
            } else if (customId === "ticket_claim") {
                if (
                    !member.permissions.has(PermissionFlagsBits.ManageChannels)
                ) {
                    return interaction.reply({
                        content:
                            "❌ Solo los miembros del staff pueden reclamar tickets.",
                        ephemeral: true,
                    });
                }
                await interaction.deferUpdate();

                const originalRow = ActionRowBuilder.from(
                    interaction.message.components[0],
                );
                const claimButton = originalRow.components.find(
                    (comp) => comp.data.custom_id === "ticket_claim",
                );

                claimButton
                    .setDisabled(true)
                    .setLabel("Reclamado")
                    .setStyle(ButtonStyle.Secondary);

                await interaction.message.edit({ components: [originalRow] });

                await channel.send({
                    content: `👑 Este ticket ha sido reclamado por ${user}.`,
                });
            } else if (
                customId === "ticket_add_user" ||
                customId === "ticket_remove_user"
            ) {
                await interaction.reply({
                    content:
                        "Esta función está disponible vía comandos de barra: `/ticket add` y `/ticket remove`.",
                    ephemeral: true,
                });
            } else if (customId === "roles_divisiones_button") {
                await divisionRoles.showMenu(interaction);
            } else if (customId === "roles_habilidades_button") {
                await equipoRoles.showMenu(interaction);
            } else if (customId === "roles_notificaciones_button") {
                await notificacionesRoles.showMenu(interaction);
            }
        } catch (error) {
            console.error("Error manejando botón:", error);
            if (!interaction.replied && !interaction.deferred)
                await interaction.reply({
                    content: "Hubo un error al procesar esta acción.",
                    ephemeral: true,
                });
            else
                await interaction.followUp({
                    content: "Hubo un error al procesar esta acción.",
                    ephemeral: true,
                });
        }
    }
    // Maneja Menús Desplegables
    else if (interaction.isStringSelectMenu()) {
        try {
            if (interaction.customId === "select_division_role")
                await divisionRoles.handleSelect(interaction);
            else if (interaction.customId === "select_habilidades_roles")
                await equipoRoles.handleSelect(interaction);
            else if (interaction.customId === "select_notificaciones_roles")
                await notificacionesRoles.handleSelect(interaction);
        } catch (error) {
            console.error("Error manejando menú de selección:", error);
            await interaction.update({
                content: "Hubo un error al actualizar tus roles.",
                components: [],
                ephemeral: true,
            });
        }
    }
    // Maneja Envío de Modales
    else if (interaction.isModalSubmit()) {
        try {
            if (interaction.customId === "ticket_modal_general") {
                if (client.openTickets.has(user.id))
                    return interaction.reply({
                        content: "❌ Ya tienes un ticket abierto.",
                        ephemeral: true,
                    });
                if (client.ticketCooldowns.has(user.id))
                    return interaction.reply({
                        content:
                            "⏳ Debes esperar un poco antes de abrir otro ticket.",
                        ephemeral: true,
                    });

                await interaction.deferReply({ ephemeral: true });
                const reason =
                    interaction.fields.getTextInputValue("ticket_reason");
                const newChannel = await createTicketChannel(
                    interaction,
                    "general",
                    reason,
                );

                if (newChannel) {
                    client.openTickets.add(user.id);
                    client.ticketCooldowns.add(user.id);
                    setTimeout(
                        () => client.ticketCooldowns.delete(user.id),
                        120000,
                    );
                    await interaction.editReply({
                        content: `✅ ¡Tu ticket ha sido creado en ${newChannel}!`,
                    });
                }
            }
        } catch (error) {
            console.error("Error manejando modal:", error);
            if (!interaction.replied && !interaction.deferred)
                await interaction.reply({
                    content: "Hubo un error al procesar tu solicitud.",
                    ephemeral: true,
                });
            else
                await interaction.followUp({
                    content: "Hubo un error al procesar tu solicitud.",
                    ephemeral: true,
                });
        }
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.legacyCommands.get(commandName);
    if (!command) return;
    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("Hubo un error al ejecutar ese comando.");
    }
});

// --- EVENTO GUILDMEMBERADD ---
client.on("guildMemberAdd", async (member) => {
    console.log(
        `El usuario ${member.user.tag} (${member.id}) se ha unido al servidor.`,
    );

    // --- Asignación de Roles Automática ---
    const autoRoleIds = [
        // '1444381145381732463', // Staff -> Eliminado para evitar problemas de jerarquía
        "1444381602112208936", // Division
        "1444540436952780840", // Equipo
        "1444382035882803350", // Sub-Roles y Rangos
        "1444385828871868416", // Comunidad
        "1444387882373615839", // Notificaciones
    ];

    try {
        await member.roles.add(autoRoleIds);
        console.log(`Roles de división añadidos a ${member.user.tag}.`);
    } catch (error) {
        console.error(
            `No se pudieron añadir los roles automáticos a ${member.user.tag}:`,
            error,
        );
    }

    // --- Mensaje de Bienvenida ---
    const welcomeChannelId = "1444272323351023636";
    try {
        const welcomeChannel =
            await member.guild.channels.fetch(welcomeChannelId);
        if (!welcomeChannel || !welcomeChannel.isTextBased()) {
            console.log(
                `[Welcome Msg] Canal de bienvenida no encontrado o no es de texto.`,
            );
            return;
        }

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x1a1a1a)
            .setTitle(
                `¡Bienvenido/a a Eclipse Studios, ${member.user.username}!`,
            )
            .setDescription(
                `¡Esperamos que disfrutes de tu estancia! \n\nNo dudes en explorar los canales y presentarte a la comunidad.`,
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: "Eclipse Studios",
                iconURL: member.guild.iconURL({ dynamic: true }),
            })
            .setTimestamp();

        await welcomeChannel.send({ embeds: [welcomeEmbed] });
        console.log(`Mensaje de bienvenida enviado para ${member.user.tag}.`);
    } catch (error) {
        console.error(`No se pudo enviar el mensaje de bienvenida:`, error);
    }
});

client.login(process.env.DISCORD_TOKEN);
