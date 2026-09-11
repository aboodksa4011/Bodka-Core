/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { showToast, Toasts } from "@webpack/common";

const settings = definePluginSettings({
    protectDiscordTokens: {
        description: "اخف رموز دخول دسكورد لو انلصقت بالغلط",
        type: OptionType.BOOLEAN,
        default: true,
    },
    protectApiKeys: {
        description: "اخف مفاتيح الذكاء الاصطناعي والخدمات المعروفة",
        type: OptionType.BOOLEAN,
        default: true,
    },
    protectWebhooks: {
        description: "اخف روابط ويب هوك دسكورد",
        type: OptionType.BOOLEAN,
        default: true,
    },
});

const REDACTED = "[مخفي بواسطة درع بودكا]";

export default definePlugin({
    name: "BodkaPrivacyShield",
    description: "درع محلي يمنع ارسال رموز الدخول ومفاتيح الخدمات وروابط الويب هوك بالغلط",
    authors: [Devs.BodkaCore],
    tags: ["Privacy", "Chat"],
    settings,
    enabledByDefault: true,
    onBeforeMessageSend(_, message) {
        let next = message.content;

        if (settings.store.protectDiscordTokens)
            next = next.replace(/\b(?:mfa\.[\w-]{20,}|[\w-]{24}\.[\w-]{6}\.[\w-]{20,})\b/g, REDACTED);
        if (settings.store.protectApiKeys)
            next = next.replace(/\b(?:sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{20,}|AQ\.[A-Za-z0-9_.\\/-]{16,}|gsk_[A-Za-z0-9_-]{20,}|xai-[A-Za-z0-9_-]{20,})\b/g, REDACTED);
        if (settings.store.protectWebhooks)
            next = next.replace(/https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/gi, REDACTED);

        if (next !== message.content) {
            message.content = next;
            showToast("درع بودكا شال معلومة حساسة من الرسالة", Toasts.Type.SUCCESS);
        }
    },
});
