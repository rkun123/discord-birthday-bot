/**
 * Invide URL: https://discord.com/api/oauth2/authorize?client_id=967012256653135934&permissions=2147617792&scope=bot
 */
import {
  createBot,
  startBot,
  InteractionResponseTypes,
  enableCachePlugin,
  enableCacheSweepers,
  EventHandlers,
} from "../deps.ts";
import { deployCommands, handleCommandInteraction } from "./commands.ts";
import { createTables } from "./store.ts";
import { handleScheduled } from "./notify.ts";

import "https://deno.land/x/dotenv@v3.2.0/load.ts";

export const NOTIFY_MODE = Deno.args[0] === "--notify";
console.info(`NOTIFY_MODE: ${NOTIFY_MODE}`);

createTables();

let eventHandlers: Partial<EventHandlers> = NOTIFY_MODE
  ? {}
  : {
      async interactionCreate(bot, interaction) {
        console.debug(interaction.data);

        await handleCommandInteraction(bot, interaction);

        if (interaction.data?.name === "ping") {
          return await bot.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: { content: "pong" },
            }
          );
        }
      },
    };

export const baseBot = createBot({
  token: Deno.env.get("DISCORD_TOKEN") || "",
  intents: NOTIFY_MODE ? [] : ["Guilds", "GuildMessages"],
  botId: BigInt(Deno.env.get("BOT_ID") || ""),
  events: {
    async ready(bot, { user, guilds }) {
      console.info(
        `[INFO] user: ${user.username}, guilds: ${guilds.join(", ")}`
      );
      console.info(user);

      if (NOTIFY_MODE) {
        // 通知モード（定期実行された場合）
        await handleScheduled(bot);
        Deno.exit(0);
      }

      // Slash Command モード
      const deployedCommands = await bot.helpers.getApplicationCommands();
      console.log(
        "commands:  ",
        deployedCommands.map((c) => c.name).join(", ")
      );

      // すでにデプロイされているコマンドを削除
      // deployedCommands.map((c) => bot.helpers.deleteApplicationCommand(c.id));

      // 再デプロイ
      const commands = await deployCommands(bot, guilds);
      console.log("deployedCommands: ", commands);
    },
    ...eventHandlers,
  },
});

const bot = enableCachePlugin(baseBot);

enableCacheSweepers(bot);

await startBot(bot);
