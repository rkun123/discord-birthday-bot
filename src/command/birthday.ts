import {
  sendInteractionResponse,
  sendErrorInteractionResponse,
  Command,
} from "../commands.ts";
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
} from "../../deps.ts";
import { parseDate, dateToString } from "../utils.ts";
import { updateBirthDay } from "../store.ts";

const birthday: Command = {
  createApplicationCommand: {
    name: "birthday",
    description: "自分の誕生日を登録する",
    options: [
      {
        type: ApplicationCommandOptionTypes.String,
        name: "誕生日",
        description: "`YYYY/MM/DD`",
        required: true,
      },
    ],
  },
  async handler(bot, interaction) {
    const options = interaction.data?.options;
    console.debug(options![0]);

    // Validation
    const option = options![0];
    if (
      option.name !== "誕生日" ||
      !option.value ||
      typeof option.value !== "string"
    ) {
      sendErrorInteractionResponse(
        bot,
        interaction,
        "Birthday is not provided..."
      );
      return;
    }

    const rawBirthday = option.value;

    // Register birthday
    try {
      const birthday = dateToString(parseDate(rawBirthday));
      if (!interaction.member) {
        sendErrorInteractionResponse(bot, interaction, "memberが存在しない");
        return;
      }
      updateBirthDay(
        interaction.member!.id,
        interaction.member?.nick || interaction.user.username || "unknown",
        birthday
      );
      sendInteractionResponse(bot, interaction, "誕生日を登録しました");
    } catch (e) {
      sendErrorInteractionResponse(bot, interaction, e.message);
    }
  },
};

export default birthday;
