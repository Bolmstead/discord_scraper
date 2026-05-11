import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.TRADING_CONFIG_DB_PATH || "data/trading-config.sqlite",
);
const DB_WAL_PATH = `${DB_PATH}-wal`;
const DB_SHM_PATH = `${DB_PATH}-shm`;

const SCHEMA_VERSION = "simple_accounts_v2";

let db;
let cachedSnapshot;
let cachedSnapshotStorageSignature = "";
const SUPPORTED_WALLETS = new Set(["Berkley", "Sharif"]);

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function getFileSignature(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return `${Math.trunc(stats.mtimeMs)}:${stats.size}`;
  } catch {
    return "missing";
  }
}

function getStorageSignature() {
  return [
    getFileSignature(DB_PATH),
    getFileSignature(DB_WAL_PATH),
    getFileSignature(DB_SHM_PATH),
  ].join("|");
}

function parseJson(value, fallbackValue) {
  if (!value) {
    return fallbackValue;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function splitKeywordText(value) {
  const keywords = [];
  let current = "";
  let inQuotes = false;
  const source = String(value || "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      const keyword = current.trim();
      if (keyword) {
        keywords.push(keyword);
      }
      current = "";
      continue;
    }

    current += character;
  }

  const keyword = current.trim();
  if (keyword) {
    keywords.push(keyword);
  }

  return keywords;
}

function normalizeKeywordsArray(value) {
  if (Array.isArray(value)) {
    return value.map((keyword) => String(keyword || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return splitKeywordText(value);
  }

  return [];
}

function nullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const num = Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }

  return num;
}

function nullableInteger(value) {
  const num = nullableNumber(value);
  if (num === null) {
    return null;
  }

  return Math.trunc(num);
}

function normalizeWalletName(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function assertWalletName(walletName) {
  if (!walletName) {
    throw new Error("Wallet is required");
  }

  if (!SUPPORTED_WALLETS.has(walletName)) {
    throw new Error("Wallet must be one of: Berkley, Sharif");
  }
}

function ensureColumn(database, tableName, columnName, definitionSql) {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    database.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definitionSql}`,
    );
  }
}

function getDatabase() {
  if (db) {
    return db;
  }

  ensureParentDirectory(DB_PATH);
  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA journal_mode = WAL;");

  ensureSchema(db);
  return db;
}

function ensureSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const schemaRow = database
    .prepare("SELECT value FROM app_meta WHERE key = 'schema_version'")
    .get();

  if (schemaRow?.value === SCHEMA_VERSION) {
    ensureColumn(database, "accounts", "image_url", "TEXT");
    return;
  }

  database.exec("BEGIN");
  try {
    // Start fresh from the legacy schema and data model.
    database.exec("DROP TABLE IF EXISTS account_coins;");
    database.exec("DROP TABLE IF EXISTS coins;");
    database.exec("DROP TABLE IF EXISTS accounts;");

    database.exec(`
      CREATE TABLE accounts (
        username TEXT PRIMARY KEY,
        name TEXT,
        image_url TEXT
      );

      CREATE TABLE account_coins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_username TEXT NOT NULL,
        coin_name TEXT NOT NULL,
        coin_address TEXT NOT NULL,
        coin_keywords_json TEXT NOT NULL DEFAULT '[]',
        amount_to_buy_sol REAL NOT NULL DEFAULT 0,
        percent_to_sell REAL NOT NULL DEFAULT 100,
        time_between_sells_seconds INTEGER NOT NULL DEFAULT 0,
        wallet_name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (account_username) REFERENCES accounts(username) ON DELETE CASCADE
      );

      CREATE INDEX idx_account_coins_username_order
        ON account_coins(account_username, sort_order, id);

      CREATE INDEX idx_account_coins_address
        ON account_coins(coin_address);
    `);

    database
      .prepare(
        `
          INSERT INTO app_meta(key, value)
          VALUES('schema_version', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `,
      )
      .run(SCHEMA_VERSION);

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function ensureAccountExists(database, username) {
  const account = database
    .prepare("SELECT username FROM accounts WHERE username = ?")
    .get(username);

  if (!account) {
    throw new Error(`Account ${username} does not exist`);
  }
}

function getNextSortOrder(database, accountUsername) {
  const row = database
    .prepare(
      `
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order
      FROM account_coins
      WHERE account_username = ?
      `,
    )
    .get(accountUsername);

  return row?.next_sort_order ?? 0;
}

function mapCoinRow(row) {
  return {
    id: row.id,
    name: row.coin_name,
    address: row.coin_address,
    keywords: parseJson(row.coin_keywords_json, []),
    amountToBuySol: row.amount_to_buy_sol,
    amountToBuy: row.amount_to_buy_sol,
    percentToSell: row.percent_to_sell,
    timeBetweenSellsSeconds: row.time_between_sells_seconds,
    timeBetweenSells: row.time_between_sells_seconds,
    walletName: row.wallet_name || "",
    sortOrder: row.sort_order,
  };
}

export function getAccountsWithCoins() {
  const database = getDatabase();

  const accounts = database
    .prepare(
      `
      SELECT username, name
      , image_url
      FROM accounts
      ORDER BY username ASC
      `,
    )
    .all();

  const selectCoins = database.prepare(
    `
    SELECT
      id,
      coin_name,
      coin_address,
      coin_keywords_json,
      amount_to_buy_sol,
      percent_to_sell,
      time_between_sells_seconds,
      wallet_name,
      sort_order
    FROM account_coins
    WHERE account_username = ?
    ORDER BY sort_order ASC, id ASC
    `,
  );

  return accounts.map((account) => ({
    username: account.username,
    name: account.name || account.username,
    imageUrl: account.image_url || "",
    coins: selectCoins.all(account.username).map(mapCoinRow),
  }));
}

export function getAccountCoinAssociations() {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT
        ac.id,
        ac.account_username,
        a.name AS account_name,
        ac.coin_name,
        ac.coin_address,
        ac.coin_keywords_json,
        ac.amount_to_buy_sol,
        ac.percent_to_sell,
        ac.time_between_sells_seconds,
        ac.wallet_name,
        ac.sort_order
      FROM account_coins ac
      JOIN accounts a ON a.username = ac.account_username
      ORDER BY ac.account_username ASC, ac.sort_order ASC, ac.id ASC
      `,
    )
    .all()
    .map((row) => ({
      id: row.id,
      accountUsername: row.account_username,
      accountName: row.account_name || row.account_username,
      coinName: row.coin_name,
      coinAddress: row.coin_address,
      coinKeywords: parseJson(row.coin_keywords_json, []),
      amountToBuySol: row.amount_to_buy_sol,
      amountToBuy: row.amount_to_buy_sol,
      percentToSell: row.percent_to_sell,
      timeBetweenSellsSeconds: row.time_between_sells_seconds,
      timeBetweenSells: row.time_between_sells_seconds,
      walletName: row.wallet_name || "",
      sortOrder: row.sort_order,
    }));
}

export function getGlobalCoins() {
  return [];
}

function normalizeAccountPayload(payload = {}) {
  return {
    username: String(payload.username || "").trim(),
    name: String(payload.name || "").trim(),
    imageUrl: String(payload.imageUrl || payload.image_url || "").trim(),
  };
}

function normalizeAccountCoinPayload(payload = {}) {
  const amountRaw = payload.amountToBuySol ?? payload.amountToBuy;
  const amountToBuySol = nullableNumber(amountRaw);
  const percentRaw = payload.percentToSell;
  const timeBetweenRaw =
    payload.timeBetweenSellsSeconds ?? payload.timeBetweenSells;

  return {
    accountUsername: String(
      payload.accountUsername || payload.account_username || "",
    ).trim(),
    coinName: String(payload.coinName || payload.name || "").trim(),
    coinAddress: String(payload.coinAddress || payload.address || "").trim(),
    coinKeywords: normalizeKeywordsArray(
      payload.coinKeywords ?? payload.keywords,
    ),
    amountToBuySol,
    percentToSell: nullableNumber(percentRaw),
    timeBetweenSellsSeconds: nullableInteger(timeBetweenRaw),
    walletName: normalizeWalletName(payload.walletName ?? payload.wallet_name),
    sortOrder: Number.isInteger(Number(payload.sortOrder))
      ? Math.trunc(Number(payload.sortOrder))
      : null,
  };
}

export function createAccount(payload) {
  const database = getDatabase();
  const account = normalizeAccountPayload(payload);

  if (!account.username) {
    throw new Error("Account username is required");
  }

  database
    .prepare("INSERT INTO accounts(username, name, image_url) VALUES(?, ?, ?)")
    .run(
      account.username,
      account.name || account.username,
      account.imageUrl || null,
    );

  refreshTradingConfigSnapshot();
  return getAccountsWithCoins();
}

export function updateAccount(username, payload) {
  const database = getDatabase();
  const targetUsername = String(username || "").trim();
  const account = normalizeAccountPayload(payload);

  if (!targetUsername) {
    throw new Error("Account username is required");
  }

  ensureAccountExists(database, targetUsername);

  database
    .prepare("UPDATE accounts SET name = ?, image_url = ? WHERE username = ?")
    .run(
      account.name || targetUsername,
      account.imageUrl || null,
      targetUsername,
    );

  refreshTradingConfigSnapshot();
  return getAccountsWithCoins();
}

export function deleteAccount(username) {
  const database = getDatabase();
  const targetUsername = String(username || "").trim();

  if (!targetUsername) {
    throw new Error("Account username is required");
  }

  ensureAccountExists(database, targetUsername);
  database
    .prepare("DELETE FROM accounts WHERE username = ?")
    .run(targetUsername);

  refreshTradingConfigSnapshot();
  return getAccountsWithCoins();
}

export function createAccountCoin(payload) {
  const database = getDatabase();
  const coin = normalizeAccountCoinPayload(payload);

  if (!coin.accountUsername || !coin.coinName || !coin.coinAddress) {
    throw new Error("Account, coin name, and coin address are required");
  }

  if (coin.amountToBuySol === null || coin.amountToBuySol < 0) {
    throw new Error("Amount to buy (SOL) is required");
  }
  if (
    coin.percentToSell === null ||
    coin.percentToSell < 0 ||
    coin.percentToSell > 100
  ) {
    throw new Error(
      "Percent to sell is required and must be between 0 and 100",
    );
  }
  if (
    coin.timeBetweenSellsSeconds === null ||
    coin.timeBetweenSellsSeconds < 0
  ) {
    throw new Error("Time between sells (seconds) is required");
  }
  assertWalletName(coin.walletName);

  ensureAccountExists(database, coin.accountUsername);

  const sortOrder =
    coin.sortOrder === null
      ? getNextSortOrder(database, coin.accountUsername)
      : coin.sortOrder;

  database
    .prepare(
      `
      INSERT INTO account_coins(
        account_username,
        coin_name,
        coin_address,
        coin_keywords_json,
        amount_to_buy_sol,
        percent_to_sell,
        time_between_sells_seconds,
        wallet_name,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      coin.accountUsername,
      coin.coinName,
      coin.coinAddress,
      JSON.stringify(coin.coinKeywords),
      coin.amountToBuySol,
      coin.percentToSell,
      coin.timeBetweenSellsSeconds,
      coin.walletName,
      sortOrder,
    );

  refreshTradingConfigSnapshot();
  return getAccountCoinAssociations();
}

export function updateAccountCoin(id, payload) {
  const database = getDatabase();
  const associationId = Number(id);
  const coin = normalizeAccountCoinPayload(payload);

  if (!Number.isInteger(associationId)) {
    throw new Error("Association id is required");
  }

  const existing = database
    .prepare(
      "SELECT id, account_username, sort_order FROM account_coins WHERE id = ?",
    )
    .get(associationId);

  if (!existing) {
    throw new Error(`Association ${associationId} does not exist`);
  }

  if (!coin.accountUsername || !coin.coinName || !coin.coinAddress) {
    throw new Error("Account, coin name, and coin address are required");
  }

  if (coin.amountToBuySol === null || coin.amountToBuySol < 0) {
    throw new Error("Amount to buy (SOL) is required");
  }
  if (
    coin.percentToSell === null ||
    coin.percentToSell < 0 ||
    coin.percentToSell > 100
  ) {
    throw new Error(
      "Percent to sell is required and must be between 0 and 100",
    );
  }
  if (
    coin.timeBetweenSellsSeconds === null ||
    coin.timeBetweenSellsSeconds < 0
  ) {
    throw new Error("Time between sells (seconds) is required");
  }
  assertWalletName(coin.walletName);

  ensureAccountExists(database, coin.accountUsername);

  database
    .prepare(
      `
      UPDATE account_coins
      SET
        account_username = ?,
        coin_name = ?,
        coin_address = ?,
        coin_keywords_json = ?,
        amount_to_buy_sol = ?,
        percent_to_sell = ?,
        time_between_sells_seconds = ?,
        wallet_name = ?,
        sort_order = ?
      WHERE id = ?
      `,
    )
    .run(
      coin.accountUsername,
      coin.coinName,
      coin.coinAddress,
      JSON.stringify(coin.coinKeywords),
      coin.amountToBuySol,
      coin.percentToSell,
      coin.timeBetweenSellsSeconds,
      coin.walletName,
      coin.sortOrder === null ? existing.sort_order : coin.sortOrder,
      associationId,
    );

  refreshTradingConfigSnapshot();
  return getAccountCoinAssociations();
}

export function deleteAccountCoin(id) {
  const database = getDatabase();
  const associationId = Number(id);

  if (!Number.isInteger(associationId)) {
    throw new Error("Association id is required");
  }

  const existing = database
    .prepare("SELECT id FROM account_coins WHERE id = ?")
    .get(associationId);

  if (!existing) {
    throw new Error(`Association ${associationId} does not exist`);
  }

  database.prepare("DELETE FROM account_coins WHERE id = ?").run(associationId);

  refreshTradingConfigSnapshot();
  return getAccountCoinAssociations();
}

export function createGlobalCoin() {
  throw new Error("Global coin list was removed. Add coins inside an account.");
}

export function updateGlobalCoin() {
  throw new Error("Global coin list was removed. Add coins inside an account.");
}

export function deleteGlobalCoin() {
  throw new Error("Global coin list was removed. Add coins inside an account.");
}

function buildKeywordMap(accountMap) {
  const keywordMap = new Map();

  for (const [username, account] of accountMap) {
    for (const coin of account.coins || []) {
      for (const keyword of coin.keywords || []) {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, []);
        }
        keywordMap.get(keyword).push({ username, coin });
      }
    }
  }

  return keywordMap;
}

function buildSnapshot() {
  const accounts = getAccountsWithCoins();
  const accountMap = new Map(
    accounts.map((account) => [account.username, account]),
  );
  const keywordMap = buildKeywordMap(accountMap);

  const trumpAccount =
    accountMap.get("realDonaldTrump") || accountMap.get("trump") || null;

  const trumpAccountMap = new Map();
  const trumpKeywordMap = new Map();

  if (trumpAccount) {
    trumpAccountMap.set("trump", trumpAccount);

    for (const coin of trumpAccount.coins || []) {
      for (const keyword of coin.keywords || []) {
        if (!trumpKeywordMap.has(keyword)) {
          trumpKeywordMap.set(keyword, []);
        }
        trumpKeywordMap.get(keyword).push({ username: "trump", coin });
      }
    }
  }

  return {
    coins: {},
    accountMap,
    keywordMap,
    trumpAccountMap,
    trumpKeywordMap,
  };
}

function getSnapshot() {
  getDatabase();
  const currentStorageSignature = getStorageSignature();

  // Refresh if a different process changed the sqlite database/WAL files.
  if (
    !cachedSnapshot ||
    cachedSnapshotStorageSignature !== currentStorageSignature
  ) {
    cachedSnapshot = buildSnapshot();
    cachedSnapshotStorageSignature = currentStorageSignature;
  }
  return cachedSnapshot;
}

export function refreshTradingConfigSnapshot() {
  getDatabase();
  cachedSnapshot = buildSnapshot();
  cachedSnapshotStorageSignature = getStorageSignature();
  return cachedSnapshot;
}

export function getTradingConfigSnapshot() {
  return getSnapshot();
}

export function getTradingConfigDatabasePath() {
  getDatabase();
  return DB_PATH;
}
