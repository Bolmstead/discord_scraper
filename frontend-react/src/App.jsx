import React from "react";

  const h = React.createElement;
  const { useCallback, useEffect, useMemo, useState } = React;

  const WALLET_OPTIONS = ["Berkley", "Sharif"];
  const BULLX_BASE_URL =
    "https://neo.bullx.io/terminal?chainId=1399811149&address=";
  const MAX_DEBUG_LOGS = 250;

  function numberValueOrNull(value) {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  function integerValueOrNull(value) {
    const num = numberValueOrNull(value);
    return num === null ? null : Math.trunc(num);
  }

  function formatNumber(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }

  function keywordsToText(keywords) {
    if (!keywords || keywords.length === 0) {
      return "";
    }
    return keywords.join(", ");
  }

  function splitKeywords(text) {
    if (!text) {
      return [];
    }

    return String(text)
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  function toLogSafeString(value) {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  function buildBullxUrl(address) {
    const trimmedAddress = String(address || "").trim();
    if (!trimmedAddress) {
      return "";
    }

    return `${BULLX_BASE_URL}${encodeURIComponent(trimmedAddress)}`;
  }

  async function apiRequest(path, options) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options && options.headers ? options.headers : {}),
      },
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      const message = payload.error || "Request failed";
      throw new Error(message);
    }

    return payload;
  }

  function LoginCard(props) {
    return h(
      "div",
      { className: "container" },
      h(
        "div",
        { className: "card login-card" },
        h("h1", null, "Trading Config Login"),
        h(
          "p",
          { className: "subtitle" },
          "Sign in with your trading config username/password."
        ),
        props.error ? h("div", { className: "warning" }, props.error) : null,
        h(
          "form",
          {
            onSubmit: props.onSubmit,
            className: "form-grid",
          },
          h("label", { className: "field" },
            h("span", null, "Username"),
            h("input", {
              value: props.username,
              onChange: (event) => props.onUsernameChange(event.target.value),
              autoComplete: "username",
            })
          ),
          h("label", { className: "field" },
            h("span", null, "Password"),
            h("input", {
              type: "password",
              value: props.password,
              onChange: (event) => props.onPasswordChange(event.target.value),
              autoComplete: "current-password",
            })
          ),
          h(
            "button",
            { type: "submit", disabled: props.loading, className: "btn" },
            props.loading ? "Signing in..." : "Sign in"
          )
        )
      )
    );
  }

  function InlineField(props) {
    return h(
      "label",
      { className: "field inline-field" },
      h("span", { className: "field-label" }, props.label),
      props.children
    );
  }

  function IconButton(props) {
    const isDelete = props.icon === "delete";
    return h(
      "button",
      {
        type: "button",
        className: `btn${isDelete ? " danger" : ""} icon-btn`,
        disabled: props.disabled,
        onClick: props.onClick,
        "aria-label": props.label,
        title: props.label,
      },
      isDelete
        ? h(
            "svg",
            { viewBox: "0 0 24 24", "aria-hidden": "true" },
            h("path", {
              d: "M3 6h18v2H3V6zm3 2h12l-1 13H7L6 8zm3-5h6l1 2H8l1-2z",
            })
          )
        : h(
            "svg",
            { viewBox: "0 0 24 24", "aria-hidden": "true" },
            h("path", {
              d: "M4 3h13l3 3v15H4V3zm2 2v14h12V8h-4V5H6zm2 0h4v4H8V5zm1 9h6v4H9v-4z",
            })
          )
    );
  }

  function SectionHeader(props) {
    return h(
      "div",
      { className: "panel-header actions-row" },
      h("div", null, props.title),
      props.children
    );
  }

  function DebugPanel(props) {
    return h(
      "div",
      { className: "panel debug-panel" },
      h(
        "div",
        { className: "panel-header actions-row" },
        h("div", null, `Debug Logs (${props.logs.length})`),
        h(
          "div",
          { className: "actions-row" },
          h(
            "button",
            { className: "btn secondary", onClick: props.onToggle },
            props.visible ? "Hide logs" : "Show logs"
          ),
          h(
            "button",
            { className: "btn secondary", onClick: props.onClear },
            "Clear logs"
          )
        )
      ),
      props.visible
        ? h(
            "div",
            { className: "debug-log-list" },
            props.logs.length === 0
              ? h("div", { className: "status" }, "No logs yet.")
              : props.logs.map((logEntry) =>
                  h(
                    "div",
                    {
                      key: logEntry.id,
                      className: `debug-log-item debug-${logEntry.level}`,
                    },
                    h(
                      "div",
                      { className: "debug-log-head" },
                      h("span", { className: "debug-log-time" }, logEntry.time),
                      h("span", { className: "debug-log-level" }, logEntry.level.toUpperCase())
                    ),
                    h("div", { className: "debug-log-message" }, logEntry.message),
                    logEntry.details
                      ? h("pre", { className: "debug-log-details" }, logEntry.details)
                      : null
                  )
                )
          )
        : null
    );
  }

  function App() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [debugLogs, setDebugLogs] = useState([]);
    const [showDebugLogs, setShowDebugLogs] = useState(true);

    const [authenticated, setAuthenticated] = useState(false);
    const [authEnabled, setAuthEnabled] = useState(true);
    const [viewer, setViewer] = useState("");
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const [databasePath, setDatabasePath] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [accountCoins, setAccountCoins] = useState([]);
    const [coins, setCoins] = useState([]);

    const [accountDrafts, setAccountDrafts] = useState({});
    const [coinDrafts, setCoinDrafts] = useState({});
    const [ruleDrafts, setRuleDrafts] = useState({});

    const [newAccount, setNewAccount] = useState({
      username: "",
      name: "",
      defaultWalletName: WALLET_OPTIONS[0],
    });

    const [newCoin, setNewCoin] = useState({
      symbol: "",
      name: "",
      address: "",
      keywords: "",
    });

    const [newRule, setNewRule] = useState({
      accountUsername: "",
      coinName: "",
      coinAddress: "",
      coinKeywords: "",
      walletName: WALLET_OPTIONS[0],
      amountToBuy: "",
      slippageBps: "",
      priorityFee: "",
      percentToSell: "",
      timeBetweenSells: "",
      dontSell: false,
      sortOrder: "",
    });

    const accountUsernames = useMemo(
      () => accounts.map((account) => account.username),
      [accounts]
    );

    const addDebugLog = useCallback((level, message, details) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        time: new Date().toISOString(),
        level,
        message,
        details: toLogSafeString(details),
      };

      setDebugLogs((currentLogs) => {
        const nextLogs = [...currentLogs, entry];
        if (nextLogs.length > MAX_DEBUG_LOGS) {
          return nextLogs.slice(nextLogs.length - MAX_DEBUG_LOGS);
        }
        return nextLogs;
      });

      const detailText = entry.details ? `\n${entry.details}` : "";
      if (level === "error") {
        console.error(`[UI] ${message}${detailText}`);
      } else {
        console.log(`[UI] ${message}${detailText}`);
      }
    }, []);

    useEffect(() => {
      const originalFetch = window.fetch.bind(window);

      window.fetch = async (input, init = {}) => {
        const method = (init.method || "GET").toUpperCase();
        const url = typeof input === "string" ? input : input?.url || "unknown-url";
        const startedAt = Date.now();
        addDebugLog("info", `HTTP ${method} ${url} (start)`);

        try {
          const response = await originalFetch(input, init);
          addDebugLog(
            response.ok ? "info" : "error",
            `HTTP ${method} ${url} -> ${response.status}`,
            { durationMs: Date.now() - startedAt }
          );
          return response;
        } catch (requestError) {
          addDebugLog("error", `HTTP ${method} ${url} failed`, {
            durationMs: Date.now() - startedAt,
            error: requestError?.message || String(requestError),
          });
          throw requestError;
        }
      };

      return () => {
        window.fetch = originalFetch;
      };
    }, [addDebugLog]);

    useEffect(() => {
      function handleWindowError(event) {
        addDebugLog("error", "Unhandled window error", {
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
        });
      }

      function handleUnhandledRejection(event) {
        addDebugLog("error", "Unhandled promise rejection", {
          reason: event.reason?.message || String(event.reason),
        });
      }

      window.addEventListener("error", handleWindowError);
      window.addEventListener("unhandledrejection", handleUnhandledRejection);

      return () => {
        window.removeEventListener("error", handleWindowError);
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      };
    }, [addDebugLog]);

    function applySnapshot(snapshot) {
      const nextAccounts = snapshot.accounts || [];
      const nextAccountCoins = snapshot.accountCoins || [];
      const nextCoins = snapshot.coins || [];
      addDebugLog("info", "Applied trading config snapshot", {
        accounts: nextAccounts.length,
        accountCoinRules: nextAccountCoins.length,
        coins: nextCoins.length,
      });

      setAccounts(nextAccounts);
      setAccountCoins(nextAccountCoins);
      setCoins(nextCoins);
      setDatabasePath(snapshot.databasePath || "");

      setAccountDrafts(
        Object.fromEntries(
          nextAccounts.map((account) => [
            account.username,
            {
              name: account.name || "",
              defaultWalletName: account.defaultWalletName || WALLET_OPTIONS[0],
              buyAnyPostedCA: !!account.buyAnyPostedCA,
              amountToBuyForAnyPostedCA: formatNumber(
                account.amountToBuyForAnyPostedCA
              ),
              slippageBpsForAnyPostedCA: formatNumber(
                account.slippageBpsForAnyPostedCA
              ),
              timeToSellForAnyPostedCA: formatNumber(
                account.timeToSellForAnyPostedCA
              ),
              priorityFeeForAnyPostedCA: formatNumber(
                account.priorityFeeForAnyPostedCA
              ),
            },
          ])
        )
      );

      setCoinDrafts(
        Object.fromEntries(
          nextCoins.map((coin) => [
            coin.symbol,
            {
              name: coin.name || "",
              address: coin.address || "",
              keywords: keywordsToText(coin.keywords),
            },
          ])
        )
      );

      setRuleDrafts(
        Object.fromEntries(
          nextAccountCoins.map((rule) => [
            rule.id,
            {
              accountUsername: rule.accountUsername || "",
              coinName: rule.coinName || "",
              coinAddress: rule.coinAddress || "",
              coinKeywords: keywordsToText(rule.coinKeywords),
              walletName: rule.walletName || WALLET_OPTIONS[0],
              amountToBuy: formatNumber(rule.amountToBuy),
              slippageBps: formatNumber(rule.slippageBps),
              priorityFee: formatNumber(rule.priorityFee),
              percentToSell: formatNumber(rule.percentToSell),
              timeBetweenSells: formatNumber(rule.timeBetweenSells),
              dontSell: !!rule.dontSell,
              sortOrder: formatNumber(rule.sortOrder),
            },
          ])
        )
      );

      if (nextAccounts.length > 0) {
        setNewRule((current) => ({
          ...current,
          accountUsername:
            current.accountUsername || nextAccounts[0].username || "",
        }));
      }
    }

    async function loadSnapshot() {
      addDebugLog("info", "Loading snapshot...");
      const snapshot = await apiRequest("/api/trading-config/snapshot", {
        method: "GET",
      });
      applySnapshot(snapshot);
    }

    async function checkAuthAndLoad() {
      setLoading(true);
      try {
        addDebugLog("info", "Checking auth session...");
        const auth = await apiRequest("/api/auth/me", { method: "GET" });
        setAuthEnabled(auth.authEnabled !== false);
        setAuthenticated(!!auth.authenticated);
        setViewer(auth.username || "");
        addDebugLog("info", "Auth check complete", {
          authenticated: !!auth.authenticated,
          username: auth.username || null,
          authEnabled: auth.authEnabled !== false,
        });
        await loadSnapshot();
        setError("");
      } catch (authError) {
        addDebugLog("error", "Auth check failed", {
          error: authError?.message || String(authError),
        });
        setAuthEnabled(true);
        setAuthenticated(false);
        setViewer("");
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      checkAuthAndLoad();
    }, []);

    async function withMutation(task) {
      try {
        setSaving(true);
        setStatus("");
        setError("");
        addDebugLog("info", "Mutation started");
        const snapshot = await task();
        applySnapshot(snapshot);
        setStatus("Saved successfully.");
        addDebugLog("info", "Mutation succeeded");
      } catch (mutationError) {
        setError(mutationError.message || "Update failed");
        addDebugLog("error", "Mutation failed", {
          error: mutationError?.message || String(mutationError),
        });
      } finally {
        setSaving(false);
      }
    }

    async function handleLogin(event) {
      event.preventDefault();
      setLoginLoading(true);
      setLoginError("");
      addDebugLog("info", "Login attempt", { username: loginUsername });

      try {
        await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            username: loginUsername,
            password: loginPassword,
          }),
        });

        setAuthenticated(true);
        setViewer(loginUsername);
        setLoginPassword("");
        addDebugLog("info", "Login successful", { username: loginUsername });
        await loadSnapshot();
      } catch (loginRequestError) {
        setLoginError(loginRequestError.message || "Login failed");
        addDebugLog("error", "Login failed", {
          username: loginUsername,
          error: loginRequestError?.message || String(loginRequestError),
        });
      } finally {
        setLoginLoading(false);
      }
    }

    async function handleLogout() {
      if (!authEnabled) {
        return;
      }

      try {
        addDebugLog("info", "Logout requested");
        await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
      } catch {
        // no-op
      }
      setAuthenticated(false);
      setViewer("");
      setAccounts([]);
      setAccountCoins([]);
      setCoins([]);
      setStatus("");
      setError("");
    }

    if (loading) {
      return h("div", { className: "container status" }, "Loading...");
    }

    if (!authenticated) {
      return h(
        React.Fragment,
        null,
        h(LoginCard, {
          error: loginError,
          username: loginUsername,
          password: loginPassword,
          onUsernameChange: setLoginUsername,
          onPasswordChange: setLoginPassword,
          onSubmit: handleLogin,
          loading: loginLoading,
        }),
        h(
          "div",
          { className: "container" },
          h(DebugPanel, {
            logs: debugLogs,
            visible: showDebugLogs,
            onToggle: () => setShowDebugLogs((current) => !current),
            onClear: () => setDebugLogs([]),
          })
        )
      );
    }

    return h(
      "div",
      { className: "container" },
      h(
        "div",
        { className: "header" },
        h("h1", null, "Trading Config Dashboard"),
        h(
          "div",
          { className: "subtitle" },
          `Signed in as ${viewer}`
        ),
        databasePath
          ? h("div", { className: "subtitle" }, `Database: ${databasePath}`)
          : null,
        h(
          "div",
          { className: "actions-row" },
          h(
            "div",
            { className: "actions-row" },
            h(
              "button",
              {
                className: "btn secondary",
                onClick: () => setShowDebugLogs((current) => !current),
              },
              showDebugLogs ? "Hide logs" : "Show logs"
            ),
            h(
              "button",
              { className: "btn secondary", onClick: () => setDebugLogs([]) },
              "Clear logs"
            ),
            authEnabled
              ? h(
                  "button",
                  { className: "btn secondary", onClick: handleLogout },
                  "Sign out"
                )
              : h("span", { className: "subtitle" }, "Local mode (auth disabled)")
          ),
          saving ? h("span", { className: "saving" }, "Saving...") : null
        )
      ),

      status ? h("div", { className: "card success" }, status) : null,
      error ? h("div", { className: "card warning" }, error) : null,

      h(
        "div",
        { className: "panel" },
        h(SectionHeader, { title: "Accounts" }),
        h(
          "form",
          {
            className: "inline-form",
            onSubmit: (event) => {
              event.preventDefault();
              withMutation(() =>
                apiRequest("/api/trading-config/accounts", {
                  method: "POST",
                  body: JSON.stringify(newAccount),
                })
              );
              setNewAccount({
                username: "",
                name: "",
                defaultWalletName: WALLET_OPTIONS[0],
              });
            },
          },
          h(
            InlineField,
            { label: "Username" },
            h("input", {
              value: newAccount.username,
              onChange: (event) =>
                setNewAccount((current) => ({
                  ...current,
                  username: event.target.value,
                })),
              required: true,
              "aria-label": "Account username",
            })
          ),
          h(
            InlineField,
            { label: "Display Name" },
            h("input", {
              value: newAccount.name,
              onChange: (event) =>
                setNewAccount((current) => ({ ...current, name: event.target.value })),
              "aria-label": "Account display name",
            })
          ),
          h(
            InlineField,
            { label: "Default Wallet" },
            h(
              "select",
              {
                value: newAccount.defaultWalletName,
                onChange: (event) =>
                  setNewAccount((current) => ({
                    ...current,
                    defaultWalletName: event.target.value,
                  })),
                "aria-label": "Default wallet",
              },
              WALLET_OPTIONS.map((wallet) =>
                h("option", { key: wallet, value: wallet }, wallet)
              )
            )
          ),
          h(
            "button",
            { type: "submit", className: "btn", disabled: saving },
            "Add account"
          )
        ),
        h(
          "div",
          { className: "table-wrap" },
          h(
            "table",
            null,
            h(
              "thead",
              null,
              h(
                "tr",
                null,
                h("th", null, "Username"),
                h("th", null, "Name"),
                h("th", null, "Default Wallet"),
                h("th", null, "Buy Any CA"),
                h("th", null, "Amount"),
                h("th", null, "Slippage"),
                h("th", null, "Time To Sell"),
                h("th", null, "Priority Fee"),
                h("th", null, "Actions")
              )
            ),
            h(
              "tbody",
              null,
              accounts.map((account) => {
                const draft = accountDrafts[account.username] || {};
                return h(
                  "tr",
                  { key: account.username },
                  h("td", null, account.username),
                  h("td", null,
                    h("input", {
                      value: draft.name || "",
                      "aria-label": `${account.username} name`,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            name: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h(
                      "select",
                      {
                        value: draft.defaultWalletName || WALLET_OPTIONS[0],
                        "aria-label": `${account.username} default wallet`,
                        onChange: (event) =>
                          setAccountDrafts((current) => ({
                            ...current,
                            [account.username]: {
                              ...current[account.username],
                              defaultWalletName: event.target.value,
                            },
                          })),
                      },
                      WALLET_OPTIONS.map((wallet) =>
                        h("option", { key: wallet, value: wallet }, wallet)
                      )
                    )
                  ),
                  h("td", null,
                    h("input", {
                      type: "checkbox",
                      checked: !!draft.buyAnyPostedCA,
                      "aria-label": `${account.username} buy any contract address`,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            buyAnyPostedCA: event.target.checked,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.amountToBuyForAnyPostedCA || "",
                      "aria-label": `${account.username} amount to buy`,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            amountToBuyForAnyPostedCA: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.slippageBpsForAnyPostedCA || "",
                      "aria-label": `${account.username} slippage bps`,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            slippageBpsForAnyPostedCA: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.timeToSellForAnyPostedCA || "",
                      "aria-label": `${account.username} time to sell`,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            timeToSellForAnyPostedCA: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.priorityFeeForAnyPostedCA || "",
                      "aria-label": `${account.username} priority fee`,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            priorityFeeForAnyPostedCA: event.target.value,
                          },
                        })),
                    })
                  ),
                  h(
                    "td",
                    null,
                    h(IconButton, {
                      icon: "save",
                      label: `Save ${account.username}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(() =>
                          apiRequest(
                            `/api/trading-config/accounts/${encodeURIComponent(
                              account.username
                            )}`,
                            {
                              method: "PUT",
                              body: JSON.stringify({
                                ...draft,
                                amountToBuyForAnyPostedCA: numberValueOrNull(
                                  draft.amountToBuyForAnyPostedCA
                                ),
                                slippageBpsForAnyPostedCA: integerValueOrNull(
                                  draft.slippageBpsForAnyPostedCA
                                ),
                                timeToSellForAnyPostedCA: integerValueOrNull(
                                  draft.timeToSellForAnyPostedCA
                                ),
                                priorityFeeForAnyPostedCA: numberValueOrNull(
                                  draft.priorityFeeForAnyPostedCA
                                ),
                              }),
                            }
                          )
                        ),
                    }),
                    h(IconButton, {
                      icon: "delete",
                      label: `Delete ${account.username}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(() =>
                          apiRequest(
                            `/api/trading-config/accounts/${encodeURIComponent(
                              account.username
                            )}`,
                            {
                              method: "DELETE",
                              body: "{}",
                            }
                          )
                        ),
                    })
                  )
                );
              })
            )
          )
        )
      ),

      h(
        "div",
        { className: "panel" },
        h(SectionHeader, { title: "Global Coins" }),
        h(
          "form",
          {
            className: "inline-form",
            onSubmit: (event) => {
              event.preventDefault();
              withMutation(() =>
                apiRequest("/api/trading-config/coins", {
                  method: "POST",
                  body: JSON.stringify({
                    ...newCoin,
                    keywords: splitKeywords(newCoin.keywords),
                  }),
                })
              );
              setNewCoin({ symbol: "", name: "", address: "", keywords: "" });
            },
          },
          h(
            InlineField,
            { label: "Symbol" },
            h("input", {
              value: newCoin.symbol,
              onChange: (event) =>
                setNewCoin((current) => ({ ...current, symbol: event.target.value })),
              required: true,
              "aria-label": "Coin symbol",
            })
          ),
          h(
            InlineField,
            { label: "Name" },
            h("input", {
              value: newCoin.name,
              onChange: (event) =>
                setNewCoin((current) => ({ ...current, name: event.target.value })),
              required: true,
              "aria-label": "Coin name",
            })
          ),
          h(
            InlineField,
            { label: "Address" },
            h("input", {
              value: newCoin.address,
              onChange: (event) =>
                setNewCoin((current) => ({ ...current, address: event.target.value })),
              required: true,
              "aria-label": "Coin address",
            })
          ),
          h(
            InlineField,
            { label: "Keywords" },
            h("input", {
              value: newCoin.keywords,
              onChange: (event) =>
                setNewCoin((current) => ({
                  ...current,
                  keywords: event.target.value,
                })),
              "aria-label": "Coin keywords",
            })
          ),
          h(
            "button",
            { type: "submit", className: "btn", disabled: saving },
            "Add coin"
          )
        ),
        h(
          "div",
          { className: "table-wrap" },
          h(
            "table",
            null,
            h(
              "thead",
              null,
              h(
                "tr",
                null,
                h("th", null, "Symbol"),
                h("th", null, "Name"),
                h("th", null, "Address"),
                h("th", null, "Keywords"),
                h("th", null, "BullX"),
                h("th", null, "Actions")
              )
            ),
            h(
              "tbody",
              null,
              coins.map((coin) => {
                const draft = coinDrafts[coin.symbol] || {};
                const bullxUrl = buildBullxUrl(draft.address || coin.address);
                return h(
                  "tr",
                  { key: coin.symbol },
                  h("td", null, coin.symbol),
                  h("td", null,
                    h("input", {
                      value: draft.name || "",
                      "aria-label": `${coin.symbol} name`,
                      onChange: (event) =>
                        setCoinDrafts((current) => ({
                          ...current,
                          [coin.symbol]: {
                            ...current[coin.symbol],
                            name: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.address || "",
                      "aria-label": `${coin.symbol} address`,
                      onChange: (event) =>
                        setCoinDrafts((current) => ({
                          ...current,
                          [coin.symbol]: {
                            ...current[coin.symbol],
                            address: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.keywords || "",
                      "aria-label": `${coin.symbol} keywords`,
                      onChange: (event) =>
                        setCoinDrafts((current) => ({
                          ...current,
                          [coin.symbol]: {
                            ...current[coin.symbol],
                            keywords: event.target.value,
                          },
                        })),
                    })
                  ),
                  h(
                    "td",
                    null,
                    bullxUrl
                      ? h(
                          "a",
                          {
                            href: bullxUrl,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "external-link",
                            "aria-label": `Open ${coin.symbol} in BullX`,
                          },
                          "Open"
                        )
                      : h("span", { className: "subtitle" }, "-")
                  ),
                  h(
                    "td",
                    null,
                    h(IconButton, {
                      icon: "save",
                      label: `Save ${coin.symbol}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(() =>
                          apiRequest(
                            `/api/trading-config/coins/${encodeURIComponent(
                              coin.symbol
                            )}`,
                            {
                              method: "PUT",
                              body: JSON.stringify({
                                symbol: coin.symbol,
                                name: draft.name,
                                address: draft.address,
                                keywords: splitKeywords(draft.keywords),
                              }),
                            }
                          )
                        ),
                    }),
                    h(IconButton, {
                      icon: "delete",
                      label: `Delete ${coin.symbol}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(() =>
                          apiRequest(
                            `/api/trading-config/coins/${encodeURIComponent(
                              coin.symbol
                            )}`,
                            {
                              method: "DELETE",
                              body: "{}",
                            }
                          )
                        ),
                    })
                  )
                );
              })
            )
          )
        )
      ),

      h(
        "div",
        { className: "panel" },
        h(SectionHeader, { title: "Account-Coin Rules" }),
        h(
          "form",
          {
            className: "inline-form dense",
            onSubmit: (event) => {
              event.preventDefault();
              withMutation(() =>
                apiRequest("/api/trading-config/account-coins", {
                  method: "POST",
                  body: JSON.stringify({
                    ...newRule,
                    coinKeywords: splitKeywords(newRule.coinKeywords),
                    amountToBuy: numberValueOrNull(newRule.amountToBuy),
                    slippageBps: integerValueOrNull(newRule.slippageBps),
                    priorityFee: numberValueOrNull(newRule.priorityFee),
                    percentToSell: numberValueOrNull(newRule.percentToSell),
                    timeBetweenSells: integerValueOrNull(newRule.timeBetweenSells),
                    sortOrder: integerValueOrNull(newRule.sortOrder),
                  }),
                })
              );
              setNewRule((current) => ({
                ...current,
                coinName: "",
                coinAddress: "",
                coinKeywords: "",
                amountToBuy: "",
                slippageBps: "",
                priorityFee: "",
                percentToSell: "",
                timeBetweenSells: "",
                dontSell: false,
                sortOrder: "",
              }));
            },
          },
          h(
            InlineField,
            { label: "Account" },
            h(
              "select",
              {
                value: newRule.accountUsername,
                onChange: (event) =>
                  setNewRule((current) => ({
                    ...current,
                    accountUsername: event.target.value,
                  })),
                required: true,
                "aria-label": "Rule account username",
              },
              h("option", { value: "" }, "Select account"),
              accountUsernames.map((username) =>
                h("option", { key: username, value: username }, username)
              )
            )
          ),
          h(
            InlineField,
            { label: "Coin Name" },
            h("input", {
              value: newRule.coinName,
              onChange: (event) =>
                setNewRule((current) => ({ ...current, coinName: event.target.value })),
              required: true,
              "aria-label": "Rule coin name",
            })
          ),
          h(
            InlineField,
            { label: "Coin Address" },
            h("input", {
              value: newRule.coinAddress,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  coinAddress: event.target.value,
                })),
              required: true,
              "aria-label": "Rule coin address",
            })
          ),
          h(
            InlineField,
            { label: "Keywords" },
            h("input", {
              value: newRule.coinKeywords,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  coinKeywords: event.target.value,
                })),
              "aria-label": "Rule coin keywords",
            })
          ),
          h(
            InlineField,
            { label: "Wallet" },
            h(
              "select",
              {
                value: newRule.walletName,
                onChange: (event) =>
                  setNewRule((current) => ({
                    ...current,
                    walletName: event.target.value,
                  })),
                "aria-label": "Rule wallet",
              },
              WALLET_OPTIONS.map((wallet) =>
                h("option", { key: wallet, value: wallet }, wallet)
              )
            )
          ),
          h(
            InlineField,
            { label: "Amount To Buy" },
            h("input", {
              value: newRule.amountToBuy,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  amountToBuy: event.target.value,
                })),
              "aria-label": "Rule amount to buy",
            })
          ),
          h(
            InlineField,
            { label: "Slippage Bps" },
            h("input", {
              value: newRule.slippageBps,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  slippageBps: event.target.value,
                })),
              "aria-label": "Rule slippage bps",
            })
          ),
          h(
            InlineField,
            { label: "Priority Fee" },
            h("input", {
              value: newRule.priorityFee,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  priorityFee: event.target.value,
                })),
              "aria-label": "Rule priority fee",
            })
          ),
          h(
            InlineField,
            { label: "Percent To Sell" },
            h("input", {
              value: newRule.percentToSell,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  percentToSell: event.target.value,
                })),
              "aria-label": "Rule percent to sell",
            })
          ),
          h(
            InlineField,
            { label: "Time Between Sells" },
            h("input", {
              value: newRule.timeBetweenSells,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  timeBetweenSells: event.target.value,
                })),
              "aria-label": "Rule time between sells",
            })
          ),
          h(
            InlineField,
            { label: "Sort Order" },
            h("input", {
              value: newRule.sortOrder,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  sortOrder: event.target.value,
                })),
              "aria-label": "Rule sort order",
            })
          ),
          h("label", { className: "checkbox-label" },
            h("input", {
              type: "checkbox",
              checked: !!newRule.dontSell,
              "aria-label": "Rule do not sell",
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  dontSell: event.target.checked,
                })),
            }),
            "Dont sell"
          ),
          h(
            "button",
            { type: "submit", className: "btn", disabled: saving },
            "Add rule"
          )
        ),
        h(
          "div",
          { className: "table-wrap" },
          h(
            "table",
            null,
            h(
              "thead",
              null,
              h(
                "tr",
                null,
                h("th", null, "ID"),
                h("th", null, "Account"),
                h("th", null, "Wallet"),
                h("th", null, "Coin Name"),
                h("th", null, "Address"),
                h("th", null, "Keywords"),
                h("th", null, "Buy"),
                h("th", null, "Sell"),
                h("th", null, "Actions")
              )
            ),
            h(
              "tbody",
              null,
              accountCoins.map((rule) => {
                const draft = ruleDrafts[rule.id] || {};
                return h(
                  "tr",
                  { key: rule.id },
                  h("td", null, String(rule.id)),
                  h("td", null,
                    h(
                      "select",
                      {
                        value: draft.accountUsername || "",
                        "aria-label": `Rule ${rule.id} account`,
                        onChange: (event) =>
                          setRuleDrafts((current) => ({
                            ...current,
                            [rule.id]: {
                              ...current[rule.id],
                              accountUsername: event.target.value,
                            },
                          })),
                      },
                      accountUsernames.map((username) =>
                        h("option", { key: username, value: username }, username)
                      )
                    )
                  ),
                  h("td", null,
                    h(
                      "select",
                      {
                        value: draft.walletName || WALLET_OPTIONS[0],
                        "aria-label": `Rule ${rule.id} wallet`,
                        onChange: (event) =>
                          setRuleDrafts((current) => ({
                            ...current,
                            [rule.id]: {
                              ...current[rule.id],
                              walletName: event.target.value,
                            },
                          })),
                      },
                      WALLET_OPTIONS.map((wallet) =>
                        h("option", { key: wallet, value: wallet }, wallet)
                      )
                    )
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.coinName || "",
                      "aria-label": `Rule ${rule.id} coin name`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            coinName: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.coinAddress || "",
                      "aria-label": `Rule ${rule.id} coin address`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            coinAddress: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.coinKeywords || "",
                      "aria-label": `Rule ${rule.id} coin keywords`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            coinKeywords: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.amountToBuy || "",
                      placeholder: "amount",
                      "aria-label": `Rule ${rule.id} amount to buy`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            amountToBuy: event.target.value,
                          },
                        })),
                    }),
                    h("input", {
                      value: draft.slippageBps || "",
                      placeholder: "slippage",
                      "aria-label": `Rule ${rule.id} slippage bps`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            slippageBps: event.target.value,
                          },
                        })),
                    }),
                    h("input", {
                      value: draft.priorityFee || "",
                      placeholder: "priority",
                      "aria-label": `Rule ${rule.id} priority fee`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            priorityFee: event.target.value,
                          },
                        })),
                    })
                  ),
                  h("td", null,
                    h("input", {
                      value: draft.percentToSell || "",
                      placeholder: "% sell",
                      "aria-label": `Rule ${rule.id} percent to sell`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            percentToSell: event.target.value,
                          },
                        })),
                    }),
                    h("input", {
                      value: draft.timeBetweenSells || "",
                      placeholder: "ms between sells",
                      "aria-label": `Rule ${rule.id} time between sells`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            timeBetweenSells: event.target.value,
                          },
                        })),
                    }),
                    h("input", {
                      value: draft.sortOrder || "",
                      placeholder: "sort",
                      "aria-label": `Rule ${rule.id} sort order`,
                      onChange: (event) =>
                        setRuleDrafts((current) => ({
                          ...current,
                          [rule.id]: {
                            ...current[rule.id],
                            sortOrder: event.target.value,
                          },
                        })),
                    }),
                    h("label", { className: "checkbox-label" },
                      h("input", {
                        type: "checkbox",
                        checked: !!draft.dontSell,
                        "aria-label": `Rule ${rule.id} do not sell`,
                        onChange: (event) =>
                          setRuleDrafts((current) => ({
                            ...current,
                            [rule.id]: {
                              ...current[rule.id],
                              dontSell: event.target.checked,
                            },
                          })),
                      }),
                      "Dont sell"
                    )
                  ),
                  h(
                    "td",
                    null,
                    h(IconButton, {
                      icon: "save",
                      label: `Save rule ${rule.id}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(() =>
                          apiRequest(`/api/trading-config/account-coins/${rule.id}`, {
                            method: "PUT",
                            body: JSON.stringify({
                              ...draft,
                              coinKeywords: splitKeywords(draft.coinKeywords),
                              amountToBuy: numberValueOrNull(draft.amountToBuy),
                              slippageBps: integerValueOrNull(draft.slippageBps),
                              priorityFee: numberValueOrNull(draft.priorityFee),
                              percentToSell: numberValueOrNull(draft.percentToSell),
                              timeBetweenSells: integerValueOrNull(
                                draft.timeBetweenSells
                              ),
                              sortOrder: integerValueOrNull(draft.sortOrder),
                            }),
                          })
                        ),
                    }),
                    h(IconButton, {
                      icon: "delete",
                      label: `Delete rule ${rule.id}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(() =>
                          apiRequest(`/api/trading-config/account-coins/${rule.id}`, {
                            method: "DELETE",
                            body: "{}",
                          })
                        ),
                    })
                  )
                );
              })
            )
          )
        )
      )
      ,
      h(DebugPanel, {
        logs: debugLogs,
        visible: showDebugLogs,
        onToggle: () => setShowDebugLogs((current) => !current),
        onClear: () => setDebugLogs([]),
      })
    );
  }


export default App;
