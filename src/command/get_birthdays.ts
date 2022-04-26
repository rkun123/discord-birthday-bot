import { sendInteractionResponse, Command } from "../commands.ts";
import { getAllBirthdays } from "../store.ts";

const getBirthday: Command = {
  createApplicationCommand: {
    name: "get-birthdays",
    description: "メンバーの誕生日を取得する",
    options: [],
  },
  async handler(bot, interaction) {
    const birthdays = getAllBirthdays();
    let format = "**メンバーの誕生日リスト🎉**\n";
    format += birthdays.map((b) => `> ${b.nickname}さん: ${b.date}`).join("\n");
    sendInteractionResponse(bot, interaction, format);
  },
};

export default getBirthday;
