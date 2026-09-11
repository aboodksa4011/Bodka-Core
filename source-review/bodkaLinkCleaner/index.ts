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
    cleanKnownTracking: {
        description: "شيل وسوم التتبع المعروفة من الروابط قبل الارسال",
        type: OptionType.BOOLEAN,
        default: true,
    },
    keepYoutubeShareId: {
        description: "خل باراميتر si بروابط يوتيوب اذا تحتاجه للمشاركة",
        type: OptionType.BOOLEAN,
        default: false,
    },
});

const TRACKERS = new Set(["fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid", "igshid", "vero_id", "wickedid", "oly_anon_id", "oly_enc_id"]);

function cleanUrl(raw: string) {
    const trailing = raw.match(/[.,!?;:)\]}]+$/)?.[0] ?? "";
    const candidate = trailing ? raw.slice(0, -trailing.length) : raw;

    try {
        const url = new URL(candidate);
        if (url.protocol !== "https:" && url.protocol !== "http:") return raw;

        let changed = false;
        for (const key of [...url.searchParams.keys()]) {
            const lower = key.toLowerCase();
            if (lower.startsWith("utm_") || TRACKERS.has(lower) || (lower === "si" && !settings.store.keepYoutubeShareId)) {
                url.searchParams.delete(key);
                changed = true;
            }
        }

        return changed ? `${url.toString()}${trailing}` : raw;
    } catch {
        return raw;
    }
}

export default definePlugin({
    name: "BodkaLinkCleaner",
    description: "ينظف وسوم التتبع المعروفة من الروابط قبل ارسالها ويحافظ على الرابط نفسه",
    authors: [Devs.BodkaCore],
    tags: ["Chat", "Privacy", "Utility"],
    settings,
    enabledByDefault: true,
    onBeforeMessageSend(_, message) {
        if (!settings.store.cleanKnownTracking) return;
        const next = message.content.replace(/https?:\/\/[^\s<>'"`]+/gi, cleanUrl);
        if (next === message.content) return;
        message.content = next;
        showToast("نظفنا التتبع من الرابط", Toasts.Type.SUCCESS);
    },
});
