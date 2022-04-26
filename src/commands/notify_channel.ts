import { ApplicationCommandOptionTypes, ChannelTypes } from "../../deps.ts";
import {
  sendInteractionResponse,
  sendErrorInteractionResponse,
  Command,
} from "../command.ts";
import { insertNotifyChannel } from "../store.ts";

const notifyChannel: Command = {
  createApplicationCommand: {
    name: "notify-channel",
    description: "誕生日を知らせるチャンネルを登録する",
    options: [
      {
        type: ApplicationCommandOptionTypes.Channel,
        name: "チャンネル",
        description: "誕生日を知らせるチャンネル",
        required: true,
      },
    ],
  },
  async handler(bot, interaction) {
    const options = interaction.data?.options;
    console.debug(options![0]);

    // Validation
    const option = options![0];
    console.debug(option.value);
    const channelID = BigInt(option.value! as string);

    const channel = await bot.helpers.getChannel(channelID);
    if (channel.type !== ChannelTypes.GuildText) {
      return sendErrorInteractionResponse(
        bot,
        interaction,
        "テキストチャンネルを選択してください"
      );
    }
    // Register birthday
    try {
      insertNotifyChannel({
        channelID: channelID,
        guildID: interaction.guildId!,
        name: channel.name || "unknown",
      });
      sendInteractionResponse(
        bot,
        interaction,
        "お知らせチャンネルを登録しました"
      );
    } catch (e) {
      sendErrorInteractionResponse(bot, interaction, e.message);
    }
  },
};

export default notifyChannel;
