import { RestrictionLevel } from "../../../utils/RestrictionUtils";
import Bot from "../../../Bot";

export default class SelectMenu {
      client: Bot;
      restriction: RestrictionLevel;
      modalResponse?: boolean;
      name: string | { startsWith: string } | { endsWith: string } | { includes: string };

      constructor(client: Bot, data: { restriction: RestrictionLevel; modalResponse?: boolean; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
            this.client = client;
            this.restriction = data.restriction;
            this.modalResponse = data.modalResponse ?? false;
            this.name = data.name;

            try {
                  // noinspection JSIgnoredPromiseFromCall
                  this.client.select_menus.register(this);
            } catch (err) {
                  console.error(err);
                  return;
            }
      }
}