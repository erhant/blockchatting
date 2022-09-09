// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

/// @title Decentralized P2P Chatting
/// @author Erhan Tezcan (erhant)
/// @dev A chat contract that allows users to send messages via their addresses.
contract Chat is Ownable, PullPayment {
  /**
   * Messages sent are stored as event logs. The sender and recipient are both indexed.
   * _message is encrypted by a shared secret between _from and _to.
   */
  event MessageSent(address indexed _from, address indexed _to, string _message);

  /**
   * A user initialization holds the following:
   * - encrypted secret, used to generate application key-pair at a later time
   * - public key prefix (true: 0x02, false: 0x03)
   * - 32-byte elliptic curve point X coordinate
   *
   * With this public key, users aggree on a symmetric key which is later used to encrypt messages.
   */
  struct UserInitialization {
    bytes32 encryptedSecret;
    bool publicKeyPrefix;
    bytes32 publicKeyX;
  }

  /// Check if a user initialization object is empty.
  function isInitialized(address user) public view returns (bool) {
    return
      !(userInitializations[user].encryptedSecret == bytes32(0) && userInitializations[user].publicKeyX == bytes32(0));
  }

  /// Number of initialized users, for frontend
  uint256 public initializedUserCount = 0;

  /// Mapping of user to their initialization object
  mapping(address => UserInitialization) public userInitializations;

  /// A shared secret between two users, encrypted by the public key of first user
  mapping(address => mapping(address => bytes)) public chatInitializations;

  /// Address ~ Alias resolution and prices
  mapping(address => bytes32) public addressToAlias;
  mapping(bytes32 => address) public aliasToAddress;
  mapping(bytes32 => uint256) public aliasPrice;
  uint256 public aliasFee = 0.0075 ether;
  uint256 private treasury = 0;

  /// Allow users to interact only if they have provided public key
  modifier onlyInitializedUser() {
    require(isInitialized(msg.sender), "User was not initialized.");
    _;
  }

  /// Emits a MessageSent event, as a form of storage.
  function sendMessage(string calldata _ciphertext, address _to) external onlyInitializedUser {
    // TODO: implement this
    // require(
    //   (chatInitializations[msg.sender][_to] == chatInitializations[_to][msg.sender]) &&
    //     chatInitializations[msg.sender][_to] != bytes32(0),
    //   "Chat is not initialized with this user yet."
    // );
    emit MessageSent(msg.sender, _to, _ciphertext);
  }

  /// User provides their public key and encrypted secret to start using the application
  function initializeUser(
    bytes32 encryptedSecret,
    bool pubKeyPrefix,
    bytes32 pubKeyX
  ) external {
    require(!isInitialized(msg.sender), "User already initialized.");
    userInitializations[msg.sender] = UserInitialization(encryptedSecret, pubKeyPrefix, pubKeyX);
    initializedUserCount++;
  }

  /// Initialize a chat by providing a secret key for both the sender (you) and your receiver
  function initializeChat(
    bytes memory yourEncryptedSecret,
    bytes memory peerEncryptedSecret,
    address peer
  ) external {
    chatInitializations[msg.sender][peer] = yourEncryptedSecret;
    chatInitializations[peer][msg.sender] = peerEncryptedSecret;
  }

  receive() external payable {}

  fallback() external payable {}
}
