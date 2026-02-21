import React from "react";

const h = React.createElement;
const { useEffect, useState } = React;

const BULLX_BASE_URL =
  "https://neo.bullx.io/terminal?chainId=1399811149&address=";

function numberValueOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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

function keywordsToText(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return "";
  }

  return keywords.join(", ");
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
    throw new Error(payload.error || "Request failed");
  }

  return payload;
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
        h(
          "label",
          { className: "field" },
          h("span", null, "Username"),
          h("input", {
            value: props.username,
            onChange: (event) => props.onUsernameChange(event.target.value),
            autoComplete: "username",
          })
        ),
        h(
          "label",
          { className: "field" },
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

function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [authenticated, setAuthenticated] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(true);
  const [viewer, setViewer] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [databasePath, setDatabasePath] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [accountDrafts, setAccountDrafts] = useState({});
  const [newAccount, setNewAccount] = useState({ username: "", name: "" });
  const [newCoinForms, setNewCoinForms] = useState({});
  const [coinDrafts, setCoinDrafts] = useState({});

  function applySnapshot(snapshot) {
    const nextAccounts = snapshot.accounts || [];
    setAccounts(nextAccounts);
    setDatabasePath(snapshot.databasePath || "");

    setAccountDrafts(
      Object.fromEntries(
        nextAccounts.map((account) => [
          account.username,
          {
            name: account.name || "",
          },
        ])
      )
    );

    setCoinDrafts(
      Object.fromEntries(
        nextAccounts.flatMap((account) =>
          (account.coins || []).map((coin) => [
            coin.id,
            {
              coinName: coin.name || "",
              coinAddress: coin.address || "",
              coinKeywords: keywordsToText(coin.keywords),
              amountToBuySol:
                coin.amountToBuySol === null || coin.amountToBuySol === undefined
                  ? ""
                  : String(coin.amountToBuySol),
            },
          ])
        )
      )
    );

    setNewCoinForms((current) => {
      const next = {};
      for (const account of nextAccounts) {
        next[account.username] =
          current[account.username] || {
            coinName: "",
            coinAddress: "",
            coinKeywords: "",
            amountToBuySol: "",
          };
      }
      return next;
    });
  }

  async function loadSnapshot() {
    const snapshot = await apiRequest("/api/trading-config/snapshot", {
      method: "GET",
    });
    applySnapshot(snapshot);
  }

  async function checkAuthAndLoad() {
    setLoading(true);
    try {
      const auth = await apiRequest("/api/auth/me", { method: "GET" });
      setAuthEnabled(auth.authEnabled !== false);
      setAuthenticated(!!auth.authenticated);
      setViewer(auth.username || "");
      await loadSnapshot();
      setError("");
    } catch {
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

  async function withMutation(task, successMessage = "Saved successfully.") {
    try {
      setSaving(true);
      setStatus("");
      setError("");
      const snapshot = await task();
      applySnapshot(snapshot);
      setStatus(successMessage);
    } catch (mutationError) {
      setError(mutationError.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

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
      await loadSnapshot();
    } catch (loginRequestError) {
      setLoginError(loginRequestError.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    if (!authEnabled) {
      return;
    }

    try {
      await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
    } catch {
      // no-op
    }

    setAuthenticated(false);
    setViewer("");
    setAccounts([]);
    setStatus("");
    setError("");
  }

  function handleCreateAccount(event) {
    event.preventDefault();
    withMutation(
      () =>
        apiRequest("/api/trading-config/accounts", {
          method: "POST",
          body: JSON.stringify(newAccount),
        }),
      "Account created."
    );
    setNewAccount({ username: "", name: "" });
  }

  function handleCreateCoin(accountUsername, event) {
    event.preventDefault();
    const draft =
      newCoinForms[accountUsername] || {
        coinName: "",
        coinAddress: "",
        coinKeywords: "",
        amountToBuySol: "",
      };

    withMutation(
      () =>
        apiRequest("/api/trading-config/account-coins", {
          method: "POST",
          body: JSON.stringify({
            accountUsername,
            coinName: draft.coinName,
            coinAddress: draft.coinAddress,
            coinKeywords: splitKeywords(draft.coinKeywords),
            amountToBuySol: numberValueOrNull(draft.amountToBuySol),
          }),
        }),
      "Coin added."
    );

    setNewCoinForms((current) => ({
      ...current,
      [accountUsername]: {
        coinName: "",
        coinAddress: "",
        coinKeywords: "",
        amountToBuySol: "",
      },
    }));
  }

  if (loading) {
    return h("div", { className: "container status" }, "Loading...");
  }

  if (!authenticated) {
    return h(LoginCard, {
      error: loginError,
      username: loginUsername,
      password: loginPassword,
      onUsernameChange: setLoginUsername,
      onPasswordChange: setLoginPassword,
      onSubmit: handleLogin,
      loading: loginLoading,
    });
  }

  return h(
    "div",
    { className: "container" },
    h(
      "div",
      { className: "header" },
      h("h1", null, "Trading Config Dashboard"),
      h("div", { className: "subtitle" }, `Signed in as ${viewer}`),
      databasePath
        ? h("div", { className: "subtitle" }, `Database: ${databasePath}`)
        : null,
      h(
        "div",
        { className: "actions-row" },
        h("div", null),
        h(
          "div",
          { className: "actions-row" },
          authEnabled
            ? h(
                "button",
                { className: "btn secondary", onClick: handleLogout },
                "Sign out"
              )
            : h("span", { className: "subtitle" }, "Local mode (auth disabled)"),
          saving ? h("span", { className: "saving" }, "Saving...") : null
        )
      )
    ),

    status ? h("div", { className: "card success" }, status) : null,
    error ? h("div", { className: "card warning" }, error) : null,

    h(
      "div",
      { className: "panel" },
      h("div", { className: "panel-header" }, "Accounts"),
      h(
        "form",
        { className: "inline-form", onSubmit: handleCreateAccount },
        h(
          InlineField,
          { label: "Username" },
          h("input", {
            value: newAccount.username,
            required: true,
            onChange: (event) =>
              setNewAccount((current) => ({
                ...current,
                username: event.target.value,
              })),
          })
        ),
        h(
          InlineField,
          { label: "Display Name" },
          h("input", {
            value: newAccount.name,
            onChange: (event) =>
              setNewAccount((current) => ({ ...current, name: event.target.value })),
          })
        ),
        h(
          "button",
          { type: "submit", className: "btn", disabled: saving },
          "Add account"
        )
      ),

      h(
        "div",
        { className: "accounts-stack" },
        accounts.length === 0
          ? h("div", { className: "status" }, "No accounts yet.")
          : accounts.map((account) => {
              const accountDraft = accountDrafts[account.username] || { name: "" };
              const newCoin =
                newCoinForms[account.username] || {
                  coinName: "",
                  coinAddress: "",
                  coinKeywords: "",
                  amountToBuySol: "",
                };

              return h(
                "div",
                { key: account.username, className: "account-card" },
                h(
                  "div",
                  { className: "account-top" },
                  h("div", { className: "account-title" }, account.username),
                  h(
                    "div",
                    { className: "actions-cell" },
                    h(IconButton, {
                      icon: "save",
                      label: `Save ${account.username}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(
                          () =>
                            apiRequest(
                              `/api/trading-config/accounts/${encodeURIComponent(
                                account.username
                              )}`,
                              {
                                method: "PUT",
                                body: JSON.stringify({ name: accountDraft.name }),
                              }
                            ),
                          "Account updated."
                        ),
                    }),
                    h(IconButton, {
                      icon: "delete",
                      label: `Delete ${account.username}`,
                      disabled: saving,
                      onClick: () =>
                        withMutation(
                          () =>
                            apiRequest(
                              `/api/trading-config/accounts/${encodeURIComponent(
                                account.username
                              )}`,
                              {
                                method: "DELETE",
                                body: "{}",
                              }
                            ),
                          "Account removed."
                        ),
                    })
                  )
                ),

                h(
                  "div",
                  { className: "inline-form" },
                  h(
                    InlineField,
                    { label: "Display Name" },
                    h("input", {
                      value: accountDraft.name,
                      onChange: (event) =>
                        setAccountDrafts((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            name: event.target.value,
                          },
                        })),
                    })
                  )
                ),

                h("div", { className: "coins-title" }, "Coins"),
                h(
                  "form",
                  {
                    className: "inline-form",
                    onSubmit: (event) => handleCreateCoin(account.username, event),
                  },
                  h(
                    InlineField,
                    { label: "Coin Name" },
                    h("input", {
                      value: newCoin.coinName,
                      required: true,
                      onChange: (event) =>
                        setNewCoinForms((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            coinName: event.target.value,
                          },
                        })),
                    })
                  ),
                  h(
                    InlineField,
                    { label: "Address" },
                    h("input", {
                      value: newCoin.coinAddress,
                      required: true,
                      onChange: (event) =>
                        setNewCoinForms((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            coinAddress: event.target.value,
                          },
                        })),
                    })
                  ),
                  h(
                    InlineField,
                    { label: "Keywords" },
                    h("input", {
                      value: newCoin.coinKeywords,
                      onChange: (event) =>
                        setNewCoinForms((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            coinKeywords: event.target.value,
                          },
                        })),
                    })
                  ),
                  h(
                    InlineField,
                    { label: "Buy Amount (SOL)" },
                    h("input", {
                      value: newCoin.amountToBuySol,
                      required: true,
                      onChange: (event) =>
                        setNewCoinForms((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            amountToBuySol: event.target.value,
                          },
                        })),
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
                        h("th", null, "Name"),
                        h("th", null, "Address"),
                        h("th", null, "Keywords"),
                        h("th", null, "Buy (SOL)"),
                        h("th", null, "BullX"),
                        h("th", null, "Actions")
                      )
                    ),
                    h(
                      "tbody",
                      null,
                      (account.coins || []).map((coin) => {
                        const coinDraft = coinDrafts[coin.id] || {
                          coinName: coin.name || "",
                          coinAddress: coin.address || "",
                          coinKeywords: keywordsToText(coin.keywords),
                          amountToBuySol:
                            coin.amountToBuySol === null ||
                            coin.amountToBuySol === undefined
                              ? ""
                              : String(coin.amountToBuySol),
                        };
                        const bullxUrl = buildBullxUrl(coinDraft.coinAddress);

                        return h(
                          "tr",
                          { key: coin.id },
                          h(
                            "td",
                            null,
                            h("input", {
                              value: coinDraft.coinName,
                              onChange: (event) =>
                                setCoinDrafts((current) => ({
                                  ...current,
                                  [coin.id]: {
                                    ...current[coin.id],
                                    coinName: event.target.value,
                                  },
                                })),
                            })
                          ),
                          h(
                            "td",
                            null,
                            h("input", {
                              value: coinDraft.coinAddress,
                              onChange: (event) =>
                                setCoinDrafts((current) => ({
                                  ...current,
                                  [coin.id]: {
                                    ...current[coin.id],
                                    coinAddress: event.target.value,
                                  },
                                })),
                            })
                          ),
                          h(
                            "td",
                            null,
                            h("input", {
                              value: coinDraft.coinKeywords,
                              onChange: (event) =>
                                setCoinDrafts((current) => ({
                                  ...current,
                                  [coin.id]: {
                                    ...current[coin.id],
                                    coinKeywords: event.target.value,
                                  },
                                })),
                            })
                          ),
                          h(
                            "td",
                            null,
                            h("input", {
                              value: coinDraft.amountToBuySol,
                              onChange: (event) =>
                                setCoinDrafts((current) => ({
                                  ...current,
                                  [coin.id]: {
                                    ...current[coin.id],
                                    amountToBuySol: event.target.value,
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
                                  },
                                  "Open"
                                )
                              : h("span", { className: "subtitle" }, "-")
                          ),
                          h(
                            "td",
                            { className: "actions-cell" },
                            h(IconButton, {
                              icon: "save",
                              label: `Save coin ${coin.id}`,
                              disabled: saving,
                              onClick: () =>
                                withMutation(
                                  () =>
                                    apiRequest(
                                      `/api/trading-config/account-coins/${coin.id}`,
                                      {
                                        method: "PUT",
                                        body: JSON.stringify({
                                          accountUsername: account.username,
                                          coinName: coinDraft.coinName,
                                          coinAddress: coinDraft.coinAddress,
                                          coinKeywords: splitKeywords(
                                            coinDraft.coinKeywords
                                          ),
                                          amountToBuySol: numberValueOrNull(
                                            coinDraft.amountToBuySol
                                          ),
                                        }),
                                      }
                                    ),
                                  "Coin updated."
                                ),
                            }),
                            h(IconButton, {
                              icon: "delete",
                              label: `Delete coin ${coin.id}`,
                              disabled: saving,
                              onClick: () =>
                                withMutation(
                                  () =>
                                    apiRequest(
                                      `/api/trading-config/account-coins/${coin.id}`,
                                      {
                                        method: "DELETE",
                                        body: "{}",
                                      }
                                    ),
                                  "Coin removed."
                                ),
                            })
                          )
                        );
                      })
                    )
                  )
                )
              );
            })
      )
    )
  );
}

export default App;
