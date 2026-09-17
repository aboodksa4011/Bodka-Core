import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import { STAFF_ROLE_KEYS } from "../config/server.js";
import { bodkaEmbed } from "./embeds.js";

function safeName(name) {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "عضو";
}

export async function openTicket(interaction, structure) {
  const { guild, member } = interaction;
  const { categories, roles } = structure;

  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic?.includes(`ticket-owner:${member.id}`),
  );

  if (existing) {
    return interaction.reply({
      content: `عندك تذكرة مفتوحة بالفعل: ${existing}`,
      ephemeral: true,
    });
  }

  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
      ],
    },
    ...STAFF_ROLE_KEYS
      .map((key) => roles.get(key))
      .filter(Boolean)
      .map((role) => ({
        id: role.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      })),
  ];

  const channel = await guild.channels.create({
    name: `تذكرة-${safeName(member.user.username)}`,
    type: ChannelType.GuildText,
    parent: categories.get("tickets")?.id,
    topic: `ticket-owner:${member.id}`,
    permissionOverwrites: overwrites,
    reason: `تذكرة دعم لـ ${member.user.tag}`,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bodka_ticket_claim")
      .setLabel("استلام التذكرة")
      .setEmoji("🙋")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("bodka_ticket_close")
      .setLabel("إغلاق التذكرة")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger),
  );

  await channel.send({
    content: `${member}`,
    embeds: [
      bodkaEmbed(
        "تم فتح التذكرة",
        "اكتب مشكلتك بالتفصيل. لا ترسل أي كلمة مرور أو Token أو معلومات حساسة. فريق الدعم سيرد عليك هنا.",
      ),
    ],
    components: [row],
  });

  await interaction.reply({
    content: `تم فتح تذكرتك: ${channel}`,
    ephemeral: true,
  });
}

export async function claimTicket(interaction, structure) {
  const staffIds = STAFF_ROLE_KEYS.map((key) => structure.roles.get(key)?.id).filter(Boolean);
  const isStaff = interaction.member.roles.cache.some((r) => staffIds.includes(r.id));

  if (!isStaff) {
    return interaction.reply({ content: "هذا الزر لفريق الدعم والإدارة فقط.", ephemeral: true });
  }

  await interaction.reply({
    embeds: [bodkaEmbed("تم استلام التذكرة", `${interaction.member} استلم هذه التذكرة وسيتابعها.`)],
  });
}

export async function closeTicket(interaction, structure) {
  const ownerId = interaction.channel.topic?.match(/ticket-owner:(\d+)/)?.[1];
  const staffIds = STAFF_ROLE_KEYS.map((key) => structure.roles.get(key)?.id).filter(Boolean);
  const isStaff = interaction.member.roles.cache.some((r) => staffIds.includes(r.id));
  const isOwner = ownerId === interaction.user.id;

  if (!isStaff && !isOwner) {
    return interaction.reply({ content: "ما عندك صلاحية لإغلاق هذه التذكرة.", ephemeral: true });
  }

  await interaction.reply({
    embeds: [bodkaEmbed("إغلاق التذكرة", "سيتم حذف القناة بعد 5 ثوانٍ.")],
  });

  setTimeout(() => {
    interaction.channel.delete(`إغلاق تذكرة بواسطة ${interaction.user.tag}`).catch(() => null);
  }, 5000);
}
