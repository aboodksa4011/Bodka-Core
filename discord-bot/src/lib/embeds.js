import { EmbedBuilder } from "discord.js";
import { BRAND } from "../config/server.js";

export function bodkaEmbed(title, description = "") {
  return new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle(`${BRAND.emoji} ${title}`)
    .setDescription(description)
    .setFooter({ text: "Bodka Core • بودكا كور" })
    .setTimestamp();
}

export function truncate(text, max = 1000) {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
