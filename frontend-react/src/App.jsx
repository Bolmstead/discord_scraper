import React from "react";

const h = React.createElement;
const { useEffect, useState } = React;

const BULLX_BASE_URL =
  "https://neo.bullx.io/terminal?chainId=1399811149&address=";
const WALLET_OPTIONS = ["Berkley", "Sharif"];

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

function StatusModal(props) {
  if (!props.modal) {
    return null;
  }

  const tone = props.modal.tone || "success";

  return h(
    "div",
    {
      className: "modal-backdrop",
      onClick: () => {
        if (props.onClose) {
          props.onClose();
        }
      },
    },
    h(
      "div",
      {
        className: `modal-card modal-card-${tone}`,
        role: "dialog",
        "aria-modal": "true",
        "aria-live": "polite",
        "aria-label": props.modal.title || "Status update",
        onClick: (event) => event.stopPropagation(),
      },
      h("h3", null, props.modal.title),
      props.modal.message ? h("p", null, props.modal.message) : null
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
  const [statusModal, setStatusModal] = useState(null);

  const [authenticated, setAuthenticated] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(true);
  const [viewer, setViewer] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [databasePath, setDatabasePath] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    username: "",
    name: "",
    imageUrl: "",
  });
  const [newCoinForms, setNewCoinForms] = useState({});
  const [coinDrafts, setCoinDrafts] = useState({});

  function applySnapshot(snapshot) {
    const nextAccounts = snapshot.accounts || [];
    setAccounts(nextAccounts);
    setDatabasePath(snapshot.databasePath || "");

    setCoinDrafts(
      Object.fromEntries(
        nextAccounts.flatMap((account) =>
          (account.coins || []).map((coin) => [
            coin.id,
            {
              coinName: coin.name || "",
              coinAddress: coin.address || "",
              coinKeywords: keywordsToText(coin.keywords),
              walletName: coin.walletName || "",
              amountToBuySol:
                coin.amountToBuySol === null || coin.amountToBuySol === undefined
                  ? ""
                  : String(coin.amountToBuySol),
              percentToSell:
                coin.percentToSell === null || coin.percentToSell === undefined
                  ? ""
                  : String(coin.percentToSell),
              timeBetweenSellsSeconds:
                coin.timeBetweenSellsSeconds === null ||
                coin.timeBetweenSellsSeconds === undefined
                  ? ""
                  : String(coin.timeBetweenSellsSeconds),
            },
          ])
        )
      )
    );

    setNewCoinForms((current) => {
      const next = {};
      for (const account of nextAccounts) {
        next[account.username] = {
          coinName: "",
          coinAddress: "",
          coinKeywords: "",
          walletName: "",
          amountToBuySol: "",
          percentToSell: "",
          timeBetweenSellsSeconds: "",
          ...(current[account.username] || {}),
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

  useEffect(() => {
    if (!statusModal) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setStatusModal(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      setStatusModal(null);
    }, 2000);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [statusModal]);

  async function withMutation(task, options = {}) {
    const { alertTitle = "", alertMessage = "" } = options;

    try {
      setSaving(true);
      setError("");
      setStatusModal(null);
      const snapshot = await task();
      applySnapshot(snapshot);
      if (alertTitle || alertMessage) {
        setStatusModal({
          title: alertTitle || "Saved",
          message: alertMessage,
          tone: "success",
        });
      } else {
        setStatusModal(null);
      }
    } catch (mutationError) {
      setStatusModal(null);
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
      const loginResult = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      setAuthenticated(true);
      setViewer(loginResult.username || String(loginUsername || "").trim());
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
    setError("");
  }

  function handleCreateAccount(event) {
    event.preventDefault();
    const accountDetails = {
      username: String(newAccount.username || "").trim(),
      name: String(newAccount.name || "").trim(),
    };

    withMutation(
      () =>
        apiRequest("/api/trading-config/accounts", {
          method: "POST",
          body: JSON.stringify(newAccount),
        }),
      {
        alertTitle: "Saved",
        alertMessage: `${
          accountDetails.name || accountDetails.username || "New account"
        } created.`,
      }
    );
    setNewAccount({ username: "", name: "", imageUrl: "" });
  }

  function handleCreateCoin(accountUsername, event) {
    event.preventDefault();
    const draft =
      newCoinForms[accountUsername] || {
        coinName: "",
        coinAddress: "",
        coinKeywords: "",
        walletName: "",
        amountToBuySol: "",
        percentToSell: "",
        timeBetweenSellsSeconds: "",
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
            walletName: draft.walletName,
            amountToBuySol: numberValueOrNull(draft.amountToBuySol),
            percentToSell: numberValueOrNull(draft.percentToSell),
            timeBetweenSellsSeconds: numberValueOrNull(
              draft.timeBetweenSellsSeconds
            ),
          }),
        }),
      { alertTitle: "Saved" }
    );

    setNewCoinForms((current) => ({
      ...current,
      [accountUsername]: {
        coinName: "",
        coinAddress: "",
        coinKeywords: "",
        walletName: "",
        amountToBuySol: "",
        percentToSell: "",
        timeBetweenSellsSeconds: "",
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

  const viewerLabel = String(viewer || "").trim() || "unknown";

  return h(
    "div",
    { className: "container" },
    h(StatusModal, {
      modal: statusModal,
      onClose: () => setStatusModal(null),
    }),
    h(
      "div",
      { className: "header" },
      h("h1", null, "Trading Config Dashboard"),
      databasePath
        ? h("div", { className: "subtitle" }, `Database: ${databasePath}`)
        : null,
      h(
        "div",
        { className: "actions-row" },
        h(
          "div",
          { className: "viewer-badge", "aria-live": "polite" },
          h("span", { className: "viewer-badge-label" }, "Logged in as"),
          h("span", { className: "viewer-badge-name" }, viewerLabel),
          authEnabled
            ? null
            : h("span", { className: "viewer-badge-mode" }, "auth disabled")
        ),
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
          null
        )
      )
    ),

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
          InlineField,
          { label: "Image URL" },
          h("input", {
            value: newAccount.imageUrl,
            onChange: (event) =>
              setNewAccount((current) => ({
                ...current,
                imageUrl: event.target.value,
              })),
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
                const newCoin =
                newCoinForms[account.username] || {
                  coinName: "",
                  coinAddress: "",
                  coinKeywords: "",
                  walletName: "",
                  amountToBuySol: "",
                  percentToSell: "",
                  timeBetweenSellsSeconds: "",
                  };
              const displayName = account.name || account.username;
              const avatarInitial = (displayName || "?").charAt(0).toUpperCase();
              const avatarUrl = String(account.imageUrl || "").trim();

              return h(
                "div",
                { key: account.username, className: "account-card" },
                h(
                  "div",
                  { className: "account-top" },
                  h(
                    "div",
                    { className: "account-identity" },
                    avatarUrl
                      ? h("img", {
                          className: "account-avatar",
                          src: avatarUrl,
                          alt: `${displayName} avatar`,
                        })
                      : h("div", { className: "account-avatar fallback" }, avatarInitial),
                    h(
                      "div",
                      { className: "account-names" },
                      h("span", { className: "account-title" }, account.username),
                      h("span", { className: "account-display-name" }, displayName)
                    )
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
                    { label: "Wallet" },
                    h(
                      "select",
                      {
                        value: newCoin.walletName,
                        required: true,
                        onChange: (event) =>
                          setNewCoinForms((current) => ({
                            ...current,
                            [account.username]: {
                              ...current[account.username],
                              walletName: event.target.value,
                            },
                          })),
                      },
                      h("option", { value: "" }, "Select wallet"),
                      WALLET_OPTIONS.map((walletName) =>
                        h("option", { key: walletName, value: walletName }, walletName)
                      )
                    )
                  ),
                  h(
                    InlineField,
                    { label: "Buy Amount (SOL)" },
                    h("input", {
                      value: newCoin.amountToBuySol,
                      type: "number",
                      step: "any",
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
                    InlineField,
                    { label: "Sell (%)" },
                    h("input", {
                      value: newCoin.percentToSell,
                      type: "number",
                      step: "any",
                      min: "0",
                      max: "100",
                      required: true,
                      onChange: (event) =>
                        setNewCoinForms((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            percentToSell: event.target.value,
                          },
                        })),
                    })
                  ),
                  h(
                    InlineField,
                    { label: "Seconds Between Sells" },
                    h("input", {
                      value: newCoin.timeBetweenSellsSeconds,
                      type: "number",
                      step: "1",
                      min: "0",
                      required: true,
                      onChange: (event) =>
                        setNewCoinForms((current) => ({
                          ...current,
                          [account.username]: {
                            ...current[account.username],
                            timeBetweenSellsSeconds: event.target.value,
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
                        h("th", null, "Wallet"),
                        h("th", null, "Buy (SOL)"),
                        h("th", null, "Sell (%)"),
                        h("th", null, "Seconds"),
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
                          walletName: coin.walletName || "",
                          amountToBuySol:
                            coin.amountToBuySol === null ||
                            coin.amountToBuySol === undefined
                              ? ""
                              : String(coin.amountToBuySol),
                          percentToSell:
                            coin.percentToSell === null ||
                            coin.percentToSell === undefined
                              ? ""
                              : String(coin.percentToSell),
                          timeBetweenSellsSeconds:
                            coin.timeBetweenSellsSeconds === null ||
                            coin.timeBetweenSellsSeconds === undefined
                              ? ""
                              : String(coin.timeBetweenSellsSeconds),
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
                            h(
                              "select",
                              {
                                value: coinDraft.walletName,
                                onChange: (event) =>
                                  setCoinDrafts((current) => ({
                                    ...current,
                                    [coin.id]: {
                                      ...current[coin.id],
                                      walletName: event.target.value,
                                    },
                                  })),
                              },
                              h("option", { value: "" }, "Select wallet"),
                              WALLET_OPTIONS.map((walletName) =>
                                h(
                                  "option",
                                  { key: walletName, value: walletName },
                                  walletName
                                )
                              )
                            )
                          ),
                          h(
                            "td",
                            null,
                            h("input", {
                              value: coinDraft.amountToBuySol,
                              type: "number",
                              step: "any",
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
                            h("input", {
                              value: coinDraft.percentToSell,
                              type: "number",
                              step: "any",
                              min: "0",
                              max: "100",
                              onChange: (event) =>
                                setCoinDrafts((current) => ({
                                  ...current,
                                  [coin.id]: {
                                    ...current[coin.id],
                                    percentToSell: event.target.value,
                                  },
                                })),
                            })
                          ),
                          h(
                            "td",
                            null,
                            h("input", {
                              value: coinDraft.timeBetweenSellsSeconds,
                              type: "number",
                              step: "1",
                              min: "0",
                              onChange: (event) =>
                                setCoinDrafts((current) => ({
                                  ...current,
                                  [coin.id]: {
                                    ...current[coin.id],
                                    timeBetweenSellsSeconds: event.target.value,
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
                                          walletName: coinDraft.walletName,
                                          amountToBuySol: numberValueOrNull(
                                            coinDraft.amountToBuySol
                                          ),
                                          percentToSell: numberValueOrNull(
                                            coinDraft.percentToSell
                                          ),
                                          timeBetweenSellsSeconds:
                                            numberValueOrNull(
                                              coinDraft.timeBetweenSellsSeconds
                                          ),
                                        }),
                                      }
                                    ),
                                  {
                                    alertTitle: "Saved",
                                  }
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
                                  {
                                    alertTitle: "Deleted",
                                  }
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
