module.exports = function arraysContainSameItems(array1, array2) {
  // Check if both arrays are of equal length
  if (array1.length !== array2.length) {
    return false;
  }

  // Sort both arrays
  const sortedArray1 = array1.slice().sort();
  const sortedArray2 = array2.slice().sort();

  // Compare each element in the sorted arrays
  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }

  // If all elements are the same, return true
  return true;
};
