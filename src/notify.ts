import { Bot } from "../deps.ts";
import { getAllUsersByBirthDayLike, getAllNotifyChannels } from "./store.ts";
import { dateToString } from "./utils.ts";
import { NotifyChannel } from "./types.ts";

export async function handleScheduled(bot: Bot) {
  console.info("[INFO] handleScheduled");
  const now = new Date();
  const todayString = "____" + dateToString(now).substring(4);
  console.log(todayString);

  // Search birthday
  const birthdays = getAllUsersByBirthDayLike(todayString);
  if (birthdays.length <= 0) {
    console.info(`${todayString}が誕生日のメンバーはいませんでした`);
    return;
  }

  let format = "**【今日誕生日のメンバー】**🎉\n";

  format += birthdays.map((b) => `<@${b.discordUserID}> さん`).join("\n");
  format += "\n🥳おめでとうございます〜〜🥳";

  const notifyChannels = getAllNotifyChannels();

  console.info(format);
  await broadcastMessageToNotifyChannels(bot, notifyChannels, format);
}

async function broadcastMessageToNotifyChannels(
  bot: Bot,
  notifyChannels: NotifyChannel[],
  message: string
) {
  console.info(
    `[INFO] Send notification to ${notifyChannels
      .map((n) => n.name)
      .join(", ")}`
  );
  await Promise.all(
    notifyChannels.map((channel) => {
      return bot.helpers
        .sendMessage(channel.channelID, {
          content: message,
        })
        .catch(console.error);
    })
  ).catch(console.error);
}
