// double check the addresses

const twitterAccounts = [
  // --------- Elon Musk ---------
  // Adrian Dittmann
  // The Dogefather
  {
    username: "elonmusk",
    name: "Elon Musk",
    coins: [
      {
        name: "Edward Coristine",
        ticker: "BIGBALLS",
        address: "7mHCx9iXPJ7EJDbDAUGmej39Kme8cxZfeVi1EAvEpump",
        timeToSell: 120 * 1000,
        keywords: ["big balls", "big balls edward", "edward coristine"],
        amountToBuy: 5,
        slippage: 100,
        priorityFee: 0.1,
      },
      {
        name: "Kekius Maximus",
        ticker: "KM",
        address: "HuAncxDEsakCDgZS2Yfo9xJbHmtHXMnxxkT9jqdXnHhm",
        timeToSell: 120 * 1000,
        keywords: ["kekius", "kekius maximus"],
        amountToBuy: 10,
        slippage: 100,
        priorityFee: 0.1,
      },
      {
        name: "Peanut the Squirrel",
        ticker: "Pnut",
        address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
        timeToSell: 120 * 1000,
        keywords: ["pnut", "peanut"],
        amountToBuy: 5,
        slippage: 100,
        priorityFee: 0.1,
      },
      // --------- TEST COIN ---------
      {
        name: "test - Kekius Maximus",
        ticker: "test - KM",
        address: "HuAncxDEsakCDgZS2Yfo9xJbHmtHXMnxxkT9jqdXnHhm",
        timeToSell: 30 * 1000,
        keywords: [],
        amountToBuy: 0.01,
        slippage: 2,
        priorityFee: 0.01,
        automaticBuy: true,
      },
    ],
  },
  {
    username: "stoolpresidente",
    name: "Dave Portnoy",
    coins: [
      {
        name: "Greed 3",
        ticker: "GREED3",
        address: "64S7bmFVNZLfaiZVoHzZA5nDDUsssy6KbeVVdD66pump",
        timeToSell: 50 * 1000,
        keywords: ["greed3", "greed 3"],
        amountToBuy: 3,
        slippage: 20,
        priorityFee: 0.05,
      },
      {
        name: "Davey Day Trader Global",
        ticker: "DDTG",
        address: "DVtrerbvaB1JyAKA9crCN2xkxnYD5jBCLgsUrBZEpump",
        timeToSell: 120 * 1000,
        keywords: ["$ddtg"],
        amountToBuy: 3,
        slippage: 20,
        priorityFee: 0.05,
      },
      {
        name: "Stoole Presidente (jailstool)",
        ticker: "jailstool",
        address: "AxriehR6Xw3adzHopnvMn7GcpRFcD41ddpiTWMg6pump",
        timeToSell: 120 * 1000,
        keywords: ["jailstool"],
        amountToBuy: 3,
        slippage: 50,
        priorityFee: 0.05,
      },
    ],
  },
  {
    username: "SBF_FTX",
    name: "SBF",
    coins: [
      {
        ticker: "SBF",
        name: "Sam Bankman-Fried",
        address: "9Nuzd5BZMfeiP2TSXXGqYcrtqYEyFkGoEbm39CB3pump",
        timeToSell: 120 * 1000,
        keywords: [],
        amountToBuy: 3,
        slippage: 50,
        priorityFee: 0.1,
      },
    ],
  },
  // --------- Watcher Guru ---------
  // Gold Card
  // Big balls
  // HKU5
  // SWF

  {
    username: "WatcherGuru",
    name: "Watcher Guru",
    coins: [
      {
        ticker: "GREENLAND",
        name: "America 51st State",
        address: "5JEdwCUafTGLFZz8wDLmWNLbJKKwFafrHJ7A3W1Wpump",
        timeToSell: 120 * 1000,
        keywords: ["greenland"],
        amountToBuy: 3,
        slippage: 20,
        priorityFee: 0.05,
      },
    ],
  },
  // --------- Mario Nawfal (test account) ---------
  {
    username: "MarioNawfal",
    name: "Mario Nawfal",
    coins: [
      // --------- TEST COIN ---------
      {
        name: "test - Kekius Maximus",
        ticker: "test - KM",
        address: "HuAncxDEsakCDgZS2Yfo9xJbHmtHXMnxxkT9jqdXnHhm",
        timeToSell: 30 * 1000,
        keywords: [],
        amountToBuy: 0.01,
        slippage: 2,
        priorityFee: 0.01,
        automaticBuy: true,
      },
    ],
  },
];

module.exports = { twitterAccounts };
