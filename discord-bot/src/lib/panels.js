import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";
import { BRAND, RULES, SELF_ROLES } from "../config/server.js";
import { bodkaEmbed } from "./embeds.js";

async function upsertPanel(channel, marker, payload) {
  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
  const old = messages?.find((m) =>
    m.author?.id === channel.client.user.id &&
    m.embeds?.some((e) => e.footer?.text?.includes(marker)),
  );

  if (old) {
    await old.edit(payload).catch(() => null);
    return old;
  }

  return channel.send(payload);
}

export async function publishPanels(guild, structure) {
  const { channels } = structure;

  if (channels.get("welcome")) {
    const embed = bodkaEmbed(
      "حياك الله في مجتمع Bodka Core",
      [
        "هذا السيرفر مخصص لمشروع **بودكا كور**: الإصدارات، الدعم، التطوير، الإضافات، الاختبارات وربط GitHub.",
        "",
        "ابدأ من **القوانين** ثم انتقل إلى **التحقق**. بعد الموافقة تنفتح لك بقية أقسام السيرفر.",
        "",
        `المستودع الرسمي: https://github.com/${BRAND.repo}`,
      ].join("\n"),
    ).setFooter({ text: "Bodka • لوحة الترحيب v1" });

    await upsertPanel(channels.get("welcome"), "لوحة الترحيب", { embeds: [embed] });
  }

  if (channels.get("rules")) {
    const embed = bodkaEmbed(
      "قوانين مجتمع Bodka Core",
      RULES.map(([title, text], i) => `**${i + 1}. ${title}**\n${text}`).join("\n\n"),
    ).setFooter({ text: "Bodka • لوحة القوانين v1" });

    await upsertPanel(channels.get("rules"), "لوحة القوانين", { embeds: [embed] });
  }

  if (channels.get("verify")) {
    const embed = bodkaEmbed(
      "التحقق والموافقة",
      "بالضغط على الزر فأنت تؤكد أنك قرأت القوانين وتوافق على الالتزام بها. بعدها تحصل على رتبة **عضو موثق** وتفتح لك أقسام السيرفر.",
    ).setFooter({ text: "Bodka • لوحة التحقق v1" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("bodka_accept_rules")
        .setLabel("أوافق على القوانين")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
    );

    await upsertPanel(channels.get("verify"), "لوحة التحقق", {
      embeds: [embed],
      components: [row],
    });
  }

  if (channels.get("roles")) {
    const embed = bodkaEmbed(
      "اختر رتبك واهتماماتك",
      "تقدر تضيف أو تشيل الرتب من القائمة في أي وقت. الرتب هنا اهتمامات وإشعارات فقط، وليست صلاحيات إدارية.",
    ).setFooter({ text: "Bodka • لوحة الرتب v1" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("bodka_self_roles")
      .setPlaceholder("اختر الرتب التي تناسبك")
      .setMinValues(0)
      .setMaxValues(SELF_ROLES.length)
      .addOptions(
        SELF_ROLES.map((x) => ({
          label: x.label,
          description: x.description,
          emoji: x.emoji,
          value: x.key,
        })),
      );

    const row = new ActionRowBuilder().addComponents(menu);
    await upsertPanel(channels.get("roles"), "لوحة الرتب", {
      embeds: [embed],
      components: [row],
    });
  }

  if (channels.get("ticketOpen")) {
    const embed = bodkaEmbed(
      "نظام الدعم الخاص",
      [
        "إذا مشكلتك تحتاج ملفات، سجلات، معلومات حساب أو متابعة خاصة، افتح تذكرة.",
        "",
        "قبل فتح التذكرة:",
        "• اذكر نسخة Bodka وDiscord.",
        "• لا ترسل Tokens أو كلمات مرور أو Cookies.",
        "• لا تفتح أكثر من تذكرة لنفس المشكلة.",
      ].join("\n"),
    ).setFooter({ text: "Bodka • لوحة التذاكر v1" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("bodka_ticket_open")
        .setLabel("فتح تذكرة")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary),
    );

    await upsertPanel(channels.get("ticketOpen"), "لوحة التذاكر", {
      embeds: [embed],
      components: [row],
    });
  }

  if (channels.get("downloads")) {
    const embed = bodkaEmbed(
      "تحميل Bodka Core",
      [
        "حمّل Bodka Core فقط من المصدر الرسمي.",
        "",
        `**GitHub:** https://github.com/${BRAND.repo}`,
        "",
        "أي ملف يتم تداوله خارج المصدر الرسمي استخدمه على مسؤوليتك، ولا تثق بملفات تطلب منك Token أو تسجيل دخول Discord.",
      ].join("\n"),
    ).setFooter({ text: "Bodka • لوحة التحميل v1" });

    await upsertPanel(channels.get("downloads"), "لوحة التحميل", { embeds: [embed] });
  }
}
