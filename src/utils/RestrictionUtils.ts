import Properties from "../data/Properties";
import Guilds from "../db/models/Guilds";
import { GuildMember } from "discord.js";

export enum RestrictionLevel {
      Public = 0,
      Moderator = 1,
      Administrator = 2,
      Owner = 3,
      Developer = 4
}

export default class RestrictionUtils {
      public static async getRestrictionLabel(member: GuildMember ): Promise<string> {
            if (await this.isDeveloper(member)) return RestrictionLevel[4];
            if (await this.isOwner(member)) return RestrictionLevel[3];
            if (await this.isAdministrator(member)) return RestrictionLevel[2];
            if (await this.isModerator(member)) return RestrictionLevel[1];
            
            return RestrictionLevel[0];
      }

      public static async getRestrictionLevel(member: GuildMember ): Promise<number> {
            if (await this.isDeveloper(member)) return RestrictionLevel.Developer;
            if (await this.isOwner(member)) return RestrictionLevel.Owner;
            if (await this.isAdministrator(member)) return RestrictionLevel.Administrator;
            if (await this.isModerator(member)) return RestrictionLevel.Moderator;

            return RestrictionLevel.Public;
      }

      public static async verifyAccess(level: RestrictionLevel, member: GuildMember ): Promise<boolean> {
            switch (level) {
                  case RestrictionLevel.Public:
                        return true;
                  
                  case RestrictionLevel.Moderator:
                        return await this.isModerator(member);
                  
                  case RestrictionLevel.Administrator:
                        return await this.isAdministrator(member);
                  
                  case RestrictionLevel.Owner:
                        return await this.isOwner(member);
                  
                  case RestrictionLevel.Developer:
                        return await this.isDeveloper(member);
                  
                  default:
                        return false;
            }
      }

      public static async isModerator(member: GuildMember): Promise<boolean> {
            const guildSettings = await Guilds.findOne({ id: member.guild.id });
            const moderatorRole = guildSettings?.roles.moderator;
            
            if (
                  (moderatorRole && member.roles.cache.has(moderatorRole)) ||
                  member.permissions.has("ModerateMembers")
            )
                  return true;

            return await this.isAdministrator(member);
      }

      public static async isAdministrator(member: GuildMember): Promise<boolean> {
            const guildSettings = await Guilds.findOne({ id: member.guild.id });
            const administratorRole = guildSettings?.roles.administrator;
            
            if (
                  (administratorRole && member.roles.cache.has(administratorRole)) ||
                  member.permissions.has("Administrator")
            )
                  return true;

            return await this.isOwner(member);
      }

      public static async isOwner(member: GuildMember): Promise<boolean> {
            return member.id === member.guild.ownerId || await this.isDeveloper(member);
      }

      public static async isDeveloper(member: GuildMember): Promise<boolean> {
            return Properties.users.developers.includes(member.id);
      }
}