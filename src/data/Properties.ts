import {PermissionFlagsBits} from "discord.js";
import {readFileSync} from "node:fs";
import {ClientProperties} from "./Types";
import {parse} from "yaml";

const invitePermissions = [
    PermissionFlagsBits.SendMessagesInThreads,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ManageThreads,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.EmbedLinks
].reduce((a, b) => a + b);

const properties = parse(readFileSync("Properties.yaml", "utf8")) as ClientProperties;
properties.invitePermissions = invitePermissions;

export default properties;