import { RestrictionLevel } from "../../../utils/RestrictionUtils";
import Bot from "../../../Bot";

export default class Button {
      client: Bot;
      restriction: RestrictionLevel;
      modalResponse?: boolean;
      name: string;

      constructor(client: Bot, data: any) {
            this.client = client;
            this.restriction = data.restriction;
            this.modalResponse = data.modalResponse ?? false;
            this.name = data.name;

            try {
                  this.client.buttons.register(this);
            } catch (err) {
                  console.error(err);
                  return;
            }
      }
}