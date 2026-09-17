import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  REST,
  Routes,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { commands } from "./commands.js";
import { BRAND, SELF_ROLES } from "./config/server.js";
import { bodkaEmbed, truncate } from "./lib/embeds.js";
import { GitHubService, startGitHubMonitor } from "./lib/github.js";
import { publishPanels } from "./lib/panels.js";
import { resolveGuildStructure, setupGuild } from "./lib/setup.js";
import { claimTicket, closeTicket, openTicket } from "./lib/tickets.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN و DISCORD_CLIENT_ID مطلوبة.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

const github = new GitHubService(BRAND.repo);
const structureCache = new Map();
const githubMonitors = new Map();

async function structureFor(guild) {
  if (structureCache.has(guild.id)) return structureCache.get(guild.id);
  const structure = await resolveGuildStructure(guild);
  structureCache.set(guild.id, structure);
  return structure;
}

function ensureGitHubMonitor(guildId, structure) {
  const old = githubMonitors.get(guildId);
  if (old) clearInterval(old);
  const handle = startGitHubMonitor(github, structure.channels, structure.roles);
  githubMonitors.set(guildId, handle);
}

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(token);
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("[Commands] تم تسجيل أوامر السيرفر.");
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("[Commands] تم تسجيل الأوامر العامة.");
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[Ready] ${readyClient.user.tag}`);

  for (const guild of readyClient.guilds.cache.values()) {
    const structure = await resolveGuildStructure(guild).catch(() => null);
    if (structure) {
      structureCache.set(guild.id, structure);
      if (structure.channels.get("github") || structure.channels.get("builds")) {
        ensureGitHubMonitor(guild.id, structure);
      }
    }
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  const structure = await structureFor(member.guild);
  const welcome = structure.channels.get("welcome");
  if (!welcome) return;

  await welcome.send({
    embeds: [
      bodkaEmbed(
        "عضو جديد وصل",
        `حياك الله ${member} في **Bodka Core**. اقرأ القوانين ثم فعّل حسابك من قناة التحقق.`,
      ).setThumbnail(member.user.displayAvatarURL()),
    ],
  }).catch(() => null);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.inGuild()) return;

  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "تهيئة") {
        await interaction.deferReply({ ephemeral: true });
        const structure = await setupGuild(interaction.guild);
        structureCache.set(interaction.guild.id, structure);
        await publishPanels(interaction.guild, structure);
        ensureGitHubMonitor(interaction.guild.id, structure);

        await interaction.editReply(
          "✅ تم إنشاء/مزامنة هيكل Bodka كامل ونشر اللوحات. السيرفر صار مرتب بدل فوضى القنوات البشرية المعتادة 😭🔥",
        );
        return;
      }

      const structure = await structureFor(interaction.guild);

      if (interaction.commandName === "لوحات") {
        await interaction.deferReply({ ephemeral: true });
        await publishPanels(interaction.guild, structure);
        await interaction.editReply("✅ تم تحديث لوحات القوانين والتحقق والرتب والتذاكر والتحميل.");
        return;
      }

      if (interaction.commandName === "حالة") {
        await interaction.deferReply();
        const snapshot = await github.snapshot();
        await interaction.editReply({ embeds: [github.statusEmbed(snapshot)] });
        return;
      }

      if (interaction.commandName === "مستودع") {
        await interaction.reply({
          embeds: [
            bodkaEmbed(
              "المستودع الرسمي",
              `https://github.com/${BRAND.repo}\n\nهذا هو المصدر الرسمي للكود والإصدارات والتغييرات المنشورة.`,
            ),
          ],
        });
        return;
      }

      if (interaction.commandName === "بلاغ") {
        const modal = new ModalBuilder()
          .setCustomId("bodka_bug_modal")
          .setTitle("بلاغ عطل في Bodka");

        const title = new TextInputBuilder()
          .setCustomId("title")
          .setLabel("عنوان المشكلة")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(100)
          .setRequired(true);

        const version = new TextInputBuilder()
          .setCustomId("version")
          .setLabel("نسخة Bodka و Discord")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(100)
          .setRequired(true);

        const steps = new TextInputBuilder()
          .setCustomId("steps")
          .setLabel("اشرح المشكلة والخطوات")
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1600)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(title),
          new ActionRowBuilder().addComponents(version),
          new ActionRowBuilder().addComponents(steps),
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.commandName === "اقتراح") {
        const modal = new ModalBuilder()
          .setCustomId("bodka_suggestion_modal")
          .setTitle("اقتراح لـ Bodka");

        const title = new TextInputBuilder()
          .setCustomId("title")
          .setLabel("عنوان الاقتراح")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(100)
          .setRequired(true);

        const details = new TextInputBuilder()
          .setCustomId("details")
          .setLabel("اشرح فكرتك")
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1800)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(title),
          new ActionRowBuilder().addComponents(details),
        );

        await interaction.showModal(modal);
        return;
      }

      if (interaction.commandName === "تنظيف") {
        const count = interaction.options.getInteger("العدد", true);
        const deleted = await interaction.channel.bulkDelete(count, true);
        await interaction.reply({
          content: `🧹 تم حذف **${deleted.size}** رسالة.`,
          ephemeral: true,
        });
        return;
      }

      if (interaction.commandName === "مهلة") {
        const user = interaction.options.getUser("العضو", true);
        const minutes = interaction.options.getInteger("الدقائق", true);
        const reason = interaction.options.getString("السبب") || "بدون سبب مكتوب";
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.moderatable) {
          await interaction.reply({
            content: "ما أقدر أعطي هذا العضو مهلة. غالبًا رتبته أعلى من رتبة البوت.",
            ephemeral: true,
          });
          return;
        }

        await member.timeout(minutes * 60_000, reason);
        await interaction.reply({
          embeds: [
            bodkaEmbed(
              "إجراء إداري",
              `${member} أخذ مهلة **${minutes} دقيقة**.\n**السبب:** ${reason}`,
            ),
          ],
        });

        const log = structure.channels.get("modLog");
        if (log) {
          await log.send({
            embeds: [
              bodkaEmbed("سجل مهلة", `العضو: ${member}\nبواسطة: ${interaction.user}\nالمدة: ${minutes} دقيقة\nالسبب: ${reason}`),
            ],
          });
        }
        return;
      }
    }

    const structure = await structureFor(interaction.guild);

    if (interaction.isButton()) {
      if (interaction.customId === "bodka_accept_rules") {
        const role = structure.roles.get("verified");
        if (!role) {
          await interaction.reply({ content: "رتبة التحقق غير موجودة. الإدارة تحتاج تشغيل /تهيئة.", ephemeral: true });
          return;
        }

        if (interaction.member.roles.cache.has(role.id)) {
          await interaction.reply({ content: "أنت موثق أصلًا ✅", ephemeral: true });
          return;
        }

        await interaction.member.roles.add(role, "وافق على قوانين Bodka");
        await interaction.reply({ content: "✅ تم التحقق. حياك الله في مجتمع Bodka!", ephemeral: true });
        return;
      }

      if (interaction.customId === "bodka_ticket_open") {
        await openTicket(interaction, structure);
        return;
      }

      if (interaction.customId === "bodka_ticket_claim") {
        await claimTicket(interaction, structure);
        return;
      }

      if (interaction.customId === "bodka_ticket_close") {
        await closeTicket(interaction, structure);
        return;
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "bodka_self_roles") {
      const allowed = new Map(
        SELF_ROLES
          .map((r) => [r.key, structure.roles.get(r.key)])
          .filter(([, role]) => Boolean(role)),
      );

      const selected = new Set(interaction.values);

      for (const [key, role] of allowed) {
        const has = interaction.member.roles.cache.has(role.id);
        if (selected.has(key) && !has) await interaction.member.roles.add(role).catch(() => null);
        if (!selected.has(key) && has) await interaction.member.roles.remove(role).catch(() => null);
      }

      await interaction.reply({ content: "✅ تم تحديث رتبك.", ephemeral: true });
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "bodka_bug_modal") {
        await interaction.deferReply({ ephemeral: true });
        const title = interaction.fields.getTextInputValue("title");
        const version = interaction.fields.getTextInputValue("version");
        const steps = interaction.fields.getTextInputValue("steps");

        const channel = structure.channels.get("bugs");
        const embed = bodkaEmbed(`بلاغ عطل: ${truncate(title, 100)}`)
          .addFields(
            { name: "النسخة", value: truncate(version, 300) },
            { name: "التفاصيل", value: truncate(steps, 1800) },
            { name: "المرسل", value: `${interaction.user}` },
          );

        let githubIssue = null;
        try {
          githubIssue = await github.createBugIssue({
            title,
            body: `**النسخة:** ${version}\n\n**التفاصيل:**\n${steps}`,
            reporter: interaction.user.tag,
          });
        } catch (error) {
          console.error("[GitHub issue]", error.message);
        }

        if (githubIssue?.html_url) {
          embed.addFields({ name: "GitHub Issue", value: `[فتح #${githubIssue.number}](${githubIssue.html_url})` });
        }

        if (channel) {
          const msg = await channel.send({ embeds: [embed] });
          await msg.startThread({
            name: `متابعة: ${truncate(title, 70)}`,
            autoArchiveDuration: 1440,
          }).catch(() => null);
        }

        await interaction.editReply(
          githubIssue
            ? `✅ تم تسجيل البلاغ وإنشاء GitHub Issue #${githubIssue.number}.`
            : "✅ تم تسجيل البلاغ داخل السيرفر.",
        );
        return;
      }

      if (interaction.customId === "bodka_suggestion_modal") {
        await interaction.deferReply({ ephemeral: true });
        const title = interaction.fields.getTextInputValue("title");
        const details = interaction.fields.getTextInputValue("details");
        const channel = structure.channels.get("suggestions");

        if (channel) {
          const msg = await channel.send({
            embeds: [
              bodkaEmbed(`اقتراح: ${truncate(title, 100)}`)
                .setDescription(truncate(details, 1800))
                .addFields({ name: "المرسل", value: `${interaction.user}` }),
            ],
          });
          await msg.react("👍").catch(() => null);
          await msg.react("👎").catch(() => null);
          await msg.startThread({
            name: `نقاش: ${truncate(title, 70)}`,
            autoArchiveDuration: 1440,
          }).catch(() => null);
        }

        await interaction.editReply("✅ تم نشر اقتراحك للتصويت والنقاش.");
        return;
      }
    }
  } catch (error) {
    console.error("[Interaction]", error);
    if (interaction.isRepliable()) {
      const payload = { content: "صار خطأ أثناء تنفيذ الطلب. تم تسجيله في Console.", ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  }
});

await registerCommands();
await client.login(token);
