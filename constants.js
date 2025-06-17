// double check the addresses

// Compile lookup maps at module level for better performance
const coins = {
  TRUMPSTESTCOIN: {
    name: "TRUMPSTESTCOIN",
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    keywords: [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "if",
      "then",
      "else",
      "while",
      "for",
      "in",
      "of",
      "at",
      "by",
      "up",
      "down",
      "left",
      "right",
      "this",
      "that",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "all",
      "any",
      "some",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "!",
      "?",
      ".",
      ",",
      ":",
      ";",
      "-",
    ],
  },
  MENVSGORILLA: {
    name: "100 Men Vs Gorilla",
    address: "qRUZaCpgxaRH1s5V6opjPA6Hnpv5BM37LqkDBw7pump",
    keywords: ["gorilla"],
  },
  JEDIOFUSA: {
    name: "JOTUS",
    address: "5spzxsgCMetaWbZNnUCcxSGmnmCHHjL3WaCdtNNhBR7K",
    keywords: ["sith lord", "jedi", "star wars"],
  },
  DOGEQUEST: {
    name: "DOGEQUEST",
    address: "GmcNY55weZBRgs7YC3KWijTKnPdv8XDy6DLuLLvdNHtU",
    keywords: ["dogequest"],
  },
  TOLITHETRENCHER: {
    name: "Toli",
    address: "5C8LMqZ9dbQ3RWoe5pFk5fJPhgiBQtBYdMnzekfJpump",
    keywords: ["toli", "the trencher"],
  },
  SHORTNOY: {
    name: "Shortnoy",
    address: "4cPhM4VA8HdKVzLufEAwhwYDpg2FqWPzrZXXcSbZpump",
    keywords: ["shortnoy"],
  },

  GORK: {
    name: "Gork",
    address: "38PgzpJYu2HkiYvV8qePFakB8tuobPdGm2FFEn7Dpump",
    keywords: ["gork"],
  },

  RETARDFINDER: {
    name: "Retard Finder",
    address: "C3DwDjT17gDvvCYC2nsdGHxDHVmQRdhKfpAdqQ29pump",
    keywords: ["retard finder"],
  },
  HOSICO: {
    name: "Hosico",
    address: "9wK8yN6iz1ie5kEJkvZCTxyN1x5sTdNfx8yeMY8Ebonk",
    keywords: ["hosico"],
  },

  DOGWIFHAT: {
    name: "DogWifHat",
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    keywords: ["dogwifhat", "dog wif hat"],
  },
  POPCAT: {
    name: "Popcat",
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    keywords: ["popcat"],
  },
  LEMONDOG: {
    name: "Lemon DOG STOLEN FROM TESLA",
    address: "CjqxraDuTMEcfhdqY8qEaMY43icdBrkt3EXciNVpump",
    keywords: ["lemon"],
  },
  FLOKI: {
    name: "Floki",
    address: "CP7xS4pHRuZS5M5FvnpRQXNfFwCpoPyHRNnupfkDHhah",
    keywords: ["floki"],
  },
  AI16Z: {
    name: "ai16z",
    address: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
    keywords: ["ai16z"],
  },
  GIGACHAD: {
    name: "GIGA",
    address: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9",
    keywords: ["giga chad", "$giga"],
  },
  ///////
  TITCOIN: {
    name: "TITCOIN",
    address: "FtUEW73K6vEYHfbkfpdBZfWpxgQar2HipGdbutEhpump",
    keywords: ["titcoin", "tit coin"],
  },
  BUTTCOIN: {
    name: "Butt Coin",
    address: "FasH397CeZLNYWkd3wWK9vrmjd1z93n3b59DssRXpump",
    keywords: ["buttcoin", "butt coin"],
  },
  DICKBUTT: {
    name: "Dick Butt",
    address: "43SXvpf4c41t2uErsw7aL6w5qhnie6BXSSPqiTcTpump",
    keywords: ["dick butt", "dickbutt"],
  },
  SARATOGA: {
    name: "SARATOGA",
    address: "3wth71poCxAckMcXKR6QLY7xKFoiSLwLgUShHRzXpump",
    keywords: ["saratoga"],
  },
  MORNINGROUTINE: {
    name: "MORNING ROUTINE",
    address: "34HDZNbUkTyTrgYKy2ox43yp2f8PJ5hoM7xsrfNApump",
    keywords: ["morning routine"],
  },
  TRUMP: {
    name: "OFFICIAL TRUMP",
    address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    keywords: ["$trump"],
  },
  EWON: {
    name: "Ewon Wusk",
    address: "EF3Ln1DkUB5azvqcaCJgG3RR2qSUJEXxLo1q4ZHzpump",
    keywords: ["ewon"],
  },
  GREED3: {
    name: "Greed3",
    address: "CPBQqugWWCcyehezHf4uSJtET2kmYNqPuhyb57H5pump",
    keywords: ["greed3", "greed 3"],
  },
  GREED2: {
    name: "Greed2",
    address: "GoL6RVGQFzTD7MdoNEHUQmNp6SgXBn6f9khxAW5Bpump",
    keywords: ["greed2", "greed 2"],
  },
  FARTSTOOL: {
    name: "fartstool",
    address: "4hr97GiyvAc2Ak57gETQVb1kfaoMeYwngMZZ9qe1pump",
    keywords: ["fartstool"],
  },
  MISSPEACHES: {
    name: "Miss Peaches",
    address: "7qhwYUXBaPTfWkhUpgWTjHAvdG48wRj5TLmTQ5Topump",
    keywords: ["peaches"],
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
  HOUSECOIN: {
    name: "House Coin",
    address: "DitHyRMQiSDhn5cnKMJV2CDDt6sVct96YrECiM49pump",
    keywords: ["house coin", "housecoin"],
  },
  SBR: {
    name: "Strategic Bitcoin Reserve",
    address: "2HHgCLfKA5Rd1Fn9xAxfYzS3XoR5NnuxKDYz2EmWpump",
    keywords: ["strategic bitcoin reserve"],
  },
  STRATEGICSOLANARESERVE: {
    name: "Strategic Solana Reserve",
    address: "6heygeGJ7z1NNBSDZzdDU6315Bgkt5kzrPmDTsmrpump",
    keywords: [
      "strategic solana reserve",
      "solana strategic reserve",
      "solana reserve",
    ],
  },
  FARTCOIN: {
    name: "FartCoin",
    address: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
    keywords: ["fart coin", "fartcoin"],
  },
  TRUMPGAZA: {
    name: "Trump Gaza",
    address: "5eNm9kFBe3qsPGWXdn9SYovCMnA7Q1bWZkfacQqtpump",
    keywords: ["trump gaza"],
  },
  BIGBALLS: {
    name: "Edward Coristine",
    address: "7mHCx9iXPJ7EJDbDAUGmej39Kme8cxZfeVi1EAvEpump",
    keywords: ["big balls", "edward coristine"],
  },
  KM: {
    name: "Kekius Maximus",
    address: "FThrNpdic79XRV6i9aCWQ2UTp7oRQuCXAgUWtZR2cs42",
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
    keywords: ["arbaugh"],
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
  TRUMP2028: {
    name: "Trump 2028",
    address: "5wQFpZ2Xstd6khM8WwtVdhegiNEjM48DYErMVVknpump",
    keywords: ["trump 2028"],
  },
  HARAMBE: {
    name: "HARAMBE",
    address: "Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP",
    keywords: ["harambe"],
  },
  OBIPNUTKENOBIN: {
    name: "Obi Pnut Kenobi",
    address: "5WGkdemJNEoAVKveDQdzQmDqTyxCraXGw9ACyrwCEUMS",
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
  UNCONDITIONALSURRENDER: {
    name: "Unconditional Surrender",
    address: "FRRMj87PWN5xuXGyNBXTMh56ksWNiJTUq3KZumyS87zV",
    keywords: ["unconditional surrender"],
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
// Create efficient lookup maps
const accountMap = new Map([
  // Active accounts
  [
    "realDonaldTrump",
    {
      name: "Donald Trump",
      coins: [
        // { ...coins.TRUMPSTESTCOIN, amountToBuy: 0.001 },
        { ...coins.GREENLAND, amountToBuy: 10 },
        { ...coins.HKU5, amountToBuy: 3 },
        { ...coins.SWF, amountToBuy: 15 },
        { ...coins.TGC, amountToBuy: 5 },
        { ...coins.$100BILL, amountToBuy: 2 },
        { ...coins.CSR, amountToBuy: 20 },
        { ...coins.TRUMPSEASON, amountToBuy: 2 },
        { ...coins.TRUMPBILL, amountToBuy: 5 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 20 },
        { ...coins.MELANIA, amountToBuy: 30 },
        { ...coins.UNCONDITIONALSURRENDER, amountToBuy: 3 },
        { ...coins.TRUMPGAZA, amountToBuy: 3 },
        { ...coins.PNUT, amountToBuy: 30 },
        { ...coins.BIGBALLS, amountToBuy: 40 },
        { ...coins.FARTCOIN, amountToBuy: 40 },
        { ...coins.KM, amountToBuy: 20 },
        { ...coins.DOGEFATHER, amountToBuy: 50 },
        { ...coins.LUIGI, amountToBuy: 20 },
        { ...coins.HARAMBE, amountToBuy: 70 },
        { ...coins.JAILSTOOL, amountToBuy: 30 },
        { ...coins.ROGER, amountToBuy: 20 },
        { ...coins.PWEASE, amountToBuy: 50 },
        { ...coins.GROK4, amountToBuy: 40 },
        { ...coins.DOODOOCOIN, amountToBuy: 15 },
        { ...coins.GROKCOIN, amountToBuy: 50 },
        { ...coins.DICKBUTT, amountToBuy: 30 },
        { ...coins.TITCOIN, amountToBuy: 50 },
        { ...coins.BUTTCOIN, amountToBuy: 30 },
        { ...coins.SBR, amountToBuy: 30 },
        { ...coins.TRUMP2028, amountToBuy: 20 },
        { ...coins.EWON, amountToBuy: 10 },
        { ...coins.TRUTHGPT, amountToBuy: 5 },
        { ...coins.OBIPNUTKENOBIN, amountToBuy: 70 },
        { ...coins.KNOX, amountToBuy: 15 },
        { ...coins.TGC, amountToBuy: 5 },
        { ...coins._8008, amountToBuy: 10 },
        { ...coins.MORNINGROUTINE, amountToBuy: 20 },
        { ...coins.DOGWIFHAT, amountToBuy: 70 },
        { ...coins.FLOKI, amountToBuy: 20 },
        { ...coins.AI16Z, amountToBuy: 70 },
        { ...coins.GIGACHAD, amountToBuy: 50 },
        { ...coins.POPCAT, amountToBuy: 70 },
        { ...coins.RETARDFINDER, amountToBuy: 30 },
        { ...coins.HOSICO, amountToBuy: 70 },
        { ...coins.JEDIOFUSA, amountToBuy: 2 },
        { ...coins.MENVSGORILLA, amountToBuy: 30 },
      ],
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 5000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
    },
  ],
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
        { ...coins.TRUMPGAZA, amountToBuy: 3 },
        { ...coins.FARTCOIN, amountToBuy: 30 },
        { ...coins.RETARDFINDER, amountToBuy: 30 },
        { ...coins.KM, amountToBuy: 20 },
        { ...coins.PNUT, amountToBuy: 30 },
        { ...coins.NOLAND, amountToBuy: 20 },
        { ...coins.HARAMBE, amountToBuy: 70 },
        { ...coins.TRUTHGPT, amountToBuy: 10 },
        { ...coins.TRUMP2028, amountToBuy: 20 },
        { ...coins.SWF, amountToBuy: 15 },
        { ...coins.DOGEFATHER, amountToBuy: 50 },
        { ...coins.SBR, amountToBuy: 30 },
        { ...coins.CSR, amountToBuy: 20 },
        { ...coins.TRUMPSEASON, amountToBuy: 2 },
        { ...coins.HOSICO, amountToBuy: 70 },
        { ...coins.TRUMPBILL, amountToBuy: 5 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 20 },
        { ...coins.KNOX, amountToBuy: 10 },
        { ...coins.DICKBUTT, amountToBuy: 30 },
        { ...coins.TITCOIN, amountToBuy: 70 },
        { ...coins.BUTTCOIN, amountToBuy: 50 },
        { ...coins.OBIPNUTKENOBIN, amountToBuy: 70 },
        { ...coins.TGC, amountToBuy: 5 },
        { ...coins.JAILSTOOL, amountToBuy: 30 },
        { ...coins.ROGER, amountToBuy: 20 },
        { ...coins.PWEASE, amountToBuy: 50 },
        { ...coins._8008, amountToBuy: 10 },
        { ...coins.GROK4, amountToBuy: 40 },
        { ...coins.DOODOOCOIN, amountToBuy: 15 },
        { ...coins.GROKCOIN, amountToBuy: 50 },
        { ...coins.EWON, amountToBuy: 10 },
        { ...coins.MORNINGROUTINE, amountToBuy: 20 },
        { ...coins.HKU5, amountToBuy: 3 },
        { ...coins.DOGWIFHAT, amountToBuy: 70 },
        { ...coins.FLOKI, amountToBuy: 30 },
        { ...coins.AI16Z, amountToBuy: 70 },
        { ...coins.GIGACHAD, amountToBuy: 50 },
        { ...coins.POPCAT, amountToBuy: 70 },
        { ...coins.MENVSGORILLA, amountToBuy: 30 },
      ],
    },
  ],
  [
    "pumpdotfun",
    {
      name: "Pump Dot Fun",
      buyAnyPostedCA: true,
      amountToBuyForAnyPostedCA: 8,
      slippageBpsForAnyPostedCA: 5000,
      timeToSellForAnyPostedCA: 120 * 1000,
      priorityFeeForAnyPostedCA: 0.1,
      coins: [
        { ...coins.BIGBALLS, amountToBuy: 20 },
        { ...coins.RETARDFINDER, amountToBuy: 30 },
        { ...coins.KM, amountToBuy: 20 },
        { ...coins.HARAMBE, amountToBuy: 20 },
        { ...coins.TRUTHGPT, amountToBuy: 10 },
        { ...coins.TRUMP2028, amountToBuy: 30 },
        { ...coins.SWF, amountToBuy: 20 },
        { ...coins.DOGEFATHER, amountToBuy: 30 },
        { ...coins.SBR, amountToBuy: 20 },
        { ...coins.CSR, amountToBuy: 20 },
        { ...coins.TRUMPSEASON, amountToBuy: 2 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 20 },
        { ...coins.DICKBUTT, amountToBuy: 20 },
        { ...coins.TITCOIN, amountToBuy: 20 },
        { ...coins.BUTTCOIN, amountToBuy: 20 },
        { ...coins.OBIPNUTKENOBIN, amountToBuy: 20 },
        { ...coins.TGC, amountToBuy: 5 },
        { ...coins.JAILSTOOL, amountToBuy: 20 },
        { ...coins.ROGER, amountToBuy: 20 },
        { ...coins.PWEASE, amountToBuy: 50 },
        { ...coins._8008, amountToBuy: 10 },
        { ...coins.DOODOOCOIN, amountToBuy: 15 },
        { ...coins.GROKCOIN, amountToBuy: 20 },
        { ...coins.EWON, amountToBuy: 10 },
        { ...coins.MORNINGROUTINE, amountToBuy: 20 },
        { ...coins.HKU5, amountToBuy: 3 },
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
        { ...coins.PWEASE, amountToBuy: 50, dontSell: true },
        { ...coins.TITCOIN, amountToBuy: 20 },
        { ...coins.BUTTCOIN, amountToBuy: 20 },
        { ...coins.DICKBUTT, amountToBuy: 20 },
        { ...coins.FARTCOIN, amountToBuy: 50 },
        { ...coins.HARAMBE, amountToBuy: 70 },
        { ...coins.DOGWIFHAT, amountToBuy: 50 },
        { ...coins.FLOKI, amountToBuy: 20 },
        { ...coins.AI16Z, amountToBuy: 50 },
        { ...coins.GIGACHAD, amountToBuy: 50 },
        { ...coins.POPCAT, amountToBuy: 20 },
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
        { ...coins.DDTG, amountToBuy: 3 },
        { ...coins.CHESTNUT, amountToBuy: 3 },
        { ...coins.SHORTNOY, amountToBuy: 10 },
        { ...coins.JAILSTOOL, amountToBuy: 50 },
        { ...coins.GREED3, amountToBuy: 70 },
        { ...coins.GREED2, amountToBuy: 10 },
        { ...coins.FARTSTOOL, amountToBuy: 5 },
        { ...coins.MISSPEACHES, amountToBuy: 10 },
      ],
    },
  ],

  [
    "WatcherGuru",
    {
      name: "Watcher Guru",
      coins: [],
    },
  ],
  [
    "DeItaone",
    {
      name: "Walter Bloomberg",
      coins: [{ ...coins.SWF, amountToBuy: 15, dontSell: true }],
    },
  ],

  [
    "RealRossU",
    {
      name: "Ross Ulbricht",
      coins: [
        // need to add a 15 second sell here
        { ...coins.ROGER, amountToBuy: 20 },
        { ...coins.LEAF, amountToBuy: 20 },
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
      coins: [{ ...coins.SWF, amountToBuy: 15, dontSell: true }],
    },
  ],
  [
    "davidsacks47",
    {
      name: "David Sacks",
      coins: [{ ...coins.SWF, amountToBuy: 15, dontSell: true }],
    },
  ],
  [
    "aeyakovenko",
    {
      name: "toly",
      coins: [{ ...coins.TOLITHETRENCHER, amountToBuy: 70 }],
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

// const trumpKeywordMap = new Map();
// for (const [username, account] of trumpAccountMap) {
//   for (const coin of account.coins) {
//     if (coin) {
//       if (coin.keywords) {
//         for (const keyword of coin.keywords) {
//           if (!trumpKeywordMap.has(keyword)) {
//             trumpKeywordMap.set(keyword, []);
//           }
//           trumpKeywordMap.get(keyword).push({ username, coin });
//         }
//       }
//     }
//   }
// }

export {
  coins,
  accountMap,
  keywordMap,
  testKeywordMap,
  testAccountMap,
  testCoins,
};
