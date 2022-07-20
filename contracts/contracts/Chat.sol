// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

/**
 * @title Chat
 * @author erhant
 * @dev A chat contract that allows users to send messages via their addresses.
 */
contract Chat is Ownable, PullPayment {
  using SafeMath for uint256;

  /// MessageSent event is emitted when `from` sends `text` to `to`.
  event MessageSent(address indexed _from, address indexed _to, string _text);

  /// Public Keys
  mapping(address => bytes32[2]) private publicKeys;
  uint256 public userCount = 0;

  /// AliasSet is emitted when `_user` sets their alias to `_alias`.
  /// Resetting an alias can be done by setting the alias to empty string.
  event AliasSet(address indexed _user, bytes32 _alias);

  /// Base fee to buy an alias for the user.
  uint256 public aliasBaseFee = 0.0075 ether;

  /// A mapping from address to alias
  mapping(address => bytes32) public addressToAlias;
  mapping(bytes32 => address) public aliasToAddress;
  mapping(bytes32 => uint256) public aliasLastPrices;

  /// Modifier to allow users to interact only if they have paid the entry fee.
  modifier onlyKeyProvided() {
    require(publicKeys[msg.sender][0] | publicKeys[msg.sender][1] != 0, "User did not provide public key.");
    _;
  }

  /// Emits a MessageSent event.
  /// The caller must have paid the entry fee.
  function sendMessage(string calldata _text, address _to) external onlyKeyProvided {
    emit MessageSent(msg.sender, _to, _text);
  }

  /// Emits an AliasSet event.
  /// The caller must have paid the entry fee.
  /// Alias is bought for aliasBaseFee + aliasLastPrice
  function purchaseAlias(bytes32 _alias) external payable onlyKeyProvided {
    // get last price
    uint256 aliasLastPrice = aliasLastPrices[_alias];
    require(msg.value >= aliasBaseFee.add(aliasLastPrice), "Insufficient ether");

    // send last price to previous user
    address lastOwner = aliasToAddress[_alias];
    if (lastOwner != address(0)) {
      _asyncTransfer(lastOwner, aliasLastPrice);
    }

    // update alias info
    aliasLastPrice = msg.value;
    aliasToAddress[_alias] = msg.sender;
    addressToAlias[msg.sender] = _alias;

    // emit event
    emit AliasSet(msg.sender, _alias);
  }

  /// User provides their public key to start using the application
  function provideKey(bytes32 pk_half1, bytes32 pk_half2) external {
    publicKeys[msg.sender][0] = pk_half1;
    publicKeys[msg.sender][1] = pk_half2;
  }

  /// Change the alias base fee.
  function changeAliasBaseFee(uint256 amount) external onlyOwner {
    aliasBaseFee = amount;
  }

  /// Withdraw contract balance.
  function withdraw() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }

  receive() external payable {}

  fallback() external payable {}
}
