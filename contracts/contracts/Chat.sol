// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

/// @title Decentralized P2P Chatting
/// @author Erhan Tezcan (erhant)
/// @notice For education purposes only.
/// @dev A chat contract that allows users to send messages via their addresses.
contract Chat is Ownable, PullPayment {
  /// @notice Messages sent are stored as event logs. The sender and recipient are both indexed.
  /// @dev _message is expected to be encrypted by _to's public key.
  event MessageSent(address indexed _from, address indexed _to, string _message);

  /// @notice An initialization event holds the encrypted secret, public key prefix (true: 0x02, false: 0x03) and the 32-byte
  /// elliptic curve point X coordinate.
  /// @dev This is emitted only once.
  event UserInitialized(address indexed _user, bytes32 _encSecret, bool _pubKeyPrefix, bytes32 _pubKeyX);
  uint256 public initializedCount = 0;
  mapping(address => bool) public isInitialized;

  /// @notice Address ~ Alias resolution and prices
  mapping(address => bytes32) public addressToAlias;
  mapping(bytes32 => address) public aliasToAddress;
  mapping(bytes32 => uint256) public aliasPrice;
  uint256 public aliasFee = 0.0075 ether;
  uint256 private treasury = 0;

  /// @notice Allow users to interact only if they have provided public key
  modifier onlyInitialized() {
    require(isInitialized[msg.sender], "User was not initialized.");
    _;
  }

  /// @notice Emits a MessageSent event, as a form of storage.
  function sendMessage(string calldata _text, address _to) external onlyInitialized {
    emit MessageSent(msg.sender, _to, _text);
  }

  /// @notice Purchase an alias
  /// @dev A user can buy an alias from themselves. This in effect increases the price.
  /// @custom:todo allow only one alias per user?
  function purchaseAlias(bytes32 _alias) external payable onlyInitialized {
    // get previous info
    uint256 lastPrice = aliasPrice[_alias];
    address lastOwner = aliasToAddress[_alias];
    require(msg.value >= aliasFee + lastPrice, "Insufficient ether.");
    treasury += aliasFee;

    // update alias info
    aliasPrice[_alias] = msg.value - aliasFee;
    aliasToAddress[_alias] = msg.sender;
    addressToAlias[msg.sender] = _alias;

    // send last price to previous owner
    if (lastOwner != address(0) && lastPrice != 0) {
      _asyncTransfer(lastOwner, lastPrice);
    }
  }

  /// @notice Release an alias, user gets repaid their paid amount
  function refundAlias(bytes32 _alias) external onlyInitialized {
    // get previous info
    address lastOwner = aliasToAddress[_alias];
    uint256 lastPrice = aliasPrice[_alias];
    require(lastOwner == msg.sender, "You do not own this alias.");

    // update alias info
    aliasPrice[_alias] = 0;
    aliasToAddress[_alias] = address(0);
    addressToAlias[lastOwner] = bytes32(0);

    // send refund to previous owner
    if (lastPrice != 0) {
      _asyncTransfer(lastOwner, lastPrice);
      treasury -= lastPrice;
    }
  }

  /// @notice User provides their public key and encrypted secret to start using the application
  function initialize(
    bytes32 encryptedSecret,
    bool pubKeyPrefix,
    bytes32 pubKeyX
  ) external {
    require(!isInitialized[msg.sender], "User already initialized.");
    isInitialized[msg.sender] = true;
    initializedCount++;
    emit UserInitialized(msg.sender, encryptedSecret, pubKeyPrefix, pubKeyX);
  }

  /// @notice Change the alias base fee.
  function changeAliasBaseFee(uint256 amount) external onlyOwner {
    aliasFee = amount;
  }

  /// @notice Withdraw ether from this contract.
  /// @dev It withdraws the treasury, not the balance; some users may be waiting to withdraw their funds.
  function withdraw() external onlyOwner {
    payable(owner()).transfer(treasury);
    treasury == 0;
  }

  /// @notice Get the treasury value
  function getTreasury() external view onlyOwner returns(uint256) {
    return treasury;
  }

  receive() external payable {}

  fallback() external payable {}
}
