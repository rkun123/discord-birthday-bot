import { Bot } from "../deps.ts";
import { getAllUsersByBirthDayLike, getAllNotifyChannels } from "./store.ts";
import { dateToString } from "./utils.ts";
import { NotifyChannel } from "./types.ts";
import type { BirthDay } from "./types.ts";

export async function handleScheduled(bot: Bot) {
  console.info("[INFO] handleScheduled");
  const now = new Date();
  const todayString = "____" + dateToString(now).substring(4);

  // Search birthday
  const birthdays = getAllUsersByBirthDayLike(todayString);

  if (birthdays.length <= 0) {
    console.info(`${todayString}が誕生日のメンバーはいませんでした`);
    return;
  }

  // GuildIDをキーとしたBirthdayの配列
  const birthdaysWithGuildIDAsKey: { [key: string]: BirthDay[] } = {};

  // 同一GuildのBirthdayごとにまとめる
  birthdays.forEach((birthday) => {
    const guildID = birthday.guildID.toString();
    birthdaysWithGuildIDAsKey[guildID] = birthdaysWithGuildIDAsKey[guildID]
      ? [...birthdaysWithGuildIDAsKey[guildID], birthday]
      : [birthday];
  });

  // Send all
  await Promise.all(
    Object.keys(birthdaysWithGuildIDAsKey).map((key) => {
      const guildBirthdays = birthdaysWithGuildIDAsKey[key];
      return sendBirthdays(guildBirthdays[0].guildID, guildBirthdays);
    })
  );

  /**
   * 指定したギルドのnotify_channelに誕生日をお知らせする
   *
   * @param guildID お知らせを送るギルドのID
   * @param birthdays お知らせする誕生日
   */
  async function sendBirthdays(guildID: bigint, birthdays: BirthDay[]) {
    let format = "**【今日誕生日のメンバー】**🎉\n";

    format += birthdays.map((b) => `<@${b.discordUserID}> さん`).join("\n");
    format += "\n🥳おめでとうございます〜〜🥳";

    const notifyChannels = getAllNotifyChannels(guildID);

    console.info(format);
    await broadcastMessageToNotifyChannels(bot, notifyChannels, format);
  }
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
