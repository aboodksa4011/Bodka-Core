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
    neutralizeMassMentions: {
        description: "حول everyone و here لنص عادي عشان ما تزعج السيرفر بالغلط",
        type: OptionType.BOOLEAN,
        default: true,
    },
    warnManyPeople: {
        description: "نبه اذا الرسالة فيها منشنات كثيرة",
        type: OptionType.BOOLEAN,
        default: true,
    },
    threshold: {
        description: "عدد المنشنات اللي بعدها يطلع تنبيه",
        type: OptionType.SLIDER,
        markers: [3, 5, 8, 12, 20],
        default: 5,
        stickToMarkers: true,
    },
});

export default definePlugin({
    name: "BodkaMentionGuard",
    description: "يمنع منشن everyone و here بالغلط وينبهك من الرسائل اللي فيها منشنات كثيرة",
    authors: [Devs.BodkaCore],
    tags: ["Chat", "Privacy"],
    settings,
    enabledByDefault: true,
    onBeforeMessageSend(_, message) {
        let changed = false;
        if (settings.store.neutralizeMassMentions) {
            const next = message.content.replace(/@(everyone|here)\b/gi, "@$1\u200b");
            changed = next !== message.content;
            message.content = next;
        }

        const mentionCount = message.content.match(/<@!?\d+>/g)?.length ?? 0;
        if (changed)
            showToast("حولنا المنشن العام لنص عادي", Toasts.Type.SUCCESS);
        else if (settings.store.warnManyPeople && mentionCount >= settings.store.threshold)
            showToast(`انتبه رسالتك فيها ${mentionCount} منشن`, Toasts.Type.MESSAGE);
    },
});
