import type { Bot, CreateApplicationCommand, Interaction } from "../deps.ts";
import { updateBirthDay, getAllBirthdays } from "./store.ts";

import birthday from "./command/birthday.ts";
import getBirthdays from "./command/get_birthdays.ts";
import notifyChannel from "./command/notify_channel.ts";
import unregisterNotifyChannel from "./command/unregister_notify_channel.ts";

import {
  InteractionResponseTypes,
  ApplicationCommandOptionTypes,
} from "../deps.ts";

/**
 * コマンドの型
 */
export interface Command {
  createApplicationCommand: CreateApplicationCommand;
  handler: (bot: Bot, interaction: Interaction) => Promise<void>;
}

/**
 * コマンド定義
 */
const commands: Command[] = [
  birthday,
  getBirthdays,
  notifyChannel,
  unregisterNotifyChannel,
];

/**
 * スラッシュコマンドを登録する
 * @param bot Bot
 * @returns
 */
export async function deployCommands(bot: Bot, guilds: bigint[]) {
  console.info("Deploy commands");
  return Promise.all(
    commands.map(
      async (command) =>
        await bot.helpers.createApplicationCommand(
          command.createApplicationCommand
        )
    )
  ).catch(console.error);
}

/**
 * Slash Commandへの返信を作成
 * @param bot
 * @param interaction
 * @param message
 */
export async function sendInteractionResponse(
  bot: Bot,
  interaction: Interaction,
  message: string
) {
  await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
    type: InteractionResponseTypes.ChannelMessageWithSource,
    data: {
      content: message,
    },
  });
}

/**
 * エラー発生時にエラー文をスラッシュコマンドの返信として送る
 */
export async function sendErrorInteractionResponse(
  bot: Bot,
  interaction: Interaction,
  message: string
): Promise<void> {
  const formatted = `😠: ${message}`;

  console.error("[Error] " + formatted);

  await sendInteractionResponse(bot, interaction, formatted);
}

/**
 *
 * Command Interactionのハンドラ
 * @param bot
 * @param interaction
 * @returns
 */
export async function handleCommandInteraction(
  bot: Bot,
  interaction: Interaction
): Promise<void> {
  const name = interaction.data?.name;
  if (name === null) {
    const err = "interaction name is undefined ...";
    return;
  }

  const command = commands.find(
    (c) => c.createApplicationCommand.name === name
  );

  if (!command) {
    const err = "command not found ...";
    return;
  }

  try {
    command.handler(bot, interaction);
  } catch (e: any) {
    console.debug(e.message || "Unknown errored ...");
  }
}
