import { ApplicationCommandOptionTypes, ChannelTypes } from "../../deps.ts";
import {
  sendInteractionResponse,
  sendErrorInteractionResponse,
  Command,
} from "../commands.ts";
import { deleteNotifyChannel } from "../store.ts";

const unregisterNotifyChannel: Command = {
  createApplicationCommand: {
    name: "unregister-notify-channel",
    description: "誕生日を知らせるチャンネルを登録解除する",
    options: [
      {
        type: ApplicationCommandOptionTypes.Channel,
        name: "チャンネル",
        description: "解除するチャンネル",
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
      deleteNotifyChannel(channelID);
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

export default unregisterNotifyChannel;
