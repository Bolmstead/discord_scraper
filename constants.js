// double check the addresses

// Compile lookup maps at module level for better performance
const coins = {
  TESTCOIN: {
    name: "TESTCOIN",
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    keywords: ["a", "e", "i", "o", "u", "!", "?", ".", ",", ":", ";", "-"],
  },
  OPTIMUSCOMPANION: {
    name: "Optimus Companion",
    address: "AAsPWrftj7QeabkB8mbUFsjMsTsf1zCZ4DT5tNZ3bonk",
    keywords: ["Optimus as a Grok companion", "optimus companion"],
  },
  PVE: {
    name: "PVE",
    address: "8BjQHNfcMzNM36rdk6avoJj3c3CTcDGMU5S26Hhgpump",
    keywords: ["elon", "musk"],
  },
  GROK420: {
    name: "Grok 420",
    address: "23FH7fk4aLajVppQzr5BALeZh9fpnW8jkQevqRcgpump",
    keywords: ["grok 4.20", "grok 420", "grok420", "grok4.20"],
  },
  MOODENG: {
    name: "Moodeng",
    address: "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY",
    keywords: ["moo deng", "moodeng"],
  },
  GOATSEUSMAXIMUS: {
    name: "Goatse Us Maximus",
    address: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump",
    keywords: ["Goatseus Maximus", "goatseus"],
  },
  PENGU: {
    name: "Pengu",
    address: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
    keywords: ["pudgy penguin"],
  },
  SHARKCAT: {
    name: "Shark Cat",
    address: "6D7NaB2xsLd7cauWu1wKk6KBsJohJmP2qZH9GEfVi5Ui",
    keywords: ["shark cat", "sharkcat"],
  },
  PONKE: {
    name: "Ponke",
    address: "5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC",
    keywords: ["ponke"],
  },
  MICHI: {
    name: "michi",
    address: "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp",
    keywords: ["michi ", " michi", "michi.", "michi,"],
  },
  CHILLGUY: {
    name: "Chill Guy",
    address: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
    keywords: ["chill guy", "chillguy"],
  },
  ZEREBRO: {
    name: "Zerebro",
    address: "8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn",
    keywords: ["zerebro"],
  },
  UNICORNFARTDUST: {
    name: "Unicorn Farter Dust",
    address: "eL5fUxj2J4CiQsmW85k5FG9DvuQjjUoBHoQBi2Kpump",
    keywords: ["unicorn fart dust"],
  },
  RETARDIO: {
    name: "Retardio",
    address: "6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx",
    keywords: ["retardio"],
  },
  FWOG: {
    name: "Fwog",
    address: "A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump",
    keywords: ["fwog"],
  },
  BOOKOFMEME: {
    name: "Book of Meme",
    address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
    keywords: ["book of meme"],
  },
  LAUNCHCOIN: {
    name: "Launch Coin",
    address: "Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk",
    keywords: ["launchcoin", "launch coin"],
  },

  USELESSCOIN: {
    name: "USELESSCOIN",
    address: "Dz9mQ9NzkBcCsuGPFJ3r1bS4wgqKMHBPiVuniW8Mbonk",
    keywords: ["uselesscoin", "useless coin"],
  },
  JEDIOFUSA: {
    name: "JOTUS",
    address: "5spzxsgCMetaWbZNnUCcxSGmnmCHHjL3WaCdtNNhBR7K",
    keywords: [],
  },
  MENVSGORILLA: {
    name: "100 Men Vs Gorilla",
    address: "qRUZaCpgxaRH1s5V6opjPA6Hnpv5BM37LqkDBw7pump",
    keywords: ["vs gorilla"],
  },
  DOGEQUEST: {
    name: "DOGEQUEST",
    address: "GmcNY55weZBRgs7YC3KWijTKnPdv8XDy6DLuLLvdNHtU",
    keywords: ["dogequest"],
  },
  TOLITHETRENCHER: {
    name: "Toli",
    address: "5C8LMqZ9dbQ3RWoe5pFk5fJPhgiBQtBYdMnzekfJpump",
    keywords: ["toli the trencher", "tolithetrencher"],
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
  LOCKIN: {
    name: "Lockin",
    address: "8Ki8DpuWNxu9VsS3kQbarsCWMcFGWkzzA8pUPto9zBd5",
    keywords: ["$lockin", "lock in"],
  },
  BUTTHOLE: {
    name: "BUTTHOLE COIN",
    address: "CboMcTUYUcy9E6B3yGdFn6aEsGUnYV6yWeoeukw6pump",
    keywords: ["butthole coin", "$butthole"],
  },
  BRAINLET: {
    name: "Brainlet",
    address: "8NNXWrWVctNw1UFeaBypffimTdcLCcD8XJzHvYsmgwpF",
    keywords: ["brainlet"],
  },
  CHILLHOUSE: {
    name: "Chill House",
    address: "GkyPYa7NnCFbduLknCfBfP7p8564X1VZhwZYJ6CZpump",
    keywords: ["chill house"],
  },
  THEAMERICAPARTY: {
    name: "The america Party",
    address: "39zSVsSHFqNhARbVh6n8ZF78nCmhV3gSg8D39xhBNe73",
    keywords: ["america party"],
  },
  BUTTCOIN: {
    name: "Butt Coin",
    address: "FasH397CeZLNYWkd3wWK9vrmjd1z93n3b59DssRXpump",
    keywords: ["buttcoin", "butt coin"],
  },
  BABYGROK: {
    name: "Baby Grok",
    address: "8uSFaAvg2BHZ3QYAnkshoi6AxErPJvJG53NsjKjDbonk",
    keywords: ["baby grok", "babygrok"],
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
    keywords: ["ewon wusk"],
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
  MRBEASTCEOELONREPLY: {
    name: "Mr Beast CEO",
    address: "cDkTvtXwJLqAS5NqpiwoTT2cbe6GkPBfBwkb5kppump",
    keywords: ["I’ll fill the roll"],
  },
  MRBEASTCEO: {
    name: "Mr Beast CEO",
    address: "cDkTvtXwJLqAS5NqpiwoTT2cbe6GkPBfBwkb5kppump",
    keywords: ["ceo", "CEO", "C.E.O.", "c.e.o."],
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
  _8008: {
    name: "8008",
    address: "5puhwnyz2Tv8jSmmBD5DSqCwFVXwwPGZacymM7DQpump",
    keywords: ["8008"],
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
    address: "XC78JjRHnSqaysrHiTrhR8eRngFbvX3rrHyRjWEpump",
    keywords: ["kekius", "kekius maximus"],
  },
  PNUT: {
    name: "Peanut the Squirrel",
    address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
    keywords: ["pnut", "peanut"],
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
    keywords: ["mangione"],
  },
  ASSANGE: {
    name: "Julian Assange",
    address: "4FrXUwfQ7zp56N87ac8BX2aqmFoKmvo6Jp7SuTMZpump",
    keywords: ["assange"],
  },
  GORBAGANA: {
    name: "Gorbagana",
    address: "71Jvq4Epe2FCJ7JFSF7jLXdNk1Wy4Bhqd9iL6bEFELvg",
    keywords: ["gorbagana"],
  },
  TRUMP2028: {
    name: "Trump 2028",
    address: "5wQFpZ2Xstd6khM8WwtVdhegiNEjM48DYErMVVknpump",
    keywords: ["trump 2028"],
  },
  BADRUDICOMPANION: {
    name: "Bad Rudi",
    address: "777Z92HqqGEav312yx8CfakajosBRFFUMbemyLaqbonk",
    keywords: ["bad rudi"],
  },
  GOODRUDICOMPANION: {
    name: "Good Rudi",
    address: "FT8X8hqoEwNT8UifNL3ppPbpccf7mnuNLpJsszv7AFHW",
    keywords: ["good rudi"],
  },
  KAICOMPANION: {
    name: "Kai",
    address: "GVa62H8JdrHQNTh1ryDirwssiyv7Uh3vYLgEab7Abonk",
    keywords: ["kai ", " kai"],
  },
  ANICOMPANION: {
    name: "Ani Companion",
    address: "9tqjeRS1swj36Ee5C1iGiwAxjQJNGAVCzaTLwFY8bonk",
    keywords: [" ani "],
  },
  VALENTINECOMPANION: {
    name: "Valentine",
    address: "9GtvcnDUvGsuibktxiMjLQ2yyBq5akUahuBs8yANbonk",
    keywords: ["valentine"],
  },

  DEPORTLON: {
    name: "Deportlon",
    address: "5RcXsuKg6nWH9UEKdf22XLwwKJE2EmcGuHNadpgGDa9v",
    keywords: ["deportlon"],
  },

  JPMD: {
    name: "jpmd",
    address: "GgLyU28hTpmttqqkBFYm5fDZuC5TvVw36V1UdT2aZvrC",
    keywords: ["jpmd"],
  },
  HARAMBE: {
    name: "HARAMBE",
    address: "Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP",
    keywords: ["harambe"],
  },
  OBIPNUTKENOBI: {
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
    keywords: ["a", "e", "i", "o", "u", "!", "?", ".", ",", ":", ";", "-"],
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
  DICKIPEDIA: {
    name: "Dickipedia",
    address: "2ypdWsPMGX1WrRjSC3UDQ8Tv4hTi4qEXsUJDFY3PCzfA",
    keywords: ["dickipedia"],
  },
  SWF: {
    name: "Sovereign Wealth Fund",
    address: "FtBXDMyD4SvAa6keQPAGk4sgRVuUECsxGU1X2dLWpump",
    keywords: ["sovereign wealth fund"],
  },
  TGC: {
    name: "TRUMP GOLD CARDS",
    address: "GsSUx3qENEAn5MDQLGYHYs7ThtPXsnwCkKwqv1ZWbonk",
    keywords: ["trump gold card", "gold card"],
  },

  SIGMABOY: {
    name: "Sigmaboy",
    address: "4N5jkEmddTxtZQzjb4XowDJvHDzcxkByxMAf9Xa4bonk",
    keywords: ["sigmaboy", "sigma boy"],
  },
  LUCKYCOIN: {
    name: "Lucky Coin",
    address: "3BtunCQ3KdpsYtXQU9SmkGopnDkaQHuEgG14Dy1Lbonk",
    keywords: ["lucky coin", "luckycoin"],
  },
  KNOX: {
    name: "Official Fort Knox Coin",
    address: "4N8g7mw171aVC1oMMRV1pMrQuB1RwFHaJan2WYyBpump",
    keywords: ["knox"],
  },

  BROCCOLI: {
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

  SUPERGROK: {
    name: "Super Grok",
    address: "P79VPZFfDreHPQVEF9BHZtAipDpviczpcnBXHWspump",
    keywords: ["super grok", "supergrok"],
  },
  MELANIA: {
    name: "Melania Trump",
    address: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P",
    keywords: ["$melania"],
  },
  BABYDEER: {
    name: "Baby Deer",
    address: "6pKHwNCpzgZuC9o5FzvCZkYSUGfQddhUYtMyDbEVpump",
    keywords: ["baby deer"],
  },
  JEROMEPOWELL: {
    name: "Jerome Powell",
    address: "GKat8UhnNDRoS4iVpG9qvVG4Wn1rVhmLvraraoJVpump",
    keywords: ["jerome powell"],
  },

  $100BILL: {
    name: "$100",
    address: "7Eg4Bin1U4SNggFJFrKuGTo6e7ShuzjYyW9Quxtxpump",
    keywords: ["golden age act", "100 bill", "100 dollar bill"],
  },
  SCAMALTMAN: {
    name: "Scam Altman",
    address: "p5LZKhRE2qhCS9Ys8TjwB8r3DspxQVxSowcrc3tKgkz",
    keywords: ["scam altman"],
  },
  MRLEAN: {
    name: "Mr Lean",
    address: "6pKHwNCpzgZuC9o5FzvCZkYSUGfQddhUYtMyDbEVpump",
    keywords: ["lean"],
  },
  LOFIMAGA: {
    name: "lofi maga",
    address: "DD9h7ubCk3EPDi8VCno9FCuF123eQyM3byyehVd8nFhG",
    keywords: ["lo-fi"],
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
  ROARINGKITTY: {
    name: "Roaring Kitty",
    address: "EKEWAk7hfnwfR8DBb1cTayPPambqyC7pwNiYkaYQKQHp",
    keywords: ["roaring kitty", "roaringkitty", "keith gill"],
  },
  BASEDELON: {
    name: "Based Elon",
    address: "37CK1GDT6y2YXKD3amHLwfkVXPmM1EMYAGmDKXiEbonk",
    keywords: ["based elon"],
  },
  ANISWEENEY: {
    name: "Anisweeney",
    address: "GcvKeTrLHfri5R4nQWvJd7FX3SLo3ZzSFD5zwGMpbonk",
    keywords: [
      "ani sweeney",
      "who did it better",
      "are you ok",
      "who did this",
      "which way western man",
      "download grok.",
      "Companions have great jeans",
    ],
  },
};
// Create efficient lookup maps
const accountMap = new Map([
  // Active accounts
  [
    "theunipcs",
    {
      name: "Bonk Guy",
      coins: [
        { ...coins.LUCKYCOIN, amountToBuy: 10 },
        { ...coins.SIGMABOY, amountToBuy: 6 },
      ],
    },
  ],
  [
    "realDonaldTrump",
    {
      name: "Donald Trump",
      coins: [
        { ...coins.FARTCOIN, amountToBuy: 50 },
        { ...coins.PENGU, amountToBuy: 50 },
        { ...coins.MOODENG, amountToBuy: 50 },
        { ...coins.GOATSEUSMAXIMUS, amountToBuy: 50 },
        { ...coins.SHARKCAT, amountToBuy: 50 },
        { ...coins.PONKE, amountToBuy: 50 },
        { ...coins.MICHI, amountToBuy: 50 },
        { ...coins.CHILLGUY, amountToBuy: 50 },
        { ...coins.ZEREBRO, amountToBuy: 50 },
        { ...coins.UNICORNFARTDUST, amountToBuy: 50 },
        { ...coins.RETARDIO, amountToBuy: 50 },
        { ...coins.FWOG, amountToBuy: 50 },
        { ...coins.HOSICO, amountToBuy: 50 },
        { ...coins.BOOKOFMEME, amountToBuy: 50 },
        { ...coins.PWEASE, amountToBuy: 50 },
        { ...coins.LAUNCHCOIN, amountToBuy: 50 },
        { ...coins.USELESSCOIN, amountToBuy: 50 },
        { ...coins.LOCKIN, amountToBuy: 50 },
        { ...coins.BRAINLET, amountToBuy: 50 },
        { ...coins.BUTTHOLE, amountToBuy: 50 },
        { ...coins.CHILLHOUSE, amountToBuy: 50 },
        { ...coins.AI16Z, amountToBuy: 50 },
        { ...coins.DOGWIFHAT, amountToBuy: 50 },
        { ...coins.GIGACHAD, amountToBuy: 50 },
        { ...coins.POPCAT, amountToBuy: 50 },
        { ...coins.RETARDFINDER, amountToBuy: 50 },
        { ...coins.HOSICO, amountToBuy: 50 },
        { ...coins.SARATOGA, amountToBuy: 6 },
        { ...coins.GREENLAND, amountToBuy: 10 },
        { ...coins.HKU5, amountToBuy: 3 },
        { ...coins.SWF, amountToBuy: 10 },
        { ...coins.TGC, amountToBuy: 20 },

        { ...coins.SIGMABOY, amountToBuy: 6 },
        { ...coins.THEAMERICAPARTY, amountToBuy: 50 },
        { ...coins.DEPORTLON, amountToBuy: 3 },
        { ...coins.CSR, amountToBuy: 30 },
        { ...coins.ROARINGKITTY, amountToBuy: 50 },
        { ...coins.TRUMPSEASON, amountToBuy: 2 },
        { ...coins.TRUMPBILL, amountToBuy: 7 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 20 },
        {
          ...coins.MELANIA,
          amountToBuy: 70,
          percentToSell: 20,
          timeBetweenSells: 7000,
        },
        {
          ...coins.JEROMEPOWELL,
          amountToBuy: 2,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
        { ...coins.UNCONDITIONALSURRENDER, amountToBuy: 3 },
        { ...coins.TRUMPGAZA, amountToBuy: 3 },
        { ...coins.PNUT, amountToBuy: 30 },
        { ...coins.BIGBALLS, amountToBuy: 40 },
        { ...coins.KM, amountToBuy: 30 },
        { ...coins.DOGEFATHER, amountToBuy: 40 },
        { ...coins.LUIGI, amountToBuy: 30 },
        { ...coins.ASSANGE, amountToBuy: 3 },
        { ...coins.HARAMBE, amountToBuy: 70 },
        { ...coins.JAILSTOOL, amountToBuy: 70 },
        { ...coins.ROGER, amountToBuy: 15 },
        { ...coins.DOODOOCOIN, amountToBuy: 4 },
        { ...coins.GROKCOIN, amountToBuy: 10 },
        { ...coins.DICKBUTT, amountToBuy: 15 },
        { ...coins.TITCOIN, amountToBuy: 70 },
        { ...coins.BUTTCOIN, amountToBuy: 70 },
        { ...coins.SBR, amountToBuy: 50 },
        { ...coins.TRUMP2028, amountToBuy: 10 },
        { ...coins.EWON, amountToBuy: 5 },
        { ...coins.TRUTHGPT, amountToBuy: 2 },
        { ...coins.KNOX, amountToBuy: 10 },
        {
          ...coins.UNIPARTY,
          amountToBuy: 3,
          percentToSell: 20,
          timeBetweenSells: 10,
        },
        { ...coins.FLOKI, amountToBuy: 10 },
        { ...coins.MENVSGORILLA, amountToBuy: 5 },
        { ...coins.GROK420, amountToBuy: 20 },
        { ...coins.SCAMALTMAN, amountToBuy: 5 },
        { ...coins.LOFIMAGA, amountToBuy: 3 },

        // { ...coins.TESTCOIN, amountToBuy: 0.001 },
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
        { ...coins.ANISWEENEY, amountToBuy: 30 },
        { ...coins.GROK420, amountToBuy: 30 },

        { ...coins.DICKIPEDIA, amountToBuy: 5 },
        { ...coins.OPTIMUSCOMPANION, amountToBuy: 10 },
        { ...coins.KAICOMPANION, amountToBuy: 20 }, // beecee recommendation
        { ...coins.BADRUDICOMPANION, amountToBuy: 10 },
        { ...coins.GOODRUDICOMPANION, amountToBuy: 10 }, // beecee recommendation
        // { ...coins.VALENTINECOMPANION, amountToBuy: 2 },
        { ...coins.BABYGROK, amountToBuy: 25 }, // CAUTION
        { ...coins.PENGU, amountToBuy: 50 },
        {
          ...coins.BASEDELON,
          amountToBuy: 10,
          percentToSell: 33,
          timeBetweenSells: 3000,
        },

        {
          ...coins.SUPERGROK,
          amountToBuy: 10,
          percentToSell: 33,
          timeBetweenSells: 3000,
        },
        { ...coins.MOODENG, amountToBuy: 50 },
        { ...coins.GOATSEUSMAXIMUS, amountToBuy: 50 },
        { ...coins.SHARKCAT, amountToBuy: 50 },
        { ...coins.PONKE, amountToBuy: 50 },
        { ...coins.ASSANGE, amountToBuy: 3 },
        { ...coins.MICHI, amountToBuy: 50 },
        { ...coins.CHILLGUY, amountToBuy: 50 },
        { ...coins.ZEREBRO, amountToBuy: 50 },
        { ...coins.UNICORNFARTDUST, amountToBuy: 50 },
        { ...coins.RETARDIO, amountToBuy: 50 },
        { ...coins.FWOG, amountToBuy: 50 },
        { ...coins.HOSICO, amountToBuy: 50 },
        { ...coins.BOOKOFMEME, amountToBuy: 50 },
        { ...coins.LAUNCHCOIN, amountToBuy: 50 },
        { ...coins.USELESSCOIN, amountToBuy: 50 },
        { ...coins.BRAINLET, amountToBuy: 50 },
        { ...coins.BUTTHOLE, amountToBuy: 50 },
        { ...coins.CHILLHOUSE, amountToBuy: 50 },
        { ...coins.SARATOGA, amountToBuy: 10 },
        { ...coins.SCAMALTMAN, amountToBuy: 5 },
        { ...coins.LUIGI, amountToBuy: 30 },
        { ...coins.TRUMPGAZA, amountToBuy: 3 },
        { ...coins.FARTCOIN, amountToBuy: 50 },
        { ...coins.RETARDFINDER, amountToBuy: 50 },
        { ...coins.KM, amountToBuy: 15 },
        { ...coins.PNUT, amountToBuy: 50 },
        { ...coins.NOLAND, amountToBuy: 10 },
        { ...coins.HARAMBE, amountToBuy: 50 },
        { ...coins.TRUTHGPT, amountToBuy: 2 },
        { ...coins.TRUMP2028, amountToBuy: 10 },
        { ...coins.SWF, amountToBuy: 10 },
        { ...coins.DOGEFATHER, amountToBuy: 40 },
        { ...coins.SBR, amountToBuy: 40 },
        { ...coins.CSR, amountToBuy: 30 },
        { ...coins.TRUMPSEASON, amountToBuy: 2 },
        { ...coins.HOSICO, amountToBuy: 50 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 20 },
        { ...coins.KNOX, amountToBuy: 10 },
        { ...coins.DICKBUTT, amountToBuy: 15 },
        { ...coins.TITCOIN, amountToBuy: 50 },
        {
          ...coins.THEAMERICAPARTY,
          amountToBuy: 30,
        },
        { ...coins.BUTTCOIN, amountToBuy: 50 },
        { ...coins.GORBAGANA, amountToBuy: 50 },
        { ...coins.OBIPNUTKENOBI, amountToBuy: 50 },
        { ...coins.JAILSTOOL, amountToBuy: 50 },
        { ...coins.ROGER, amountToBuy: 15 },
        { ...coins.PWEASE, amountToBuy: 50 },
        { ...coins.ROARINGKITTY, amountToBuy: 40 },
        { ...coins._8008, amountToBuy: 10 },

        // {
        //   ...coins.GROK4,
        //   amountToBuy: 40,
        //   percentToSell: 20,
        //   timeBetweenSells: 7,
        // },
        { ...coins.DOODOOCOIN, amountToBuy: 4 },
        { ...coins.GROKCOIN, amountToBuy: 10 },
        { ...coins.EWON, amountToBuy: 5 },
        { ...coins.HKU5, amountToBuy: 3 },
        { ...coins.DOGWIFHAT, amountToBuy: 50 },
        { ...coins.FLOKI, amountToBuy: 10 },
        { ...coins.AI16Z, amountToBuy: 50 },
        { ...coins.GIGACHAD, amountToBuy: 50 },
        { ...coins.POPCAT, amountToBuy: 50 },
        { ...coins.MENVSGORILLA, amountToBuy: 5 },
        { ...coins.DEPORTLON, amountToBuy: 3 },
        { ...coins.MRBEASTCEOELONREPLY, amountToBuy: 20 },
        // { ...coins.TESTCOIN, amountToBuy: 0.001 },
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
        { ...coins.KM, amountToBuy: 15 },
        { ...coins.HARAMBE, amountToBuy: 30 },
        { ...coins.TRUMPSEASON, amountToBuy: 2 },
        { ...coins.STRATEGICSOLANARESERVE, amountToBuy: 20 },
        { ...coins.DICKBUTT, amountToBuy: 15 },
        { ...coins.JAILSTOOL, amountToBuy: 50 },
        { ...coins.PWEASE, amountToBuy: 40 },
        { ...coins.DOODOOCOIN, amountToBuy: 4 },
        { ...coins.GROKCOIN, amountToBuy: 10 },
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
        {
          ...coins.PWEASE,
          amountToBuy: 70,
          percentToSell: 20,
          timeBetweenSells: 10000,
        },
        { ...coins.FARTCOIN, amountToBuy: 70 },
        { ...coins.PENGU, amountToBuy: 70 },
        { ...coins.MOODENG, amountToBuy: 70 },
        { ...coins.GOATSEUSMAXIMUS, amountToBuy: 70 },
        { ...coins.SHARKCAT, amountToBuy: 70 },
        { ...coins.PONKE, amountToBuy: 70 },
        { ...coins.MICHI, amountToBuy: 70 },
        { ...coins.CHILLGUY, amountToBuy: 70 },
        { ...coins.ZEREBRO, amountToBuy: 70 },
        { ...coins.UNICORNFARTDUST, amountToBuy: 70 },
        { ...coins.RETARDIO, amountToBuy: 70 },
        { ...coins.FWOG, amountToBuy: 70 },
        { ...coins.HOSICO, amountToBuy: 70 },
        { ...coins.BOOKOFMEME, amountToBuy: 70 },
        { ...coins.LAUNCHCOIN, amountToBuy: 70 },
        { ...coins.USELESSCOIN, amountToBuy: 70 },
        { ...coins.LOCKIN, amountToBuy: 70 },
        { ...coins.BRAINLET, amountToBuy: 70 },
        { ...coins.BUTTHOLE, amountToBuy: 70 },
        { ...coins.CHILLHOUSE, amountToBuy: 70 },
        { ...coins.AI16Z, amountToBuy: 70 },
        { ...coins.DOGWIFHAT, amountToBuy: 70 },
        { ...coins.GIGACHAD, amountToBuy: 70 },
        { ...coins.POPCAT, amountToBuy: 70 },
        { ...coins.RETARDFINDER, amountToBuy: 70 },
        { ...coins.HOSICO, amountToBuy: 70 },
        { ...coins.TITCOIN, amountToBuy: 70 },
        { ...coins.BUTTCOIN, amountToBuy: 70 },
        { ...coins.DICKBUTT, amountToBuy: 15 },
        { ...coins.FARTCOIN, amountToBuy: 70 },
        { ...coins.HARAMBE, amountToBuy: 70 },
        { ...coins.DOGWIFHAT, amountToBuy: 70 },
        { ...coins.FLOKI, amountToBuy: 10 },
        { ...coins.AI16Z, amountToBuy: 70 },
        { ...coins.GIGACHAD, amountToBuy: 70 },
        { ...coins.POPCAT, amountToBuy: 70 },
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
        { ...coins.CHESTNUT, amountToBuy: 1 },
        { ...coins.SHORTNOY, amountToBuy: 1 },
        {
          ...coins.JAILSTOOL,
          amountToBuy: 70,
          timeBetweenSells: 5000,
          percentToSell: 20,
        },
        { ...coins.GREED3, amountToBuy: 40 },
        { ...coins.GREED2, amountToBuy: 5 },
        { ...coins.FARTSTOOL, amountToBuy: 2 },
        { ...coins.MISSPEACHES, amountToBuy: 8 },
        { ...coins.HOTDOG, amountToBuy: 2 },
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
      coins: [],
    },
  ],
  [
    "db",
    {
      name: "tier10k",
      coins: [],
    },
  ],
  [
    "RealRossU",
    {
      name: "Ross Ulbricht",
      coins: [
        // need to add a 15 second sell here
        { ...coins.ROGER, amountToBuy: 15 },
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
      coins: [
        {
          ...coins.SWF,
          amountToBuy: 10,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
        {
          ...coins.SBR,
          amountToBuy: 40,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
        {
          ...coins.CSR,
          amountToBuy: 40,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
      ],
    },
  ],
  [
    "davidsacks47",
    {
      name: "David Sacks",
      coins: [
        {
          ...coins.SWF,
          amountToBuy: 10,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
        {
          ...coins.SBR,
          amountToBuy: 40,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
        {
          ...coins.CSR,
          amountToBuy: 40,
          percentToSell: 33,
          timeBetweenSells: 10000,
        },
      ],
    },
  ],
  [
    "aeyakovenko",
    {
      name: "toly",
      coins: [
        // { ...coins.TOLITHETRENCHER, amountToBuy: 10 },
        // { ...coins.GORBAGANA, amountToBuy: 70 },
      ],
    },
  ],
  [
    "MarioNawfal",
    {
      name: "Mario Nawfal",
      username: "MarioNawfal",
      coins: [
        // {
        //   ...coins.TESTCOIN,
        //   amountToBuy: 0.0001,
        // },
      ],
    },
  ],
  [
    "nypost",
    {
      name: "NY Post",
      username: "nypost",
      coins: [
        // {
        //   ...coins.TESTCOIN,
        //   amountToBuy: 0.0001,
        // },
      ],
    },
  ],
  [
    "SolportTom",
    {
      name: "Bonk Guy",
      username: "SolportTom",
      coins: [],
    },
  ],
  [
    "cz",
    {
      name: "CZ Binance ",
      username: "cz",
      coins: [
        {
          ...coins.BROCCOLI,
          amountToBuy: 30,
          percentToSell: 20,
          timeBetweenSells: 5000,
        },
      ],
    },
  ],
  [
    "SBF_FTX",
    {
      name: "SBF",
      username: "SBF_FTX",
      coins: [{ ...coins.SBF, amountToBuy: 30 }],
    },
  ],
  [
    "cb_doge",
    {
      name: "DogeDesigner",
      username: "cb_doge",
      coins: [
        { ...coins.BABYGROK, amountToBuy: 5 }, // CAUTION
      ],
    },
  ],
  [
    "MrBeast",
    {
      name: "MrBeast",
      username: "MrBeast",
      coins: [
        { ...coins.MRLEAN, amountToBuy: 10 },
        { ...coins.MRBEASTCEO, amountToBuy: 20 },
      ],
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

export { coins, accountMap, keywordMap };
