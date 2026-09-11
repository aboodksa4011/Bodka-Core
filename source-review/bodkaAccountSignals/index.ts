/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addProfileBadge, BadgePosition, ProfileBadge, removeProfileBadge } from "@api/Badges";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const DISCORD_EPOCH = 1420070400000n;
const YEAR_MS = 365.2425 * 24 * 60 * 60 * 1000;

const settings = definePluginSettings({
    minimumAge: {
        description: "اقل عمر للحساب عشان تظهر الاشارة",
        type: OptionType.SELECT,
        options: [
            { label: "ثلاث سنوات", value: 3 },
            { label: "خمس سنوات", value: 5, default: true },
            { label: "ثمان سنوات", value: 8 },
        ],
    },
    showCreationYear: {
        description: "اظهر سنة فتح الحساب في وصف الاشارة",
        type: OptionType.BOOLEAN,
        default: true,
    },
});

function accountCreatedAt(userId: string) {
    try {
        return Number((BigInt(userId) >> 22n) + DISCORD_EPOCH);
    } catch {
        return 0;
    }
}

function icon(color: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#f3cf72"/></linearGradient></defs><path fill="url(#g)" d="M12 2l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/><circle cx="12" cy="12" r="2.2" fill="#fff"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const badge: ProfileBadge = {
    id: "bodka-account-signal",
    position: BadgePosition.START,
    getBadges({ userId }) {
        const created = accountCreatedAt(userId);
        if (!created) return [];

        const years = (Date.now() - created) / YEAR_MS;
        if (years < settings.store.minimumAge) return [];

        const createdYear = new Date(created).getFullYear();
        const suffix = settings.store.showCreationYear ? ` من سنة ${createdYear}` : "";
        if (years >= 10) return [{ id: "bodka-account-legend", description: `حساب اسطوري قديم${suffix}`, iconSrc: icon("#f1b84b") }];
        if (years >= 8) return [{ id: "bodka-account-rare", description: `حساب نادر وقديم${suffix}`, iconSrc: icon("#9d6cff") }];
        return [{ id: "bodka-account-veteran", description: `حساب قديم${suffix}`, iconSrc: icon("#20b486") }];
    },
};

export default definePlugin({
    name: "BodkaAccountSignals",
    description: "يحلل عمر الحساب محليا ويظهر اشارة بودكا للحسابات القديمة والنادرة بدون تزوير بادجات دسكورد",
    authors: [Devs.BodkaCore],
    tags: ["Utility", "Appearance"],
    settings,
    enabledByDefault: true,
    start: () => addProfileBadge(badge),
    stop: () => removeProfileBadge(badge),
});
