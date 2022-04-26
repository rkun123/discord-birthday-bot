import { Row } from "../deps.ts";
import { BirthDay, NotifyChannel } from "./types.ts";

const dateRegexp = /^\d{4}\/\d{1,2}\/\d{1,2}$/;

/**
 * 入力された日付をパースする
 * @param input string
 */
export function parseDate(input: string): Date {
  //  /^\d{4}\/\d{2}\/\d{2}$/.test('1999/12/13')
  if (!dateRegexp.test(input)) {
    throw new Error("日付の入力フォーマットが間違っています。");
  }
  const array = input.split("/");
  const year = array[0];
  const month = array[1];
  const day = array[2];

  // バリデーション
  if (parseInt(year) > new Date().getFullYear())
    throw new Error("現在よりも前の年を指定してください");
  if (parseInt(month) > 12 || parseInt(day) > 31)
    throw new Error("正しい日付を入力してください");

  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = new String(date.getMonth() + 1).padStart(2, "0");
  const d = new String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

/**
 * RowからBirthday型に変換
 * @param row `SELECT (id, nickname, birthday) FROM birthday`のRow
 */
export function birthDayFromRow(row: Row): BirthDay {
  return {
    discordUserID: row.at(0) as bigint,
    guildID: row.at(1) as bigint,
    nickname: row.at(2) as string,
    date: row.at(3) as string,
  };
}

/**
 *
 * @param row `SELECT (channel_id, name) FROM notify_channel
 * @returns
 */
export function notifyChannelFromRow(row: Row): NotifyChannel {
  return {
    channelID: row.at(0) as bigint,
    guildID: row.at(1) as bigint,
    name: row.at(2) as string,
  };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
