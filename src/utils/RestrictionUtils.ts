import Properties from "../data/Properties";
import Guild from "../database/models/Guild.model";

import {GuildMember} from "discord.js";

export enum RestrictionLevel {
    Public = 0,
    Reviewer = 1,
    Administrator = 2,
    Owner = 3,
    Developer = 4
}

export default class RestrictionUtils {
    public static async getRestrictionLabel(member: GuildMember): Promise<string> {
        if (this.isDeveloper(member.id)) return "Developer";
        if (this.isOwner(member)) return "Owner";
        if (await this.isAdministrator(member)) return "Administrator";
        if (await this.isReviewer(member)) return "Reviewer";

        return "Public";
    }

    public static async getRestrictionLevel(member: GuildMember): Promise<number> {
        if (this.isDeveloper(member.id)) return RestrictionLevel.Developer;
        if (this.isOwner(member)) return RestrictionLevel.Owner;
        if (await this.isAdministrator(member)) return RestrictionLevel.Administrator;
        if (await this.isReviewer(member)) return RestrictionLevel.Reviewer;

        return RestrictionLevel.Public;
    }

    public static async verifyAccess(level: RestrictionLevel, member: GuildMember): Promise<boolean> {
        switch (level) {
            case RestrictionLevel.Public:
                return true;
            case RestrictionLevel.Reviewer:
                return await this.isReviewer(member);
            case RestrictionLevel.Administrator:
                return await this.isAdministrator(member);
            case RestrictionLevel.Owner:
                return this.isOwner(member);
            case RestrictionLevel.Developer:
                return this.isDeveloper(member.id);
            default:
                return false;
        }
    }

    public static async isReviewer(member: GuildMember): Promise<boolean> {
        const guild = await Guild.findOne(
            {_id: member.guild.id},
            {["roles.reviewer"]: 1, _id: 0}
        );

        const reviewerRole = guild?.roles.reviewer;

        if (
            (reviewerRole && member.roles.cache.has(reviewerRole)) ||
            member.permissions.has("ModerateMembers")
            ) return true;

        return await this.isAdministrator(member);
    }

    public static async isAdministrator(member: GuildMember): Promise<boolean> {
        const guild = await Guild.findOne(
            {_id: member.guild.id},
            {roles: 1, _id: 0}
        );

        const administratorRole = guild?.roles.administrator;

        if (
            (administratorRole && member.roles.cache.has(administratorRole)) ||
            member.permissions.has("Administrator")
        ) return true;

        return this.isOwner(member);
    }

    public static isOwner(member: GuildMember): boolean {
        return member.id === member.guild.ownerId || this.isDeveloper(member.id);
    }

    public static isDeveloper(memberId: string): boolean {
        return Properties.users.developers.includes(memberId);
    }
}