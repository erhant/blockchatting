// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

/// @title Decentralized P2P Chatting
/// @author Erhan Tezcan (erhant)
/// @notice For education purposes only.
/// @dev A chat contract that allows users to send messages via their addresses.
contract Chat is Ownable, PullPayment {
  using SafeMath for uint256;

  /// @dev MessageSent event is emitted when `from` sends `text` to `to`.
  event MessageSent(address indexed _from, address indexed _to, string _text);

  /// @notice Mapping from addresses to public keys
  mapping(address => bytes32[2]) private publicKeys;

  /// @notice Number of users who have provided their public key
  uint256 public userCount = 0;

  /// @notice Base fee to buy an alias for the user.
  uint256 public aliasBaseFee = 0.0075 ether;

  /// @notice A mapping from address to alias, for alias resolution.
  mapping(address => bytes32) public addressToAlias;

  /// @notice A mapping from alias to address, for reverse alias resolution.
  mapping(bytes32 => address) public aliasToAddress;

  /// @notice Last purchase price
  mapping(bytes32 => uint256) public aliasLastPrices;

  /// Modifier to allow users to interact only if they have paid the entry fee.
  modifier onlyKeyProvided() {
    require(publicKeys[msg.sender][0] | publicKeys[msg.sender][1] != 0, "User did not provide public key.");
    _;
  }

  /// @notice Emits a MessageSent event, as a form of storage.
  function sendMessage(string calldata _text, address _to) external onlyKeyProvided {
    emit MessageSent(msg.sender, _to, _text);
  }

  function purchaseAlias(bytes32 _alias) external payable onlyKeyProvided {
    // get previous info
    uint256 aliasLastPrice = aliasLastPrices[_alias];
    address lastOwner = aliasToAddress[_alias];
    require(msg.value >= aliasBaseFee.add(aliasLastPrice), "Insufficient ether");

    // update alias info
    aliasLastPrices[_alias] = msg.value;
    aliasToAddress[_alias] = msg.sender;
    addressToAlias[msg.sender] = _alias;

    // send last price to previous user
    if (lastOwner != address(0)) {
      _asyncTransfer(lastOwner, aliasLastPrice);
    }
  }

  function refundAlias(bytes32 _alias) external onlyKeyProvided {
    require(aliasToAddress[_alias] == msg.sender && addressToAlias[msg.sender] == _alias, "You do not own this alias");

    // get last price
    uint256 aliasLastPrice = aliasLastPrices[_alias];

    // update alias info
    aliasLastPrices[_alias] = 0;
    aliasToAddress[_alias] = address(0);
    addressToAlias[msg.sender] = bytes32(0);

    // send refund
    _asyncTransfer(msg.sender, aliasLastPrice);
  }

  /// User provides their public key to start using the application
  function provideKey(bytes32 pk_half1, bytes32 pk_half2) external {
    // 20 bytes of hash of public key should be the address
    address addr = address(uint160(uint256(keccak256(abi.encodePacked(pk_half1, pk_half2)))));
    require(addr == tx.origin, "This is not your public key.");
    require(msg.sender == tx.origin, "No contract middlemans are allowed.");
    publicKeys[msg.sender][0] = pk_half1;
    publicKeys[msg.sender][1] = pk_half2;
  }

  /// Change the alias base fee.
  function changeAliasBaseFee(uint256 amount) external onlyOwner {
    aliasBaseFee = amount;
  }

  receive() external payable {}

  fallback() external payable {}
}
