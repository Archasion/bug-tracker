import { Client } from "discord.js";

export default class EventListener {
      client: Client;
      name: string;
      once: boolean;

      constructor(client: Client, data: { name: string; once: boolean; }) {
            this.client = client;
            this.name = data.name;
            this.once = data.once;
      }
}