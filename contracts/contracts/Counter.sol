// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

//import "hardhat/console.sol"; // this can be used to log to console of hardhat node terminal

/**
 * @dev A simple counter contract.
 */
contract Counter {
  uint256 private count = 0;

  /**
   * @dev Event for when the count changes.
   */
  event CountedTo(uint256 number);

  /**
   * @dev Getter for the count storage variable.
   */
  function getCount() external view returns (uint256) {
    return count;
  }

  /**
   * @dev Increment the counter.
   * @notice Rejects on overflow.
   */
  function countUp() external returns (uint256) {
    //console.log("countUp: count =", count);
    uint256 newCount = count + 1;
    require(newCount > count, "Uint256 overflow");

    count = newCount;

    emit CountedTo(count);
    return count;
  }

  /**
   * @dev Decrement the counter.
   * @notice Rejects on underflow.
   */
  function countDown() external returns (uint256) {
    //console.log("countDown: count =", count);
    uint256 newCount = count - 1;
    require(newCount < count, "Uint256 underflow");

    count = newCount;

    emit CountedTo(count);
    return count;
  }
}
