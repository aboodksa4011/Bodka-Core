import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export const commands = [
  new SlashCommandBuilder()
    .setName("تهيئة")
    .setDescription("إنشاء أو مزامنة سيرفر Bodka كامل")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("لوحات")
    .setDescription("إعادة نشر أو تحديث لوحات Bodka")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("حالة")
    .setDescription("عرض حالة Bodka Core من GitHub"),

  new SlashCommandBuilder()
    .setName("مستودع")
    .setDescription("عرض رابط مستودع Bodka Core الرسمي"),

  new SlashCommandBuilder()
    .setName("بلاغ")
    .setDescription("إرسال بلاغ عطل منظم"),

  new SlashCommandBuilder()
    .setName("اقتراح")
    .setDescription("إرسال اقتراح للمشروع أو السيرفر"),

  new SlashCommandBuilder()
    .setName("تنظيف")
    .setDescription("حذف عدد من الرسائل الحديثة")
    .addIntegerOption((o) =>
      o.setName("العدد").setDescription("من 1 إلى 100").setMinValue(1).setMaxValue(100).setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("مهلة")
    .setDescription("إعطاء عضو مهلة مؤقتة")
    .addUserOption((o) => o.setName("العضو").setDescription("العضو").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("الدقائق").setDescription("مدة المهلة بالدقائق").setMinValue(1).setMaxValue(10080).setRequired(true),
    )
    .addStringOption((o) => o.setName("السبب").setDescription("سبب الإجراء").setMaxLength(300))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
].map((c) => c.toJSON());
