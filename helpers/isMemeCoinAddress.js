module.exports = function isMemeCoinAddress(str) {
  // Define a regex pattern that matches the format you provided
  let isItMemeCoin = str.length > 41 && str.length < 46;
  console.log("🚀 ~ isMemeCoinAddress ~ isItMemeCoin:", isItMemeCoin);

  if (!isItMemeCoin) {
    const stringArray = str.split(" ");
    console.log("🚀 ~ isMemeCoinAddress ~ stringArray:", stringArray);

    for (let strr of stringArray) {
      console.log("🚀 ~ isMemeCoinAddress ~ strr:", strr);
      if (pattern.test(strr)) {
        console.log("pattern.test(strr):: ", pattern.test(strr));
        isItMemeCoin = true;
      }
    }
  }

  return isItMemeCoin;
};
