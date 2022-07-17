// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Chat
 * @author erhant
 * @dev A chat contract that allows users to send messages via their addresses.
 * Messages are stored as events.
 * Users can give themselves aliases to be displayed.
 */
contract Chat is Ownable {
  /// MessageSent event is emitted when `from` sends `text` to `to`.
  event MessageSent(address indexed _from, address indexed _to, string _text);

  /// AliasSet is emitted when `_user` sets their alias to `_alias`.
  /// Resetting an alias can be done by setting the alias to empty string.
  event AliasSet(address indexed _user, bytes32 _alias);

  /// Entry fee to interact with the contract.
  uint256 public entryFee = 0.001 ether;

  /// Alias fee to set an alias for the user.
  uint256 public aliasFee = 0.0075 ether;

  /// Mapping to keep track of which users have paid the entry fee.
  mapping(address => bool) public hasPaidFee;

  /// Modifier to allow users to interact only if they have paid the entry fee.
  modifier onlyFeePaid() {
    require(hasPaidFee[msg.sender], "User did not pay the entry fee.");
    _;
  }

  /// Emits a MessageSent event. The caller must have paid the entry fee.
  function sendMessage(string calldata _text, address _to) external onlyFeePaid {
    emit MessageSent(msg.sender, _to, _text);
  }

  /// Emits an AliasSet event. The caller must have paid the entry fee.
  function setAlias(bytes32 _alias) external onlyFeePaid {
    emit AliasSet(msg.sender, _alias);
  }

  /// User pays the entry fee. The amount can be more than entry fee, in which case the extra amont is sent back to the user.
  function payEntryFee() external payable {
    require(!hasPaidFee[msg.sender], "User has already paid the entry fee.");
    require(msg.value >= entryFee, "Insufficient amount for the entry fee!");

    hasPaidFee[msg.sender] = true;

    // send the extra back
    if (msg.value > entryFee) {
      payable(msg.sender).transfer(msg.value - entryFee);
    }
  }

  /**
   * @dev Change the entry fee
   */
  function changeEntryFee(uint256 amount) external onlyOwner {
    entryFee = amount;
  }

  /**
   * @dev Change the alias fee
   */
  function changeEntryFee(uint256 amount) external onlyOwner {
    aliasFee = amount;
  }

  /**
   * @dev Withdraw contract funds.
   */
  function withdraw() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }

  receive() external payable {}

  fallback() external payable {}
}
