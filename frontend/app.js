(function () {
  const h = React.createElement;
  const { useEffect, useMemo, useState } = React;

  const WALLET_OPTIONS = ["Berkley", "Sharif"];

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

  function SectionHeader(props) {
    return h(
      "div",
      { className: "panel-header actions-row" },
      h("div", null, props.title),
      props.children
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

    function applySnapshot(snapshot) {
      const nextAccounts = snapshot.accounts || [];
      const nextAccountCoins = snapshot.accountCoins || [];
      const nextCoins = snapshot.coins || [];

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

    async function withMutation(task) {
      try {
        setSaving(true);
        setStatus("");
        setError("");
        const snapshot = await task();
        applySnapshot(snapshot);
        setStatus("Saved successfully.");
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
      setAccountCoins([]);
      setCoins([]);
      setStatus("");
      setError("");
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
        h(
          "div",
          { className: "subtitle" },
          `Signed in as ${viewer}`
        ),
        databasePath
          ? h("div", { className: "subtitle" }, `Database: ${databasePath}`)
          : null,
        h("div", { className: "actions-row" },
          authEnabled
            ? h(
                "button",
                { className: "btn secondary", onClick: handleLogout },
                "Sign out"
              )
            : h("span", { className: "subtitle" }, "Local mode (auth disabled)"),
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
          h("input", {
            placeholder: "Username",
            value: newAccount.username,
            onChange: (event) =>
              setNewAccount((current) => ({
                ...current,
                username: event.target.value,
              })),
            required: true,
          }),
          h("input", {
            placeholder: "Display name",
            value: newAccount.name,
            onChange: (event) =>
              setNewAccount((current) => ({ ...current, name: event.target.value })),
          }),
          h(
            "select",
            {
              value: newAccount.defaultWalletName,
              onChange: (event) =>
                setNewAccount((current) => ({
                  ...current,
                  defaultWalletName: event.target.value,
                })),
            },
            WALLET_OPTIONS.map((wallet) =>
              h("option", { key: wallet, value: wallet }, wallet)
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
                    h(
                      "button",
                      {
                        className: "btn",
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
                      },
                      "Save"
                    ),
                    " ",
                    h(
                      "button",
                      {
                        className: "btn danger",
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
                      },
                      "Delete"
                    )
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
          h("input", {
            placeholder: "Symbol",
            value: newCoin.symbol,
            onChange: (event) =>
              setNewCoin((current) => ({ ...current, symbol: event.target.value })),
            required: true,
          }),
          h("input", {
            placeholder: "Name",
            value: newCoin.name,
            onChange: (event) =>
              setNewCoin((current) => ({ ...current, name: event.target.value })),
            required: true,
          }),
          h("input", {
            placeholder: "Address",
            value: newCoin.address,
            onChange: (event) =>
              setNewCoin((current) => ({ ...current, address: event.target.value })),
            required: true,
          }),
          h("input", {
            placeholder: "keywords, comma separated",
            value: newCoin.keywords,
            onChange: (event) =>
              setNewCoin((current) => ({
                ...current,
                keywords: event.target.value,
              })),
          }),
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
                h("th", null, "Actions")
              )
            ),
            h(
              "tbody",
              null,
              coins.map((coin) => {
                const draft = coinDrafts[coin.symbol] || {};
                return h(
                  "tr",
                  { key: coin.symbol },
                  h("td", null, coin.symbol),
                  h("td", null,
                    h("input", {
                      value: draft.name || "",
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
                    h(
                      "button",
                      {
                        className: "btn",
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
                      },
                      "Save"
                    ),
                    " ",
                    h(
                      "button",
                      {
                        className: "btn danger",
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
                      },
                      "Delete"
                    )
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
            "select",
            {
              value: newRule.accountUsername,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  accountUsername: event.target.value,
                })),
              required: true,
            },
            h("option", { value: "" }, "Select account"),
            accountUsernames.map((username) =>
              h("option", { key: username, value: username }, username)
            )
          ),
          h("input", {
            placeholder: "Coin name",
            value: newRule.coinName,
            onChange: (event) =>
              setNewRule((current) => ({ ...current, coinName: event.target.value })),
            required: true,
          }),
          h("input", {
            placeholder: "Coin address",
            value: newRule.coinAddress,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                coinAddress: event.target.value,
              })),
            required: true,
          }),
          h("input", {
            placeholder: "keywords, comma separated",
            value: newRule.coinKeywords,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                coinKeywords: event.target.value,
              })),
          }),
          h(
            "select",
            {
              value: newRule.walletName,
              onChange: (event) =>
                setNewRule((current) => ({
                  ...current,
                  walletName: event.target.value,
                })),
            },
            WALLET_OPTIONS.map((wallet) =>
              h("option", { key: wallet, value: wallet }, wallet)
            )
          ),
          h("input", {
            placeholder: "amountToBuy",
            value: newRule.amountToBuy,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                amountToBuy: event.target.value,
              })),
          }),
          h("input", {
            placeholder: "slippageBps",
            value: newRule.slippageBps,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                slippageBps: event.target.value,
              })),
          }),
          h("input", {
            placeholder: "priorityFee",
            value: newRule.priorityFee,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                priorityFee: event.target.value,
              })),
          }),
          h("input", {
            placeholder: "percentToSell",
            value: newRule.percentToSell,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                percentToSell: event.target.value,
              })),
          }),
          h("input", {
            placeholder: "timeBetweenSells",
            value: newRule.timeBetweenSells,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                timeBetweenSells: event.target.value,
              })),
          }),
          h("input", {
            placeholder: "sortOrder",
            value: newRule.sortOrder,
            onChange: (event) =>
              setNewRule((current) => ({
                ...current,
                sortOrder: event.target.value,
              })),
          }),
          h("label", { className: "checkbox-label" },
            h("input", {
              type: "checkbox",
              checked: !!newRule.dontSell,
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
                    h(
                      "button",
                      {
                        className: "btn",
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
                      },
                      "Save"
                    ),
                    " ",
                    h(
                      "button",
                      {
                        className: "btn danger",
                        disabled: saving,
                        onClick: () =>
                          withMutation(() =>
                            apiRequest(`/api/trading-config/account-coins/${rule.id}`, {
                              method: "DELETE",
                              body: "{}",
                            })
                          ),
                      },
                      "Delete"
                    )
                  )
                );
              })
            )
          )
        )
      )
    );
  }

  const rootElement = document.getElementById("root");
  const root = ReactDOM.createRoot(rootElement);
  root.render(h(App));
})();
