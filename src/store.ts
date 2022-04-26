import { DB } from "../deps.ts";
import { birthDayFromRow, notifyChannelFromRow } from "./utils.ts";
import { BirthDay, NotifyChannel } from "./types.ts";

export const DENO_ENVIRONMENT =
  Deno.env.get("DENO_ENVIRONMENT") || "development";

let dbName = "development";
switch (DENO_ENVIRONMENT) {
  case "production":
    dbName = "production";
    break;
  case "test":
    dbName = "test";
    break;
  default:
    dbName = "development";
}

export const db = new DB(`${dbName}.db`);

/**
 * 各テーブルの初期化
 */
export function createTables() {
  db.query(`
  CREATE TABLE IF NOT EXISTS birthday (
    id INTEGER PRIMARY KEY,
    nickname STRING,
    date STRING
  )
`);
  db.query(`
  CREATE TABLE IF NOT EXISTS notify_channel (
    channel_id INTEGER UNIQUE PRIMARY KEY,
    name STRING
  )
`);
}

/**
 * 誕生日の追加、更新
 */
export function updateBirthDay(
  discordUserID: bigint,
  nickname: string,
  birthDay: string
) {
  db.query("REPLACE INTO birthday (id, nickname, date) VALUES (?,?,?)", [
    discordUserID,
    nickname,
    birthDay,
  ]);
}

/**
 * 誕生日からユーザーを検索
 * @param birthDay
 */
export function getAllUsersByBirthDayLike(birthDay: string): BirthDay[] {
  const rows = db.query(
    "SELECT id, nickname, date FROM birthday WHERE date LIKE ?",
    [birthDay]
  );
  return rows.map(birthDayFromRow);
}

/**
 * すべてのメンバーの誕生日を取得
 */
export function getAllBirthdays(): BirthDay[] {
  const rows = db.query(
    "SELECT id, nickname, date FROM birthday ORDER BY date ASC"
  );
  return rows.map(birthDayFromRow);
}

/**
 *
 */
export function getAllNotifyChannels(): NotifyChannel[] {
  const rows = db.query("SELECT channel_id, name FROM notify_channel");
  return rows.map(notifyChannelFromRow);
}

/**
 * お知らせチャンネルを追加する
 * @param notifyChannel
 */
export function insertNotifyChannel(notifyChannel: NotifyChannel) {
  if (
    db.query("SELECT (channel_id) FROM notify_channel WHERE channel_id = ?", [
      notifyChannel.channelID,
    ]).length > 0
  ) {
    throw new Error("そのチャンネルはすでに登録されています");
  }
  db.query("INSERT INTO notify_channel(channel_id, name) VALUES (?, ?)", [
    notifyChannel.channelID,
    notifyChannel.name,
  ]);
}

/**
 * お知らせチャンネルを解除する
 * @param channelID
 */
export function deleteNotifyChannel(channelID: bigint) {
  if (
    db.query("SELECT (channel_id) FROM notify_channel WHERE channel_id = ?", [
      channelID,
    ]).length <= 0
  ) {
    throw new Error("そのチャンネルは登録されていません");
  }
  db.query("DELETE notify_channel WHERE channel_id = ?", [channelID]);
}
