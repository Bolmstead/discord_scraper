import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { URL } from "node:url";
import {
  createAccount,
  createAccountCoin,
  createGlobalCoin,
  deleteAccount,
  deleteAccountCoin,
  deleteGlobalCoin,
  getAccountsWithCoins,
  getAccountCoinAssociations,
  getGlobalCoins,
  getTradingConfigDatabasePath,
  updateAccount,
  updateAccountCoin,
  updateGlobalCoin,
} from "./db/tradingConfigDb.js";

const PORT = Number(process.env.TRADING_CONFIG_PORT || 3030);
const HOST = process.env.TRADING_CONFIG_HOST || "127.0.0.1";
const AUTH_ENABLED = String(process.env.TRADING_CONFIG_AUTH || "false") === "true";
const FRONTEND_DIR = path.resolve(process.cwd(), "frontend");
const SESSION_COOKIE_NAME = "trading_config_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

const AUTH_USER_HASHES = new Map([
  ["Berkley", "c50281c3dd92d836d2ba7702fad19f778404cddd49059afc7b2e6e537f436ea7"],
  ["Sharif", "cbfad02f9ed2a8d1e08d8f74f5303e9eb93637d47f82ab6f1c15871cf8dd0481"],
]);

const sessions = new Map();

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

function sendFile(res, filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType =
      CONTENT_TYPES[extension] || "application/octet-stream; charset=utf-8";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(fileBuffer);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

function resolveFrontendPath(pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const fullPath = path.resolve(FRONTEND_DIR, `.${requestedPath}`);

  if (!fullPath.startsWith(FRONTEND_DIR)) {
    return null;
  }

  return fullPath;
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) {
    return {};
  }

  const cookiePairs = header.split(";");
  const cookies = {};
  for (const pair of cookiePairs) {
    const index = pair.indexOf("=");
    if (index === -1) {
      continue;
    }

    const key = decodeURIComponent(pair.slice(0, index).trim());
    const value = decodeURIComponent(pair.slice(index + 1).trim());
    cookies[key] = value;
  }

  return cookies;
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function timingSafeEqualStrings(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      token
    )}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function getSessionFromRequest(req) {
  cleanupExpiredSessions();

  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { token, ...session };
}

function requireAuth(req, res) {
  if (!AUTH_ENABLED) {
    return { username: "local" };
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    sendJson(res, 401, { error: "Authentication required" });
    return null;
  }

  return session;
}

function parseRouteParam(pathname, expression) {
  const match = pathname.match(expression);
  if (!match) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

function sendTradingConfigSnapshot(res) {
  return sendJson(res, 200, {
    accounts: getAccountsWithCoins(),
    accountCoins: getAccountCoinAssociations(),
    coins: getGlobalCoins(),
    databasePath: getTradingConfigDatabasePath(),
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host}`);
    const { pathname } = requestUrl;

    if (req.method === "POST" && pathname === "/api/auth/login") {
      if (!AUTH_ENABLED) {
        return sendJson(res, 200, {
          authenticated: true,
          username: "local",
          authEnabled: false,
        });
      }

      const body = await parseRequestBody(req);
      const username = String(body.username || "").trim();
      const password = String(body.password || "");

      const expectedHash = AUTH_USER_HASHES.get(username);
      if (!expectedHash) {
        return sendJson(res, 401, { error: "Invalid username or password" });
      }

      const providedHash = hashPassword(password);
      if (!timingSafeEqualStrings(providedHash, expectedHash)) {
        return sendJson(res, 401, { error: "Invalid username or password" });
      }

      const sessionToken = crypto.randomBytes(32).toString("hex");
      sessions.set(sessionToken, {
        username,
        expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
      });
      setSessionCookie(res, sessionToken);

      return sendJson(res, 200, {
        authenticated: true,
        username,
      });
    }

    if (req.method === "POST" && pathname === "/api/auth/logout") {
      if (!AUTH_ENABLED) {
        return sendJson(res, 200, { authenticated: true, username: "local", authEnabled: false });
      }

      const currentSession = getSessionFromRequest(req);
      if (currentSession?.token) {
        sessions.delete(currentSession.token);
      }

      clearSessionCookie(res);
      return sendJson(res, 200, { authenticated: false });
    }

    if (req.method === "GET" && pathname === "/api/auth/me") {
      if (!AUTH_ENABLED) {
        return sendJson(res, 200, {
          authenticated: true,
          username: "local",
          authEnabled: false,
        });
      }

      const currentSession = getSessionFromRequest(req);
      if (!currentSession) {
        return sendJson(res, 401, { authenticated: false, authEnabled: true });
      }

      return sendJson(res, 200, {
        authenticated: true,
        username: currentSession.username,
        authEnabled: true,
      });
    }

    if (pathname.startsWith("/api/trading-config")) {
      const session = requireAuth(req, res);
      if (!session) {
        return;
      }

      if (req.method === "GET" && pathname === "/api/trading-config/snapshot") {
        return sendTradingConfigSnapshot(res);
      }

      if (req.method === "GET" && pathname === "/api/trading-config/accounts") {
        return sendJson(res, 200, {
          accounts: getAccountsWithCoins(),
          databasePath: getTradingConfigDatabasePath(),
          authenticatedUser: session.username,
        });
      }

      if (
        req.method === "GET" &&
        pathname === "/api/trading-config/account-coins"
      ) {
        return sendJson(res, 200, {
          accountCoins: getAccountCoinAssociations(),
          databasePath: getTradingConfigDatabasePath(),
          authenticatedUser: session.username,
        });
      }

      if (req.method === "GET" && pathname === "/api/trading-config/coins") {
        return sendJson(res, 200, {
          coins: getGlobalCoins(),
          databasePath: getTradingConfigDatabasePath(),
          authenticatedUser: session.username,
        });
      }

      if (req.method === "POST" && pathname === "/api/trading-config/accounts") {
        const body = await parseRequestBody(req);
        createAccount(body);
        return sendTradingConfigSnapshot(res);
      }

      const accountUsername = parseRouteParam(
        pathname,
        /^\/api\/trading-config\/accounts\/([^/]+)$/
      );
      if (accountUsername && req.method === "PUT") {
        const body = await parseRequestBody(req);
        updateAccount(accountUsername, body);
        return sendTradingConfigSnapshot(res);
      }

      if (accountUsername && req.method === "DELETE") {
        deleteAccount(accountUsername);
        return sendTradingConfigSnapshot(res);
      }

      if (req.method === "POST" && pathname === "/api/trading-config/coins") {
        const body = await parseRequestBody(req);
        createGlobalCoin(body);
        return sendTradingConfigSnapshot(res);
      }

      const coinSymbol = parseRouteParam(
        pathname,
        /^\/api\/trading-config\/coins\/([^/]+)$/
      );
      if (coinSymbol && req.method === "PUT") {
        const body = await parseRequestBody(req);
        updateGlobalCoin(coinSymbol, body);
        return sendTradingConfigSnapshot(res);
      }

      if (coinSymbol && req.method === "DELETE") {
        deleteGlobalCoin(coinSymbol);
        return sendTradingConfigSnapshot(res);
      }

      if (
        req.method === "POST" &&
        pathname === "/api/trading-config/account-coins"
      ) {
        const body = await parseRequestBody(req);
        createAccountCoin(body);
        return sendTradingConfigSnapshot(res);
      }

      const associationId = parseRouteParam(
        pathname,
        /^\/api\/trading-config\/account-coins\/(\d+)$/
      );
      if (associationId && req.method === "PUT") {
        const body = await parseRequestBody(req);
        updateAccountCoin(associationId, body);
        return sendTradingConfigSnapshot(res);
      }

      if (associationId && req.method === "DELETE") {
        deleteAccountCoin(associationId);
        return sendTradingConfigSnapshot(res);
      }

      return sendJson(res, 405, { error: "Unsupported API route or method" });
    }

    if (req.method !== "GET") {
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    const staticPath = resolveFrontendPath(pathname);
    if (
      !staticPath ||
      !fs.existsSync(staticPath) ||
      fs.statSync(staticPath).isDirectory()
    ) {
      return sendJson(res, 404, { error: "Not found" });
    }

    return sendFile(res, staticPath);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Unexpected error" });
  }
});

server.on("error", (error) => {
  console.error(`Unable to start trading config server: ${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`Trading config UI running at http://localhost:${PORT}`);
  console.log(`Database: ${getTradingConfigDatabasePath()}`);
});
