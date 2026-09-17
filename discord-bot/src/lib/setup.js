import {
  ChannelType,
  PermissionFlagsBits,
  OverwriteType,
} from "discord.js";
import {
  CATEGORIES,
  CHANNELS,
  ROLE_DEFS,
  STAFF_ROLE_KEYS,
} from "../config/server.js";

function rolePermissions(def) {
  return def.permissions || [];
}

async function ensureRole(guild, def) {
  let role = guild.roles.cache.find((r) => r.name === def.name);
  if (!role) {
    role = await guild.roles.create({
      name: def.name,
      color: def.color,
      hoist: def.hoist,
      mentionable: false,
      permissions: rolePermissions(def),
      reason: "Bodka setup",
    });
  } else {
    await role.edit({
      color: def.color,
      hoist: def.hoist,
      permissions: rolePermissions(def),
      reason: "Bodka sync",
    }).catch(() => null);
  }
  return role;
}

function permissionOverwritesForCategory(guild, access, roles) {
  const everyone = guild.roles.everyone;

  if (access === "public") {
    return [
      {
        id: everyone.id,
        type: OverwriteType.Role,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      },
    ];
  }

  if (access === "verified") {
    const verified = roles.get("verified");
    return [
      {
        id: everyone.id,
        type: OverwriteType.Role,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      ...(verified ? [{
        id: verified.id,
        type: OverwriteType.Role,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      }] : []),
      ...STAFF_ROLE_KEYS
        .map((key) => roles.get(key))
        .filter(Boolean)
        .map((role) => ({
          id: role.id,
          type: OverwriteType.Role,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
        })),
    ];
  }

  return [
    {
      id: everyone.id,
      type: OverwriteType.Role,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    ...STAFF_ROLE_KEYS
      .map((key) => roles.get(key))
      .filter(Boolean)
      .map((role) => ({
        id: role.id,
        type: OverwriteType.Role,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      })),
  ];
}

async function ensureCategory(guild, def, roles) {
  let category = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === def.name,
  );

  const permissionOverwrites = permissionOverwritesForCategory(guild, def.access, roles);

  if (!category) {
    category = await guild.channels.create({
      name: def.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites,
      reason: "Bodka setup",
    });
  } else {
    await category.permissionOverwrites.set(permissionOverwrites, "Bodka sync").catch(() => null);
  }

  return category;
}

async function ensureChannel(guild, def, categories, roles) {
  const parent = categories.get(def.category);
  let channel = guild.channels.cache.find(
    (c) => c.name === def.name && c.type === def.type,
  );

  if (!channel) {
    channel = await guild.channels.create({
      name: def.name,
      type: def.type,
      parent: parent?.id,
      topic: def.topic,
      reason: "Bodka setup",
    });
  } else {
    const edits = {};
    if (parent && channel.parentId !== parent.id) edits.parent = parent.id;
    if ("topic" in def && def.topic !== undefined && channel.isTextBased()) edits.topic = def.topic;
    if (Object.keys(edits).length) await channel.edit(edits).catch(() => null);
  }

  if (def.key === "rules" || def.key === "verify" || def.key === "roles" || def.key === "announcements") {
    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false,
      AddReactions: false,
      CreatePublicThreads: false,
      CreatePrivateThreads: false,
    }).catch(() => null);
  }

  if (def.key === "welcome") {
    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false,
    }).catch(() => null);
  }

  if (def.category === "dev") {
    for (const key of ["coreDev", "pluginDev", "communityDev"]) {
      const role = roles.get(key);
      if (role) {
        await channel.permissionOverwrites.edit(role, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          CreatePublicThreads: true,
        }).catch(() => null);
      }
    }
  }

  return channel;
}

export async function setupGuild(guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const roles = new Map();
  for (const def of ROLE_DEFS) {
    const role = await ensureRole(guild, def);
    roles.set(def.key, role);
  }

  const categories = new Map();
  for (const def of CATEGORIES) {
    const category = await ensureCategory(guild, def, roles);
    categories.set(def.key, category);
  }

  const channels = new Map();
  for (const def of CHANNELS) {
    const channel = await ensureChannel(guild, def, categories, roles);
    channels.set(def.key, channel);
  }

  const ticketCategory = categories.get("tickets");
  if (ticketCategory) {
    await ticketCategory.permissionOverwrites.edit(guild.roles.everyone, {
      ViewChannel: false,
    }).catch(() => null);
  }

  const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
  if (owner && roles.get("founder")) {
    await owner.roles.add(roles.get("founder"), "مالك سيرفر Bodka").catch(() => null);
  }

  return { roles, categories, channels };
}

export async function resolveGuildStructure(guild) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const roles = new Map();
  for (const def of ROLE_DEFS) {
    const role = guild.roles.cache.find((r) => r.name === def.name);
    if (role) roles.set(def.key, role);
  }

  const categories = new Map();
  for (const def of CATEGORIES) {
    const category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === def.name,
    );
    if (category) categories.set(def.key, category);
  }

  const channels = new Map();
  for (const def of CHANNELS) {
    const channel = guild.channels.cache.find(
      (c) => c.type === def.type && c.name === def.name,
    );
    if (channel) channels.set(def.key, channel);
  }

  return { roles, categories, channels };
}
