// double check the addresses

// Compile lookup maps at module level for better performance
const coins = {
  TRUMP: {
    name: "OFFICIAL TRUMP",
    address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    keywords: ["$trump"],
  },
  EWON: {
    name: "Ewon Wusk",
    address: "2N8qruAsuSre8vEopvgEgBHigfnqBTFbmf9XTDw9pump",
    keywords: ["ewon"],
  },
  DOODOOCOIN: {
    name: "Grok's Shitcoin",
    address: "2N8qruAsuSre8vEopvgEgBHigfnqBTFbmf9XTDw9pump",
    keywords: ["$doodoocoin", "doodoo", "$doodoo", "doodoocoin"],
  },
  GROKCOIN: {
    name: "Grok Coin",
    address: "3MadWqcN9cSrULn8ikDnan9mF3znoQmBPXtVy6BfSTDB",
    keywords: ["$grokcoin", "grokcoin", "grok coin"],
  },
  CHESTNUT: {
    name: "Chestnut",
    address: "7oE4Ji977tfofxk9k1UosJ5mTz7rjPRNiSCyWFbPpump",
    keywords: ["chestnut"],
  },
  GROK4: {
    name: "Grok 4",
    address: "GpDzQVu8gTLfnTEJdsbWiLBJo8SduQtkGpJfmEJnpump",
    keywords: ["grok 4", "grok4"],
  },
  _8008: {
    name: "8008",
    address: "5puhwnyz2Tv8jSmmBD5DSqCwFVXwwPGZacymM7DQpump",
    keywords: ["8008"],
  },
  DJDANIEL: {
    name: "DJ Daniel",
    address: "6erH7v4KuJtEumAj5g2kcTn7d9QEy5hSuiKocKfoS4RL",
    keywords: ["dj daniel"],
  },
  PWEASE: {
    name: "pwease",
    address: "CniPCE4b3s8gSUPhUiyMjXnytrEqUrMfSsnbBjLCpump",
    keywords: ["pwease"],
  },
  SBR: {
    name: "Strategic Bitcoin Reserve",
    address: "2HHgCLfKA5Rd1Fn9xAxfYzS3XoR5NnuxKDYz2EmWpump",
    keywords: ["strategic bitcoin reserve"],
  },
  STRATEGICSOLANARESERVE: {
    name: "Strategic Solana Reserve",
    address: "6heygeGJ7z1NNBSDZzdDU6315Bgkt5kzrPmDTsmrpump",
    keywords: ["strategic solana reserve"],
  },
  TRUMPGAZA: {
    name: "Trump Gaza",
    address: "5eNm9kFBe3qsPGWXdn9SYovCMnA7Q1bWZkfacQqtpump",
    keywords: ["trump gaza"],
  },
  FREESHLOMO: {
    name: "FREESHLOMO",
    address: "9L1SWjsBFaCeUP9sh9s7wty7n69vTrTPCJx41DcPpump",
    keywords: ["shlomo"],
  },
  BIGBALLS: {
    name: "Edward Coristine",
    address: "7mHCx9iXPJ7EJDbDAUGmej39Kme8cxZfeVi1EAvEpump",
    keywords: ["big balls", "edward coristine", "coristine", "bolz"],
  },
  KM: {
    name: "Kekius Maximus",
    address: "HuAncxDEsakCDgZS2Yfo9xJbHmtHXMnxxkT9jqdXnHhm",
    keywords: ["kekius", "kekius maximus"],
  },
  PNUT: {
    name: "Peanut the Squirrel",
    address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
    keywords: ["pnut"],
  },
  PNUT2: {
    name: "Peanut the Squirrel",
    address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
    keywords: ["peanut"],
  },
  ADRIAN: {
    name: "Adrian Dittmann",
    address: "6Em4veHJFxfnEvu2cyQhkn2BszvHxycPba8fL3Psx4gY",
    keywords: ["adrian dittmann"],
  },
  DOGEFATHER: {
    name: "Dogefather",
    address: "EcYK2XNG4wWr2vDg2M2Hrts6SrU2QB4NzXLBf888pump",
    keywords: ["dogefather"],
  },
  NOLAND: {
    name: "The World's First AI Human",
    address: "D3fQZ6fmHseTCsNntBMnu3Tk3EV3uN68VLDQZWgVpump",
    keywords: ["arbaugh", "neuralink patient"],
  },
  LUIGI: {
    name: "Luigi Mangione",
    address: "5XyKkFaJpAmsH4Tf2EFj3S61W3hC5cJhxNZQQ5h1pump",
    keywords: ["luigi", "mangione"],
  },
  ASSANGE: {
    name: "Julian Assange",
    address: "4FrXUwfQ7zp56N87ac8BX2aqmFoKmvo6Jp7SuTMZpump",
    keywords: ["assange"],
  },
  HARAMBE: {
    name: "HARAMBE",
    address: "Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP",
    keywords: ["harambe"],
  },
  OBIPNUTKENOBIN: {
    name: "Obi Pnut Kenobi",
    address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
    keywords: ["Obi PNut Kenobi", "pnut kenobi", "obi pnut"],
  },
  TRUTHGPT: {
    name: "Elon OPENAI NAME",
    address: "DkVoFwo7aQTUeEMSegZgvUoigHti329Fm9wiMvfdpump",
    keywords: ["truthgpt", "truth gpt"],
  },

  DDTG: {
    name: "Davey Day Trader Global",
    address: "DVtrerbvaB1JyAKA9crCN2xkxnYD5jBCLgsUrBZEpump",
    keywords: ["$ddtg"],
  },
  JAILSTOOL: {
    name: "Stoole Presidente (jailstool)",
    address: "AxriehR6Xw3adzHopnvMn7GcpRFcD41ddpiTWMg6pump",
    keywords: ["jailstool"],
  },
  SBF: {
    name: "Sam Bankman-Fried",
    address: "9Nuzd5BZMfeiP2TSXXGqYcrtqYEyFkGoEbm39CB3pump",
    keywords: [],
  },
  GREENLAND: {
    name: "America 51st State",
    address: "5JEdwCUafTGLFZz8wDLmWNLbJKKwFafrHJ7A3W1Wpump",
    keywords: ["greenland"],
  },
  HKU5: {
    name: "New China coronavirus",
    address: "HRqNoAHzcvxRwMf64gz9C6DHKW1icgjebjvK23ikpump",
    keywords: ["hku5"],
  },
  SWF: {
    name: "Sovereign Wealth Fund",
    address: "FtBXDMyD4SvAa6keQPAGk4sgRVuUECsxGU1X2dLWpump",
    keywords: ["sovereign wealth fund"],
  },
  TGC: {
    name: "TRUMP GOLD CARDS",
    address: "3LuA7cib588PogacQvxpjWJoon9KoXEGHL4WMroCmnrg",
    keywords: ["trump gold card", "gold card"],
  },
  POPE: {
    name: "Pietro Parolin",
    address: "7rnYT9QqS9RKYFJnDT14T14LxmG1c3xZo61pSVJRpump",
    keywords: ["pietro", "parolin"],
  },
  KNOX: {
    name: "Official Fort Knox Coin",
    address: "4N8g7mw171aVC1oMMRV1pMrQuB1RwFHaJan2WYyBpump",
    keywords: ["knox"],
  },
  BROC: {
    name: "Broccoli",
    address: "D13VkjDiCxtgRJsH4s1VCxKS4bFZq5UEz2iRsSbapump",
    keywords: ["broccoli"],
  },
  ZACK: {
    name: "Zacktardio",
    address: "2mN3yfFwanRmgLVpLWcCskUuyhTr8zKoBw6nwiivpump",
    keywords: ["zacktardio"],
  },
  TRUMPBILL: {
    name: "Trump 250 Bill",
    address: "7nEx3cF6bgD2LDh3MimokRPbAV97TFsGKQyjRKN7pump",
    keywords: ["250 bill", "250 dollar bill"],
  },
  LEAF: {
    name: "Leaf Erikson",
    address: "7vqkjrxbtVazEwREnHB2nv2poYmzr9Yr4KdWp64Bpump",
    keywords: ["leaf", "erikson", "leaf erikson"],
  },
  ROGER: {
    name: "Free Roger",
    address: "4NS4nxNunN7KJ1oe2PRCnh1KbBBut2fTqYHqU7Gtpump",
    keywords: ["free roger", "roger ver"],
  },

  SWASTI: {
    name: "Swasticoin",
    address: "D91JAEfzeFZspHc6PrY8n1p234oEKXzhM3EM73Vppump",
    keywords: ["swasticoin"],
  },
  SWASTA: {
    name: "Swastachain",
    address: "DVzbUXeAQGyDLsn9FkGxm6q2q9hs7tUK4cimmmQpump",
    keywords: ["swastachain"],
  },
  MELANIA: {
    name: "Melania Trump",
    address: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P",
    keywords: ["$melania"],
  },
  BABYDEER: {
    name: "Baby Deer",
    address: "6pKHwNCpzgZuC9o5FzvCZkYSUGfQddhUYtMyDbEVpump",
    keywords: ["baby deer", "deer"],
  },
  BABYDEERTRUMP: {
    name: "Baby Deer",
    address: "6pKHwNCpzgZuC9o5FzvCZkYSUGfQddhUYtMyDbEVpump",
    keywords: ["baby deer"],
  },

  $100BILL: {
    name: "$100",
    address: "7Eg4Bin1U4SNggFJFrKuGTo6e7ShuzjYyW9Quxtxpump",
    keywords: ["golden age act", "100 bill", "100 dollar bill"],
  },
  CSR: {
    name: "Crypto Strategic Reserve",
    address: "EqQFU4AoRVKJjQrpshmp89YxHAgNecCpJdMS8PJLpump",
    keywords: ["crypto strategic reserve"],
  },
  TRUMPSEASON: {
    name: "Trump Season",
    address: "8qiVWSZ1HYsnA7Z79j3jwhbDJTxqjosZVWAsajSkpump",
    keywords: ["trump season", "trump szn"],
  },
};
const testCoins = {
  TESTCOIN: {
    name: "Test",
    address: "7mHCx9iXPJ7EJDbDAUGmej39Kme8cxZfeVi1EAvEpump",
    keywords: [
      "is",
      "the",
      "in",
      "he",
      "she",
      "it",
      "they",
      "we",
      "you",
      "this",
      "that",
      "there",
      "here",
      "there",
      "when",
      "where",
      "how",
      "why",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "these",
      "those",
    ],
  },
  TESTTRUMP: {
    name: "TestTrump",
    address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    keywords: [
      "is",
      "the",
      "in",
      "he",
      "she",
      "it",
      "they",
      "we",
      "you",
      "this",
      "that",
      "there",
      "here",
      "there",
      "when",
      "where",
      "how",
      "why",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "these",
      "those",
    ],
  },
};
const trumpAccountMap = new Map([
  [
    "trump",
    {
      name: "Donald Trump",
      coins: [
        { ...coins.TRUMP, amountToBuy: 20 },
        { ...coins.GREENLAND, amountToBuy: 10 },
        { ...coins.HKU5, amountToBuy: 3 },
        { ...coins.SWF, amountToBuy: 5 },
        { ...coins.TGC, amountToBuy: 10 },
        { ...coins.KNOX, amountToBuy: 10 },
        { ...coins.$100BILL, amountToBuy: 10 },
        { ...coins.CSR, amountToBuy: 15 },
        { ...coins.TRUMPSEASON, amountToBuy: 10 },
        { ...coins.TRUMPBILL, amountToBuy: 4 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 10 },
        { ...coins.MELANIA, amountToBuy: 20 },
        { ...coins.TRUMPGAZA, amountToBuy: 2 },
        { ...coins.BABYDEERTRUMP, amountToBuy: 20 },
        { ...coins.PNUT, amountToBuy: 20 },
        { ...coins.BIGBALLS, amountToBuy: 20 },
        { ...coins.KM, amountToBuy: 15 },
        { ...coins.DOGEFATHER, amountToBuy: 15 },
        { ...coins.LUIGI, amountToBuy: 20 },
        { ...coins.ASSANGE, amountToBuy: 5 },
        { ...coins.HARAMBE, amountToBuy: 20 },
        { ...coins.OBIPNUTKENOBIN, amountToBuy: 20 },
        { ...coins.TRUMPGAZA, amountToBuy: 3 },
        { ...coins.ADRIAN, amountToBuy: 20 },
        { ...coins.JAILSTOOL, amountToBuy: 20 },
        { ...coins.ROGER, amountToBuy: 20 },
        { ...coins.PWEASE, amountToBuy: 20 },
        { ...coins.GROK4, amountToBuy: 10 },
        { ...coins.DOODOOCOIN, amountToBuy: 10 },
        { ...coins.GROKCOIN, amountToBuy: 20 },
      ],
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 5000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
    },
  ],
]);
// Create efficient lookup maps
const accountMap = new Map([
  // Active accounts
  [
    "elonmusk",
    {
      name: "Elon Musk",
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 5000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
      coins: [
        { ...coins.BIGBALLS, amountToBuy: 15 },
        { ...coins.KM, amountToBuy: 15 },
        { ...coins.PNUT, amountToBuy: 20 },
        { ...coins.DOGEFATHER, amountToBuy: 15 },
        { ...coins.NOLAND, amountToBuy: 10 },
        { ...coins.HARAMBE, amountToBuy: 20 },
        { ...coins.TRUTHGPT, amountToBuy: 2 },
        { ...coins.BABYDEER, amountToBuy: 20 },
        { ...coins.$100BILL, amountToBuy: 3 },
        { ...coins.CSR, amountToBuy: 15 },
        { ...coins.TRUMPSEASON, amountToBuy: 5 },
        { ...coins.TRUMPBILL, amountToBuy: 4 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 10 },
        { ...coins.KNOX, amountToBuy: 10 },
        { ...coins.OBIPNUTKENOBIN, amountToBuy: 20 },
        { ...coins.TGC, amountToBuy: 10 },
        { ...coins.JAILSTOOL, amountToBuy: 15 },
        { ...coins.ROGER, amountToBuy: 15 },
        { ...coins.PWEASE, amountToBuy: 20 },
        { ...coins._8008, amountToBuy: 20 },
        { ...coins.GROK4, amountToBuy: 10 },
        { ...coins.DOODOOCOIN, amountToBuy: 10 },
        { ...coins.GROKCOIN, amountToBuy: 20 },
        { ...coins.EWON, amountToBuy: 20 },
      ],
    },
  ],
  [
    "JDVance",
    {
      name: "JD Vance",
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 5000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
      coins: [
        { ...coins.PWEASE, amountToBuy: 20, dontSell: true },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 10 },
      ],
    },
  ],
  [
    "stoolpresidente",
    {
      name: "Dave Portnoy",
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 7000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
      coins: [
        { ...coins.DDTG, amountToBuy: 5 },
        { ...coins.CHESTNUT, amountToBuy: 5 },
        // { ...coins.JAILSTOOL, amountToBuy: 1 },
      ],
    },
  ],

  [
    "WatcherGuru",
    {
      name: "Watcher Guru",
      coins: [
        { ...coins.GREENLAND, amountToBuy: 4 },
        { ...coins.HKU5, amountToBuy: 3 },
        { ...coins.SWF, amountToBuy: 3 },
        { ...coins.BIGBALLS, amountToBuy: 3 },
        { ...coins.KNOX, amountToBuy: 3 },
        { ...coins.$100BILL, amountToBuy: 3 },
        { ...coins.CSR, amountToBuy: 5 },
        { ...coins.TRUMPSEASON, amountToBuy: 5 },
        { ...coins.TRUMPBILL, amountToBuy: 4 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 10 },
        { ...coins.DOODOOCOIN, amountToBuy: 10 },
        { ...coins.GROKCOIN, amountToBuy: 10 },
      ],
    },
  ],
  [
    "DeItaone",
    {
      name: "Walter Bloomberg",
      coins: [],
    },
  ],

  [
    "RealRossU",
    {
      name: "Ross Ulbricht",
      coins: [
        // need to add a 15 second sell here
        { ...coins.ROGER, amountToBuy: 20 },
      ],
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 5000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
    },
  ],
  [
    "kanyewest",
    {
      name: "Kanye West",
      coins: [,],
    },
  ],
  [
    "DavidSacks",
    {
      name: "David Sacks",
      coins: [],
    },
  ],
  [
    "davidsacks47",
    {
      name: "David Sacks",
      coins: [],
    },
  ],
]);

const testAccountMap = new Map([
  [
    "elonmusk",
    {
      name: "Elon Musk",
      username: "elonmusk",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],
  [
    "binance",
    {
      name: "binance",
      username: "binance",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],

  [
    "MarioNawfal",
    {
      name: "Mario Nawfal",
      username: "MarioNawfal",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],
  [
    "nypost",
    {
      name: "New York Post (test)",
      username: "nypost",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],
  [
    "ABC",
    {
      name: "ABC",
      username: "ABC",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],
  [
    "teslaownersSV",
    {
      name: "teslaownersSV",
      username: "teslaownersSV",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],
  [
    "trump",
    {
      name: "Donald Trump",
      username: "trump",
      coins: [{ ...testCoins.TESTCOIN, amountToBuy: 0.001 }],
    },
  ],
]);

// Create keyword lookup map for faster matching
const keywordMap = new Map();
for (const [username, account] of accountMap) {
  if (account.coins) {
    for (const coin of account.coins) {
      if (coin) {
        if (coin.keywords) {
          for (const keyword of coin.keywords) {
            if (!keywordMap.has(keyword)) {
              keywordMap.set(keyword, []);
            }
            keywordMap.get(keyword).push({ username, coin });
          }
        }
      }
    }
  }
}

const testKeywordMap = new Map();
for (const [username, account] of testAccountMap) {
  if (account.coins) {
    for (const coin of account.coins) {
      if (coin) {
        if (coin.keywords) {
          for (const keyword of coin.keywords) {
            if (!testKeywordMap.has(keyword)) {
              testKeywordMap.set(keyword, []);
            }
            testKeywordMap.get(keyword).push({ username, coin });
          }
        }
      }
    }
  }
}

const trumpKeywordMap = new Map();
for (const [username, account] of trumpAccountMap) {
  for (const coin of account.coins) {
    if (coin) {
      if (coin.keywords) {
        for (const keyword of coin.keywords) {
          if (!trumpKeywordMap.has(keyword)) {
            trumpKeywordMap.set(keyword, []);
          }
          trumpKeywordMap.get(keyword).push({ username, coin });
        }
      }
    }
  }
}

export {
  coins,
  accountMap,
  keywordMap,
  trumpAccountMap,
  trumpKeywordMap,
  testKeywordMap,
  testAccountMap,
  testCoins,
};
