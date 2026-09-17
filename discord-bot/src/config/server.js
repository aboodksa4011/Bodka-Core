import { ChannelType, PermissionFlagsBits } from "discord.js";

export const BRAND = {
  name: "Bodka Core",
  arabicName: "بودكا كور",
  emoji: "🟣",
  repo: process.env.GITHUB_REPO || "aboodksa4011/Bodka-Core",
  color: Number.parseInt(process.env.BRAND_COLOR || "8B5CF6", 16),
};

export const ROLE_DEFS = [
  { key: "founder", name: "👑・المؤسس", color: 0xf5c542, hoist: true, permissions: [PermissionFlagsBits.Administrator] },
  { key: "cofounder", name: "⚜️・الشريك المؤسس", color: 0xe9b949, hoist: true, permissions: [PermissionFlagsBits.Administrator] },
  { key: "coreDev", name: "🧠・مطور النواة", color: 0x8b5cf6, hoist: true, permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ManageWebhooks] },
  { key: "pluginDev", name: "🧩・مطور إضافة", color: 0x6366f1, hoist: true, permissions: [PermissionFlagsBits.ManageThreads] },
  { key: "admin", name: "🛡️・الإدارة", color: 0xef4444, hoist: true, permissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ViewAuditLog] },
  { key: "moderator", name: "🔨・المشرف", color: 0xf97316, hoist: true, permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads, PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewAuditLog] },
  { key: "support", name: "🎫・الدعم الفني", color: 0x14b8a6, hoist: true, permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageThreads] },
  { key: "beta", name: "🧪・مختبر بيتا", color: 0x06b6d4, hoist: false, permissions: [] },
  { key: "contributor", name: "✨・مساهم", color: 0x22c55e, hoist: false, permissions: [] },
  { key: "communityDev", name: "💻・مطور مجتمع", color: 0x3b82f6, hoist: false, permissions: [] },
  { key: "releasePing", name: "🔔・إشعارات الإصدارات", color: 0x9333ea, hoist: false, permissions: [] },
  { key: "buildPing", name: "🏗️・إشعارات البناء", color: 0x0ea5e9, hoist: false, permissions: [] },
  { key: "githubPing", name: "🐙・إشعارات GitHub", color: 0x64748b, hoist: false, permissions: [] },
  { key: "verified", name: "✅・عضو موثق", color: 0x10b981, hoist: false, permissions: [] },
];

export const RULES = [
  ["الاحترام أولًا", "ممنوع السب، التنمر، العنصرية، التحرش، الاستفزاز المتعمد أو التقليل من الآخرين."],
  ["لا سبام ولا إزعاج", "ممنوع تكرار الرسائل، المنشن الجماعي بلا سبب، الإعلانات العشوائية أو إغراق القنوات."],
  ["حافظ على أمان المجتمع", "ممنوع نشر ملفات خبيثة، روابط تصيد، Tokens، Cookies، كلمات مرور أو أي بيانات حساسة."],
  ["استخدم القناة المناسبة", "الدعم في قنوات الدعم، التطوير في قنوات التطوير، والحديث العام في القنوات العامة."],
  ["لا تنتحل شخصية أحد", "ممنوع انتحال الإدارة أو المطورين أو أعضاء المشروع أو استخدام أسماء توحي بصلاحيات غير حقيقية."],
  ["احترم الخصوصية", "لا تنشر معلومات شخصية أو محادثات خاصة أو بيانات أعضاء بدون إذن واضح."],
  ["تقارير الأعطال تكون مفيدة", "اذكر نسخة Bodka وDiscord والخطوات التي سبقت المشكلة. احذف أي أسرار من السجلات قبل رفعها."],
  ["احترم التراخيص والمصادر", "لا تنسب كود أو Plugin لنفسك إذا لم تكتبه، واحترم تراخيص المشاريع التي يعتمد عليها Bodka."],
  ["طلبات الدعم بهدوء", "لا تكرر فتح التذاكر لنفس المشكلة. التذكرة الواحدة تكفي."],
  ["قرارات الإدارة قابلة للمراجعة", "إذا عندك اعتراض افتح تذكرة واشرحه باحترام. النقاش العام حول العقوبات لن يحل المشكلة."],
];

export const CATEGORIES = [
  { key: "start", name: "━━━「 🚪 البداية 」━━━", access: "public" },
  { key: "bodka", name: "━━━「 🟣 بودكا كور 」━━━", access: "verified" },
  { key: "support", name: "━━━「 🎫 الدعم والمساعدة 」━━━", access: "verified" },
  { key: "dev", name: "━━━「 💻 التطوير و GitHub 」━━━", access: "verified" },
  { key: "community", name: "━━━「 💬 المجتمع 」━━━", access: "verified" },
  { key: "voice", name: "━━━「 🎙️ الصوتيات 」━━━", access: "verified" },
  { key: "tickets", name: "━━━「 📩 التذاكر النشطة 」━━━", access: "staff" },
  { key: "staff", name: "━━━「 🔒 الإدارة 」━━━", access: "staff" },
];

export const CHANNELS = [
  { key: "welcome", category: "start", name: "👋・الترحيب", type: ChannelType.GuildText, topic: "ابدأ من هنا وتعرّف على مجتمع Bodka Core." },
  { key: "rules", category: "start", name: "📜・القوانين", type: ChannelType.GuildText, topic: "قوانين سيرفر Bodka Core والموافقة عليها." },
  { key: "verify", category: "start", name: "✅・التحقق", type: ChannelType.GuildText, topic: "اضغط زر الموافقة للوصول لبقية السيرفر." },
  { key: "roles", category: "start", name: "🎭・اختيار-الرتب", type: ChannelType.GuildText, topic: "اختر اهتماماتك وإشعاراتك." },
  { key: "announcements", category: "start", name: "📢・الإعلانات", type: ChannelType.GuildText, topic: "الإعلانات الرسمية للمشروع والسيرفر." },
  { key: "downloads", category: "bodka", name: "⬇️・تحميل-بودكا", type: ChannelType.GuildText, topic: "روابط التحميل الرسمية فقط." },
  { key: "releases", category: "bodka", name: "🚀・الإصدارات", type: ChannelType.GuildText, topic: "آخر إصدارات Bodka Core." },
  { key: "changelog", category: "bodka", name: "📝・سجل-التغييرات", type: ChannelType.GuildText, topic: "ما الذي تغيّر في كل إصدار." },
  { key: "roadmap", category: "bodka", name: "🗺️・خارطة-الطريق", type: ChannelType.GuildText, topic: "المميزات والخطط القادمة." },
  { key: "status", category: "bodka", name: "📊・حالة-بودكا", type: ChannelType.GuildText, topic: "حالة المستودع والبناء والخدمات." },
  { key: "supportChat", category: "support", name: "🆘・الدعم-الفني", type: ChannelType.GuildText, topic: "أسئلة ومساعدة عامة عن Bodka." },
  { key: "ticketOpen", category: "support", name: "🎫・افتح-تذكرة", type: ChannelType.GuildText, topic: "تذكرة خاصة مع فريق الدعم." },
  { key: "bugs", category: "support", name: "🐛・تقارير-الأعطال", type: ChannelType.GuildText, topic: "بلاغات الأعطال المنظمة." },
  { key: "suggestions", category: "support", name: "💡・الاقتراحات", type: ChannelType.GuildText, topic: "اقتراحات المجتمع." },
  { key: "features", category: "support", name: "✨・طلبات-الميزات", type: ChannelType.GuildText, topic: "أفكار المميزات الجديدة." },
  { key: "devChat", category: "dev", name: "💻・دردشة-المطورين", type: ChannelType.GuildText, topic: "نقاش تقني حول Bodka وتطوير الإضافات." },
  { key: "github", category: "dev", name: "🐙・تحديثات-github", type: ChannelType.GuildText, topic: "Commits وIssues وPull Requests من GitHub." },
  { key: "prs", category: "dev", name: "🔀・طلبات-السحب", type: ChannelType.GuildText, topic: "متابعة Pull Requests." },
  { key: "issues", category: "dev", name: "📌・مشاكل-github", type: ChannelType.GuildText, topic: "متابعة GitHub Issues." },
  { key: "builds", category: "dev", name: "🏗️・حالة-البناء", type: ChannelType.GuildText, topic: "GitHub Actions وحالة البناء." },
  { key: "betaBuilds", category: "dev", name: "🧪・نسخ-بيتا", type: ChannelType.GuildText, topic: "نسخ الاختبار وملاحظات المختبرين." },
  { key: "general", category: "community", name: "💬・العام", type: ChannelType.GuildText, topic: "الدردشة العامة لمجتمع Bodka." },
  { key: "showcase", category: "community", name: "🎨・استعراضات", type: ChannelType.GuildText, topic: "شارك تخصيصاتك وثيماتك وإضافاتك." },
  { key: "media", category: "community", name: "📸・وسائط", type: ChannelType.GuildText, topic: "صور ومقاطع مرتبطة بالمشروع." },
  { key: "offtopic", category: "community", name: "🗯️・خارج-الموضوع", type: ChannelType.GuildText, topic: "الدردشة غير المرتبطة بالمشروع." },
  { key: "botCommands", category: "community", name: "🤖・أوامر-البوت", type: ChannelType.GuildText, topic: "جرّب أوامر Bodka Bot هنا." },
  { key: "voiceGeneral", category: "voice", name: "🔊・المجلس العام", type: ChannelType.GuildVoice },
  { key: "voiceDev", category: "voice", name: "💻・غرفة المطورين", type: ChannelType.GuildVoice },
  { key: "voiceSupport", category: "voice", name: "🎫・الدعم الصوتي", type: ChannelType.GuildVoice },
  { key: "staffChat", category: "staff", name: "🛡️・دردشة-الإدارة", type: ChannelType.GuildText, topic: "قناة داخلية للإدارة." },
  { key: "modLog", category: "staff", name: "📚・سجل-الإدارة", type: ChannelType.GuildText, topic: "سجل إجراءات البوت والإدارة." },
  { key: "privateReports", category: "staff", name: "🚨・تقارير-خاصة", type: ChannelType.GuildText, topic: "تقارير حساسة لا تظهر للعامة." },
  { key: "internalReleases", category: "staff", name: "🔐・إصدارات-داخلية", type: ChannelType.GuildText, topic: "تنسيق الإصدارات قبل النشر." },
];

export const SELF_ROLES = [
  { key: "beta", label: "مختبر بيتا", description: "الوصول لمجتمع الاختبار وملاحظات البيتا", emoji: "🧪" },
  { key: "communityDev", label: "مطور مجتمع", description: "للمهتمين بتطوير Plugins وأدوات Bodka", emoji: "💻" },
  { key: "releasePing", label: "إشعارات الإصدارات", description: "منشن عند نزول إصدار جديد", emoji: "🔔" },
  { key: "buildPing", label: "إشعارات البناء", description: "منشن عند تغير حالة البناء", emoji: "🏗️" },
  { key: "githubPing", label: "إشعارات GitHub", description: "منشن لأهم تحديثات المستودع", emoji: "🐙" },
];

export const STAFF_ROLE_KEYS = ["founder", "cofounder", "admin", "moderator", "support", "coreDev"];
