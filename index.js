const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const query = require('samp-query');

// 🔒 Reemplaza por tu token y client ID
const TOKEN = 'uwu';
const CLIENT_ID = 'onichan';

const CONFIG_PATH = path.join(__dirname, 'config.json');

// 📁 Cargar configuración
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    config = JSON.parse(data);
  } catch (e) {
    console.error('❌ Error leyendo config.json:', e);
  }
}

// 💾 Guardar configuración
function guardarConfig() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);

  try {
    await client.user.setPresence({
      status: 'online',
      activities: [
        { name: 'Hecho por MarquitosApz con el corazón ❤️', type: 4 },
        { name: 'samp-monitor', type: 0 }
      ]
    });

    console.log('✅ Presencia establecida');
  } catch (err) {
    console.error('❌ Error al establecer presencia:', err);
  }
});

const comandos = [
  new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos disponibles'),
  new SlashCommandBuilder()
    .setName('establecerip')
    .setDescription('Establece la IP y el puerto del servidor SA-MP')
    .addStringOption(opt =>
      opt.setName('ip').setDescription('Dirección IP del servidor').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('puerto').setDescription('Puerto del servidor').setRequired(true)),
  new SlashCommandBuilder().setName('servidor').setDescription('Muestra información del servidor SA-MP'),
  new SlashCommandBuilder().setName('jugadores').setDescription('Muestra la cantidad de jugadores conectados'),
  new SlashCommandBuilder()
    .setName('skin')
    .setDescription('Muestra el skin de GTA Underground')
    .addIntegerOption(opt =>
      opt.setName('id').setDescription('ID del skin').setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: comandos });
    console.log('✅ Comandos registrados');
  } catch (error) {
    console.error('❌ Error al registrar comandos:', error);
  }
});

function consultarServidor(ip, port) {
  return new Promise((resolve, reject) => {
    query({ host: ip, port: port, timeout: 2000 }, (error, info) => {
      if (error) return reject(error);
      resolve(info);
    });
  });
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const guildId = interaction.guild?.id;
  const esAdmin = interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator) || false;

  // 📘 HELP
  if (interaction.commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📚 Comandos disponibles')
      .setColor('Green')
      .setDescription('Aquí tienes una lista de comandos que puedes usar:')
      .addFields(
        { name: '/establecerip', value: 'Establece la IP y el puerto del servidor SA-MP (solo admins)' },
        { name: '/servidor', value: 'Muestra información del servidor SA-MP' },
        { name: '/jugadores', value: 'Muestra la cantidad de jugadores conectados' },
        { name: '/skin', value: 'Muestra una imagen del skin de GTA SA por ID' },
        { name: '/help', value: 'Muestra este menú de ayuda' }
      )
      .setFooter({ text: 'samp-monitor por MarquitosApz' });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ⚙️ ESTABLECER IP
  if (interaction.commandName === 'establecerip') {
    if (!esAdmin) {
      return interaction.reply({ content: '🚫 Solo los administradores pueden usar este comando.', ephemeral: true });
    }

    const ip = interaction.options.getString('ip');
    const puerto = interaction.options.getInteger('puerto');

    config[guildId] = { ip, puerto };
    guardarConfig();

    return interaction.reply({ content: `✅ IP guardada para este servidor como \`${ip}:${puerto}\``, ephemeral: true });
  }

  // 🌐 SERVIDOR / 👥 JUGADORES
  if (interaction.commandName === 'servidor' || interaction.commandName === 'jugadores') {
    if (!guildId) {
      return interaction.reply({ content: '❌ Este comando solo funciona dentro de un servidor.', ephemeral: true });
    }

    const serverData = config[guildId];
    if (!serverData || !serverData.ip || !serverData.puerto) {
      return interaction.reply({ content: '⚠️ No hay una IP/puerto configurados. Usa `/establecerip`.', ephemeral: true });
    }

    const { ip, puerto } = serverData;
    console.log(`🔎 Consultando ${ip}:${puerto}`);

    try {
      const info = await consultarServidor(ip, puerto);

      if (interaction.commandName === 'servidor') {
        let rules = {};
        if (info.rules) {
          if (Array.isArray(info.rules)) {
            info.rules.forEach(rule => {
              rules[rule.name.toLowerCase()] = rule.value;
            });
          } else {
            rules = info.rules;
          }
        }

        const embed = new EmbedBuilder()
          .setTitle('🌐 Información del Servidor SA-MP')
          .setColor('Blue')
          .addFields(
            { name: '📍 IP', value: `${ip}:${puerto}`, inline: true },
            { name: '🎮 Modo de juego', value: rules.gamemode || 'Desconocido', inline: true },
            { name: '🗺️ Mapa', value: rules.mapname || 'Desconocido', inline: true },
            { name: '👥 Jugadores', value: `${info.online ?? 'N/A'} / ${info.maxplayers ?? 'N/A'}`, inline: true },
            { name: '🗣️ Idioma', value: rules.language || 'No especificado', inline: true },
            { name: '🔢 Versión', value: rules.version || 'N/A', inline: true },
            { name: '🌍 Web', value: rules.weburl || 'N/A', inline: true }
          )
          .setFooter({ text: 'samp-monitor por MarquitosApz' });

        return interaction.reply({ embeds: [embed] });

      } else if (interaction.commandName === 'jugadores') {
        if (!info.online) {
          return interaction.reply({ content: '❌ No se pudo obtener la cantidad de jugadores.', ephemeral: true });
        }

        if (info.online > 100) {
          return interaction.reply({ content: '🚫 Hay más de 100 jugadores, no se pueden mostrar.', ephemeral: true });
        }

        return interaction.reply({ content: `👥 Jugadores conectados: ${info.online} / ${info.maxplayers}`, ephemeral: true });
      }

    } catch (err) {
      console.error(`❌ Error al consultar ${ip}:${puerto}`, err);
      return interaction.reply({ content: '❌ No se pudo conectar al servidor. Verifica la IP y el puerto.', ephemeral: true });
    }
  }

  // 🧍 SKIN
  if (interaction.commandName === 'skin') {
    const id = interaction.options.getInteger('id');
    const url = `https://gtaundergroundmod.com/resources/media/skins/${id}.png`;

    const embed = new EmbedBuilder()
      .setTitle(`🧍 Skin ID: ${id}`)
      .setImage(url)
      .setColor('Purple')
      .setFooter({ text: 'samp-monitor por MarquitosApz' });

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(TOKEN);
