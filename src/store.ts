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
    id INTEGER,
    guild_id INTEGER NOT NULL,
    nickname STRING,
    date STRING
  )
`);
  db.query(`
  CREATE TABLE IF NOT EXISTS notify_channel (
    channel_id INTEGER PRIMARY KEY,
    guild_id INTEGER NOT NULL,
    name STRING
  )
`);
}

/**
 * 誕生日の追加、更新
 *
 * @param discordUserID
 * @param guildID
 * @param nickname
 * @param birthDay 誕生日（yyyy/mm/ddのフォーマットのstring）
 */
export function updateBirthDay(
  discordUserID: bigint,
  guildID: bigint,
  nickname: string,
  birthDay: string
) {
  const countRows = db.query(
    "SELECT COUNT(*) FROM birthday WHERE id = ? AND guild_id = ?",
    [discordUserID, guildID]
  );
  const count = countRows[0].at(0) as number;
  if (count > 0) {
    // すでに登録済みなので、登録済みの誕生日をすべて削除
    console.debug(`DELETE ${count} records`);
    db.query("DELETE FROM birthday WHERE id = ? AND guild_id = ?", [
      discordUserID,
      guildID,
    ]);
  }
  db.query(
    "INSERT INTO birthday (id, guild_id, nickname, date) VALUES (?,?,?,?)",
    [discordUserID, guildID, nickname, birthDay]
  );
}

/**
 * 誕生日からユーザーを検索
 * @param birthDay
 */
export function getAllUsersByBirthDayLike(birthDay: string): BirthDay[] {
  const rows = db.query(
    "SELECT id, guild_id, nickname, date FROM birthday WHERE date LIKE ?",
    [birthDay]
  );
  return rows.map(birthDayFromRow);
}

/**
 * すべてのメンバーの誕生日を取得
 */
export function getAllBirthdays(guildID: bigint): BirthDay[] {
  const rows = db.query(
    "SELECT id, guild_id, nickname, date FROM birthday WHERE guild_id = ? ORDER BY date ASC",
    [guildID]
  );
  return rows.map(birthDayFromRow);
}

/**
 * 指定したギルドで登録されている通知するチャンネルをすべて取得
 *
 */
export function getAllNotifyChannels(guildID: bigint): NotifyChannel[] {
  const rows = db.query(
    "SELECT channel_id, guild_id, name FROM notify_channel WHERE guild_id = ?",
    [guildID]
  );
  return rows.map(notifyChannelFromRow);
}

/**
 * お知らせチャンネルを追加する
 *
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
  db.query(
    "INSERT INTO notify_channel(channel_id, guild_id, name) VALUES (?, ?, ?)",
    [notifyChannel.channelID, notifyChannel.guildID, notifyChannel.name]
  );
}

/**
 * お知らせチャンネルを解除する
 *
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
  db.query("DELETE FROM notify_channel WHERE channel_id = ?", [channelID]);
}
