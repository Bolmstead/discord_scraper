import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.TRADING_CONFIG_DB_PATH || "data/trading-config.sqlite"
);
const SEED_PATH = path.resolve(
  process.cwd(),
  process.env.TRADING_CONFIG_SEED_PATH || "data/trading-config-seed.json"
);

let db;
let cachedSnapshot;

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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

function normalizeKeywordsArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((keyword) => String(keyword || "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
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

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }

  return false;
}

function ensureColumn(database, tableName, columnName, definitionSql) {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    database.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definitionSql}`
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

  initializeSchema(db);
  runMigrations(db);
  seedDatabaseIfNeeded(db);

  return db;
}

function initializeSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS coins (
      symbol TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      keywords_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      username TEXT PRIMARY KEY,
      name TEXT,
      default_wallet_name TEXT NOT NULL DEFAULT 'Berkley',
      buy_any_posted_ca INTEGER NOT NULL DEFAULT 0,
      amount_to_buy_for_any_posted_ca REAL,
      slippage_bps_for_any_posted_ca INTEGER,
      time_to_sell_for_any_posted_ca INTEGER,
      priority_fee_for_any_posted_ca REAL,
      automatically_buy_coin_json TEXT
    );

    CREATE TABLE IF NOT EXISTS account_coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_username TEXT NOT NULL,
      coin_name TEXT NOT NULL,
      coin_address TEXT NOT NULL,
      coin_keywords_json TEXT NOT NULL,
      wallet_name TEXT NOT NULL DEFAULT 'Berkley',
      amount_to_buy REAL,
      slippage_bps INTEGER,
      priority_fee REAL,
      percent_to_sell REAL,
      time_between_sells INTEGER,
      dont_sell INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (account_username) REFERENCES accounts(username) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_account_coins_username_order
      ON account_coins(account_username, sort_order, id);

    CREATE INDEX IF NOT EXISTS idx_account_coins_address
      ON account_coins(coin_address);
  `);
}

function runMigrations(database) {
  ensureColumn(
    database,
    "accounts",
    "default_wallet_name",
    "TEXT NOT NULL DEFAULT 'Berkley'"
  );
  ensureColumn(
    database,
    "account_coins",
    "wallet_name",
    "TEXT NOT NULL DEFAULT 'Berkley'"
  );
}

function seedDatabaseIfNeeded(database) {
  const accountCount = database
    .prepare("SELECT COUNT(*) AS count FROM accounts")
    .get().count;

  if (accountCount > 0) {
    return;
  }

  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(
      `Trading config seed file not found at ${SEED_PATH}. Unable to initialize database.`
    );
  }

  const seedData = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  const insertCoin = database.prepare(
    `
      INSERT INTO coins(symbol, name, address, keywords_json)
      VALUES (?, ?, ?, ?)
    `
  );

  const insertAccount = database.prepare(
    `
      INSERT INTO accounts(
        username,
        name,
        default_wallet_name,
        buy_any_posted_ca,
        amount_to_buy_for_any_posted_ca,
        slippage_bps_for_any_posted_ca,
        time_to_sell_for_any_posted_ca,
        priority_fee_for_any_posted_ca,
        automatically_buy_coin_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  const insertAccountCoin = database.prepare(
    `
      INSERT INTO account_coins(
        account_username,
        coin_name,
        coin_address,
        coin_keywords_json,
        wallet_name,
        amount_to_buy,
        slippage_bps,
        priority_fee,
        percent_to_sell,
        time_between_sells,
        dont_sell,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  database.exec("BEGIN");

  try {
    for (const coin of seedData.coins || []) {
      insertCoin.run(
        coin.symbol,
        coin.name,
        coin.address,
        JSON.stringify(normalizeKeywordsArray(coin.keywords))
      );
    }

    for (const account of seedData.accounts || []) {
      const defaultWalletName = account.defaultWalletName || "Berkley";

      insertAccount.run(
        account.username,
        account.name || account.username,
        defaultWalletName,
        account.buyAnyPostedCA ? 1 : 0,
        nullableNumber(account.amountToBuyForAnyPostedCA),
        nullableInteger(account.slippageBpsForAnyPostedCA),
        nullableInteger(account.timeToSellForAnyPostedCA),
        nullableNumber(account.priorityFeeForAnyPostedCA),
        account.automaticallyBuyThisCoin
          ? JSON.stringify(account.automaticallyBuyThisCoin)
          : null
      );

      (account.coins || []).forEach((coinConfig, index) => {
        insertAccountCoin.run(
          account.username,
          coinConfig.name,
          coinConfig.address,
          JSON.stringify(normalizeKeywordsArray(coinConfig.keywords)),
          coinConfig.walletName || defaultWalletName,
          nullableNumber(coinConfig.amountToBuy),
          nullableInteger(coinConfig.slippageBps),
          nullableNumber(coinConfig.priorityFee),
          nullableNumber(coinConfig.percentToSell),
          nullableInteger(coinConfig.timeBetweenSells),
          coinConfig.dontSell ? 1 : 0,
          index
        );
      });
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function mapCoinRow(row) {
  const coin = {
    name: row.coin_name,
    address: row.coin_address,
    keywords: parseJson(row.coin_keywords_json, []),
    walletName: row.wallet_name || "Berkley",
  };

  if (row.amount_to_buy !== null) {
    coin.amountToBuy = row.amount_to_buy;
  }
  if (row.slippage_bps !== null) {
    coin.slippageBps = row.slippage_bps;
  }
  if (row.priority_fee !== null) {
    coin.priorityFee = row.priority_fee;
  }
  if (row.percent_to_sell !== null) {
    coin.percentToSell = row.percent_to_sell;
  }
  if (row.time_between_sells !== null) {
    coin.timeBetweenSells = row.time_between_sells;
  }
  if (row.dont_sell === 1) {
    coin.dontSell = true;
  }

  return coin;
}

function mapAccountRow(row, coinRows) {
  const account = {
    name: row.name || row.username,
    defaultWalletName: row.default_wallet_name || "Berkley",
    coins: coinRows.map(mapCoinRow),
  };

  if (row.buy_any_posted_ca === 1) {
    account.buyAnyPostedCA = true;
  }
  if (row.amount_to_buy_for_any_posted_ca !== null) {
    account.amountToBuyForAnyPostedCA = row.amount_to_buy_for_any_posted_ca;
  }
  if (row.slippage_bps_for_any_posted_ca !== null) {
    account.slippageBpsForAnyPostedCA = row.slippage_bps_for_any_posted_ca;
  }
  if (row.time_to_sell_for_any_posted_ca !== null) {
    account.timeToSellForAnyPostedCA = row.time_to_sell_for_any_posted_ca;
  }
  if (row.priority_fee_for_any_posted_ca !== null) {
    account.priorityFeeForAnyPostedCA = row.priority_fee_for_any_posted_ca;
  }

  const autoBuyCoin = parseJson(row.automatically_buy_coin_json, null);
  if (autoBuyCoin) {
    account.automaticallyBuyThisCoin = autoBuyCoin;
  }

  return account;
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

function loadGlobalCoins(database) {
  const coinRows = database
    .prepare(
      "SELECT symbol, name, address, keywords_json FROM coins ORDER BY symbol"
    )
    .all();

  const coins = {};
  for (const row of coinRows) {
    coins[row.symbol] = {
      name: row.name,
      address: row.address,
      keywords: parseJson(row.keywords_json, []),
    };
  }

  return coins;
}

function loadAccountMap(database) {
  const accountRows = database
    .prepare(
      `
        SELECT
          username,
          name,
          default_wallet_name,
          buy_any_posted_ca,
          amount_to_buy_for_any_posted_ca,
          slippage_bps_for_any_posted_ca,
          time_to_sell_for_any_posted_ca,
          priority_fee_for_any_posted_ca,
          automatically_buy_coin_json
        FROM accounts
        ORDER BY rowid ASC
      `
    )
    .all();

  const selectCoinsForAccount = database.prepare(
    `
      SELECT
        coin_name,
        coin_address,
        coin_keywords_json,
        wallet_name,
        amount_to_buy,
        slippage_bps,
        priority_fee,
        percent_to_sell,
        time_between_sells,
        dont_sell
      FROM account_coins
      WHERE account_username = ?
      ORDER BY sort_order ASC, id ASC
    `
  );

  const accountMap = new Map();
  for (const accountRow of accountRows) {
    const coinRows = selectCoinsForAccount.all(accountRow.username);
    accountMap.set(accountRow.username, mapAccountRow(accountRow, coinRows));
  }

  return accountMap;
}

function buildSnapshot() {
  const database = getDatabase();
  const coins = loadGlobalCoins(database);
  const accountMap = loadAccountMap(database);
  const keywordMap = buildKeywordMap(accountMap);

  const trumpAccount = accountMap.get("realDonaldTrump");
  const trumpAccountMap = new Map();
  if (trumpAccount) {
    trumpAccountMap.set("trump", trumpAccount);
  }

  const trumpKeywordMap = new Map();
  if (trumpAccount) {
    for (const coin of trumpAccount.coins || []) {
      for (const keyword of coin.keywords || []) {
        if (!trumpKeywordMap.has(keyword)) {
          trumpKeywordMap.set(keyword, []);
        }

        trumpKeywordMap.get(keyword).push({ username: "trump", coin });
      }
    }
  }

  return { coins, accountMap, keywordMap, trumpAccountMap, trumpKeywordMap };
}

function getSnapshot() {
  if (!cachedSnapshot) {
    cachedSnapshot = buildSnapshot();
  }

  return cachedSnapshot;
}

export function refreshTradingConfigSnapshot() {
  cachedSnapshot = buildSnapshot();
  return cachedSnapshot;
}

export function getTradingConfigSnapshot() {
  return getSnapshot();
}

function normalizeAccountPayload(payload = {}) {
  const normalized = {
    username: String(payload.username || "").trim(),
    name: String(payload.name || "").trim(),
    defaultWalletName: String(payload.defaultWalletName || "Berkley").trim(),
    buyAnyPostedCA: normalizeBoolean(payload.buyAnyPostedCA),
    amountToBuyForAnyPostedCA: nullableNumber(payload.amountToBuyForAnyPostedCA),
    slippageBpsForAnyPostedCA: nullableInteger(payload.slippageBpsForAnyPostedCA),
    timeToSellForAnyPostedCA: nullableInteger(payload.timeToSellForAnyPostedCA),
    priorityFeeForAnyPostedCA: nullableNumber(payload.priorityFeeForAnyPostedCA),
    automaticallyBuyThisCoin: payload.automaticallyBuyThisCoin || null,
  };

  return normalized;
}

function normalizeCoinPayload(payload = {}) {
  return {
    symbol: String(payload.symbol || "").trim(),
    name: String(payload.name || "").trim(),
    address: String(payload.address || "").trim(),
    keywords: normalizeKeywordsArray(payload.keywords),
  };
}

function normalizeAccountCoinPayload(payload = {}) {
  return {
    accountUsername: String(payload.accountUsername || payload.account_username || "").trim(),
    coinName: String(payload.coinName || "").trim(),
    coinAddress: String(payload.coinAddress || "").trim(),
    coinKeywords: normalizeKeywordsArray(payload.coinKeywords),
    walletName: String(payload.walletName || "Berkley").trim(),
    amountToBuy: nullableNumber(payload.amountToBuy),
    slippageBps: nullableInteger(payload.slippageBps),
    priorityFee: nullableNumber(payload.priorityFee),
    percentToSell: nullableNumber(payload.percentToSell),
    timeBetweenSells: nullableInteger(payload.timeBetweenSells),
    dontSell: normalizeBoolean(payload.dontSell),
    sortOrder: nullableInteger(payload.sortOrder),
  };
}

function ensureAccountExists(database, username) {
  const account = database
    .prepare("SELECT username FROM accounts WHERE username = ?")
    .get(username);

  if (!account) {
    throw new Error(`Account ${username} does not exist`);
  }
}

export function createAccount(payload) {
  const database = getDatabase();
  const account = normalizeAccountPayload(payload);

  if (!account.username) {
    throw new Error("Account username is required");
  }

  const insert = database.prepare(
    `
      INSERT INTO accounts(
        username,
        name,
        default_wallet_name,
        buy_any_posted_ca,
        amount_to_buy_for_any_posted_ca,
        slippage_bps_for_any_posted_ca,
        time_to_sell_for_any_posted_ca,
        priority_fee_for_any_posted_ca,
        automatically_buy_coin_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  );

  insert.run(
    account.username,
    account.name || account.username,
    account.defaultWalletName || "Berkley",
    account.buyAnyPostedCA ? 1 : 0,
    account.amountToBuyForAnyPostedCA,
    account.slippageBpsForAnyPostedCA,
    account.timeToSellForAnyPostedCA,
    account.priorityFeeForAnyPostedCA,
    account.automaticallyBuyThisCoin
      ? JSON.stringify(account.automaticallyBuyThisCoin)
      : null
  );

  refreshTradingConfigSnapshot();
  return getAccountsWithCoins();
}

export function updateAccount(username, payload) {
  const database = getDatabase();
  const account = normalizeAccountPayload(payload);
  const targetUsername = String(username || "").trim();

  if (!targetUsername) {
    throw new Error("Account username is required");
  }

  ensureAccountExists(database, targetUsername);

  database
    .prepare(
      `
      UPDATE accounts
      SET
        name = ?,
        default_wallet_name = ?,
        buy_any_posted_ca = ?,
        amount_to_buy_for_any_posted_ca = ?,
        slippage_bps_for_any_posted_ca = ?,
        time_to_sell_for_any_posted_ca = ?,
        priority_fee_for_any_posted_ca = ?,
        automatically_buy_coin_json = ?
      WHERE username = ?
    `
    )
    .run(
      account.name || targetUsername,
      account.defaultWalletName || "Berkley",
      account.buyAnyPostedCA ? 1 : 0,
      account.amountToBuyForAnyPostedCA,
      account.slippageBpsForAnyPostedCA,
      account.timeToSellForAnyPostedCA,
      account.priorityFeeForAnyPostedCA,
      account.automaticallyBuyThisCoin
        ? JSON.stringify(account.automaticallyBuyThisCoin)
        : null,
      targetUsername
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
  database.prepare("DELETE FROM accounts WHERE username = ?").run(targetUsername);

  refreshTradingConfigSnapshot();
  return getAccountsWithCoins();
}

export function createGlobalCoin(payload) {
  const database = getDatabase();
  const coin = normalizeCoinPayload(payload);

  if (!coin.symbol || !coin.name || !coin.address) {
    throw new Error("Coin symbol, name, and address are required");
  }

  database
    .prepare(
      `
      INSERT INTO coins(symbol, name, address, keywords_json)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(coin.symbol, coin.name, coin.address, JSON.stringify(coin.keywords));

  refreshTradingConfigSnapshot();
  return getGlobalCoins();
}

export function updateGlobalCoin(symbol, payload) {
  const database = getDatabase();
  const targetSymbol = String(symbol || "").trim();
  const coin = normalizeCoinPayload({ ...payload, symbol: targetSymbol });

  if (!coin.symbol || !coin.name || !coin.address) {
    throw new Error("Coin symbol, name, and address are required");
  }

  const exists = database
    .prepare("SELECT symbol FROM coins WHERE symbol = ?")
    .get(targetSymbol);
  if (!exists) {
    throw new Error(`Coin ${targetSymbol} does not exist`);
  }

  database
    .prepare(
      `
      UPDATE coins
      SET name = ?, address = ?, keywords_json = ?
      WHERE symbol = ?
    `
    )
    .run(coin.name, coin.address, JSON.stringify(coin.keywords), targetSymbol);

  refreshTradingConfigSnapshot();
  return getGlobalCoins();
}

export function deleteGlobalCoin(symbol) {
  const database = getDatabase();
  const targetSymbol = String(symbol || "").trim();

  if (!targetSymbol) {
    throw new Error("Coin symbol is required");
  }

  const exists = database
    .prepare("SELECT symbol FROM coins WHERE symbol = ?")
    .get(targetSymbol);
  if (!exists) {
    throw new Error(`Coin ${targetSymbol} does not exist`);
  }

  database.prepare("DELETE FROM coins WHERE symbol = ?").run(targetSymbol);

  refreshTradingConfigSnapshot();
  return getGlobalCoins();
}

function getDefaultSortOrder(database, accountUsername) {
  const row = database
    .prepare(
      `
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order
      FROM account_coins
      WHERE account_username = ?
    `
    )
    .get(accountUsername);

  return row?.next_sort_order ?? 0;
}

export function createAccountCoin(payload) {
  const database = getDatabase();
  const association = normalizeAccountCoinPayload(payload);

  if (
    !association.accountUsername ||
    !association.coinName ||
    !association.coinAddress
  ) {
    throw new Error("Account, coin name, and coin address are required");
  }

  ensureAccountExists(database, association.accountUsername);

  const sortOrder =
    association.sortOrder === null
      ? getDefaultSortOrder(database, association.accountUsername)
      : association.sortOrder;

  database
    .prepare(
      `
      INSERT INTO account_coins(
        account_username,
        coin_name,
        coin_address,
        coin_keywords_json,
        wallet_name,
        amount_to_buy,
        slippage_bps,
        priority_fee,
        percent_to_sell,
        time_between_sells,
        dont_sell,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    .run(
      association.accountUsername,
      association.coinName,
      association.coinAddress,
      JSON.stringify(association.coinKeywords),
      association.walletName || "Berkley",
      association.amountToBuy,
      association.slippageBps,
      association.priorityFee,
      association.percentToSell,
      association.timeBetweenSells,
      association.dontSell ? 1 : 0,
      sortOrder
    );

  refreshTradingConfigSnapshot();
  return getAccountCoinAssociations();
}

export function updateAccountCoin(id, payload) {
  const database = getDatabase();
  const associationId = Number(id);
  const association = normalizeAccountCoinPayload(payload);

  if (!Number.isInteger(associationId)) {
    throw new Error("Association id is required");
  }

  const existingAssociation = database
    .prepare("SELECT id, sort_order FROM account_coins WHERE id = ?")
    .get(associationId);

  if (!existingAssociation) {
    throw new Error(`Association ${associationId} does not exist`);
  }

  if (
    !association.accountUsername ||
    !association.coinName ||
    !association.coinAddress
  ) {
    throw new Error("Account, coin name, and coin address are required");
  }

  ensureAccountExists(database, association.accountUsername);

  const sortOrder =
    association.sortOrder === null
      ? existingAssociation.sort_order
      : association.sortOrder;

  database
    .prepare(
      `
      UPDATE account_coins
      SET
        account_username = ?,
        coin_name = ?,
        coin_address = ?,
        coin_keywords_json = ?,
        wallet_name = ?,
        amount_to_buy = ?,
        slippage_bps = ?,
        priority_fee = ?,
        percent_to_sell = ?,
        time_between_sells = ?,
        dont_sell = ?,
        sort_order = ?
      WHERE id = ?
    `
    )
    .run(
      association.accountUsername,
      association.coinName,
      association.coinAddress,
      JSON.stringify(association.coinKeywords),
      association.walletName || "Berkley",
      association.amountToBuy,
      association.slippageBps,
      association.priorityFee,
      association.percentToSell,
      association.timeBetweenSells,
      association.dontSell ? 1 : 0,
      sortOrder,
      associationId
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

  const existingAssociation = database
    .prepare("SELECT id FROM account_coins WHERE id = ?")
    .get(associationId);

  if (!existingAssociation) {
    throw new Error(`Association ${associationId} does not exist`);
  }

  database.prepare("DELETE FROM account_coins WHERE id = ?").run(associationId);

  refreshTradingConfigSnapshot();
  return getAccountCoinAssociations();
}

export function getAccountsWithCoins() {
  const database = getDatabase();
  const accountRows = database
    .prepare(
      `
      SELECT
        username,
        name,
        default_wallet_name,
        buy_any_posted_ca,
        amount_to_buy_for_any_posted_ca,
        slippage_bps_for_any_posted_ca,
        time_to_sell_for_any_posted_ca,
        priority_fee_for_any_posted_ca,
        automatically_buy_coin_json
      FROM accounts
      ORDER BY rowid ASC
    `
    )
    .all();

  const selectCoinsForAccount = database.prepare(
    `
      SELECT
        id,
        coin_name,
        coin_address,
        coin_keywords_json,
        wallet_name,
        amount_to_buy,
        slippage_bps,
        priority_fee,
        percent_to_sell,
        time_between_sells,
        dont_sell,
        sort_order
      FROM account_coins
      WHERE account_username = ?
      ORDER BY sort_order ASC, id ASC
    `
  );

  return accountRows.map((accountRow) => {
    const coinRows = selectCoinsForAccount.all(accountRow.username);
    return {
      username: accountRow.username,
      name: accountRow.name || accountRow.username,
      defaultWalletName: accountRow.default_wallet_name || "Berkley",
      buyAnyPostedCA: accountRow.buy_any_posted_ca === 1,
      amountToBuyForAnyPostedCA: accountRow.amount_to_buy_for_any_posted_ca,
      slippageBpsForAnyPostedCA: accountRow.slippage_bps_for_any_posted_ca,
      timeToSellForAnyPostedCA: accountRow.time_to_sell_for_any_posted_ca,
      priorityFeeForAnyPostedCA: accountRow.priority_fee_for_any_posted_ca,
      automaticallyBuyThisCoin: parseJson(
        accountRow.automatically_buy_coin_json,
        null
      ),
      coins: coinRows.map((coinRow) => ({
        id: coinRow.id,
        name: coinRow.coin_name,
        address: coinRow.coin_address,
        keywords: parseJson(coinRow.coin_keywords_json, []),
        walletName: coinRow.wallet_name || "Berkley",
        amountToBuy: coinRow.amount_to_buy,
        slippageBps: coinRow.slippage_bps,
        priorityFee: coinRow.priority_fee,
        percentToSell: coinRow.percent_to_sell,
        timeBetweenSells: coinRow.time_between_sells,
        dontSell: coinRow.dont_sell === 1,
        sortOrder: coinRow.sort_order,
      })),
    };
  });
}

export function getAccountCoinAssociations() {
  const database = getDatabase();

  const rows = database
    .prepare(
      `
      SELECT
        ac.id,
        ac.account_username,
        a.name AS account_name,
        ac.coin_name,
        ac.coin_address,
        ac.coin_keywords_json,
        ac.wallet_name,
        ac.amount_to_buy,
        ac.slippage_bps,
        ac.priority_fee,
        ac.percent_to_sell,
        ac.time_between_sells,
        ac.dont_sell,
        ac.sort_order
      FROM account_coins ac
      JOIN accounts a ON a.username = ac.account_username
      ORDER BY ac.account_username ASC, ac.sort_order ASC, ac.id ASC
    `
    )
    .all();

  return rows.map((row) => ({
    id: row.id,
    accountUsername: row.account_username,
    accountName: row.account_name || row.account_username,
    coinName: row.coin_name,
    coinAddress: row.coin_address,
    coinKeywords: parseJson(row.coin_keywords_json, []),
    walletName: row.wallet_name || "Berkley",
    amountToBuy: row.amount_to_buy,
    slippageBps: row.slippage_bps,
    priorityFee: row.priority_fee,
    percentToSell: row.percent_to_sell,
    timeBetweenSells: row.time_between_sells,
    dontSell: row.dont_sell === 1,
    sortOrder: row.sort_order,
  }));
}

export function getGlobalCoins() {
  const database = getDatabase();

  return database
    .prepare(
      `
      SELECT symbol, name, address, keywords_json
      FROM coins
      ORDER BY symbol ASC
    `
    )
    .all()
    .map((row) => ({
      symbol: row.symbol,
      name: row.name,
      address: row.address,
      keywords: parseJson(row.keywords_json, []),
    }));
}

export function getTradingConfigDatabasePath() {
  getDatabase();
  return DB_PATH;
}
