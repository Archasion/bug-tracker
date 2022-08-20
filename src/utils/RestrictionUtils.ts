import Properties from "../data/Properties";
import Guild from "../db/models/Guild.model";

import { GuildMember } from "discord.js";

export enum RestrictionLevel {
      Public = 0,
      Reviewer = 1,
      Moderator = 2,
      Administrator = 3,
      Owner = 4,
      Developer = 5
}

export default class RestrictionUtils {
      public static async getRestrictionLabel(member: GuildMember ): Promise<string> {
            if (this.isDeveloper(member.id)) return "Developer";
            if (this.isOwner(member)) return "Owner";
            if (await this.isAdministrator(member)) return "Administrator";
            if (await this.isModerator(member)) return "Moderator";
            // if (await this.isReviewer(member)) return "Reviewer";
            
            return "Public";
      }

      public static async getRestrictionLevel(member: GuildMember ): Promise<number> {
            if (this.isDeveloper(member.id)) return RestrictionLevel.Developer;
            if (this.isOwner(member)) return RestrictionLevel.Owner;
            if (await this.isAdministrator(member)) return RestrictionLevel.Administrator;
            if (await this.isModerator(member)) return RestrictionLevel.Moderator;
            // if (await this.isReviewer(member)) return RestrictionLevel.Reviewer;

            return RestrictionLevel.Public;
      }

      public static async verifyAccess(level: RestrictionLevel, member: GuildMember ): Promise<boolean> {
            switch (level) {
                  case RestrictionLevel.Public: return true;
                  // case RestrictionLevel.Reviewer: return await this.isReviewer(member);
                  case RestrictionLevel.Moderator: return await this.isModerator(member);
                  case RestrictionLevel.Administrator: return await this.isAdministrator(member);
                  case RestrictionLevel.Owner: return this.isOwner(member);
                  case RestrictionLevel.Developer: return this.isDeveloper(member.id);
                  default: return false;
            }
      }

      // public static async isReviewer(member: GuildMember): Promise<boolean> {
      //       const guildSettings = await Guild.findOne({ id: member.guild.id });
      //       const reviewerRole = guildSettings?.roles.reviewer;
            
      //       if (reviewerRole && member.roles.cache.has(reviewerRole))return true;

      //       return await this.isModerator(member);
      // }

      public static async isModerator(member: GuildMember): Promise<boolean> {
            const guildConfig = await Guild.findOne(
                  { id: member.guild.id }, 
                  { roles: 1, _id: 0 }
            );
            
            const moderatorRole = guildConfig?.roles.moderator;
            
            if (
                  (moderatorRole && member.roles.cache.has(moderatorRole)) ||
                  member.permissions.has("ModerateMembers")
            ) return true;

            return await this.isAdministrator(member);
      }

      public static async isAdministrator(member: GuildMember): Promise<boolean> {
            const guildConfig = await Guild.findOne(
                  { id: member.guild.id }, 
                  { roles: 1, _id: 0 }
            );
            
            const administratorRole = guildConfig?.roles.administrator;
            
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