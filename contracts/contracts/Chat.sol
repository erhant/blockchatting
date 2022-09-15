// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title Decentralized P2P Chatting
 * @author Erhan Tezcan (erhant)
 * @dev A chat contract that allows users to send messages via their addresses.
 */
contract Chat is Ownable {
  struct UserInitialization {
    bytes encryptedUserSecret;
    bool publicKeyPrefix;
    bytes32 publicKeyX;
  }

  event MessageSent(address indexed _from, address indexed _to, string _message, uint256 _time);
  event EntryFeeChanged(uint256 amount);
  event UserInitialized(address indexed user);
  event ChatInitialized(address indexed initializer, address indexed peer);

  uint256 public entryFee = 0.01 ether;

  /// Mapping of user to their initialization object
  mapping(address => UserInitialization) public userInitializations;

  /// A shared secret between two users, encrypted by the public key of first user
  mapping(address => mapping(address => bytes)) public chatInitializations;

  /**
   * @notice Checks if a user has been initialized.
   * @param user address
   */
  function isUserInitialized(address user) public view returns (bool) {
    return
      !(userInitializations[user].encryptedUserSecret.length == 0 &&
        userInitializations[user].publicKeyX == bytes32(0));
  }

  /**
   * @notice Checks if two users has initialized their chat.
   * @param initializer address
   * @param peer address
   */
  function isChatInitialized(address initializer, address peer) public view returns (bool) {
    return !(chatInitializations[initializer][peer].length == 0 && chatInitializations[peer][initializer].length == 0);
  }

  /**
   * @notice Emits a MessageEvent, assuming chat is initialized.
   * @param ciphertext A message encrypted by the secret chatting key.
   * @param to recipient address
   */
  function sendMessage(
    string calldata ciphertext,
    address to,
    uint256 time
  ) external {
    require(isChatInitialized(msg.sender, to), 'Chat not initialized.');
    emit MessageSent(msg.sender, to, ciphertext, time);
  }

  /**
   * @notice Initializes a user, which allows two things:
   * - user will be able to generate their own key on later logins, by retrieving the encrypted key-gen input and decrypt with their MetaMask
   * - other users will be able to encrypt messages using this users public key
   * @param encryptedUserSecret user secret to generate key-pair for the chatting application. it is encrypted by the MetaMask public key.
   * @param publicKeyPrefix prefix of the compressed key stored as a boolean (0x02: true, 0x03: false)
   * @param publicKeyX 32-byte X-coordinate of the compressed key
   */
  function initializeUser(
    bytes calldata encryptedUserSecret,
    bool publicKeyPrefix,
    bytes32 publicKeyX
  ) external payable {
    require(!isUserInitialized(msg.sender), 'User already initialized.');
    require(msg.value == entryFee, 'You must pay exactly as much as the entry fee.');
    userInitializations[msg.sender] = UserInitialization(encryptedUserSecret, publicKeyPrefix, publicKeyX);
    emit UserInitialized(msg.sender);
  }

  /**
   * @notice Initializes a chatting session between two users: msg.sender and a given peer.
   * A symmetric key is encrypted with both public keys once and stored for each
   * @dev Both users must be initialized.
   * @param yourEncryptedChatSecret Symmetric key, encrypted by the msg.sender's public key.
   * @param peerEncryptedChatSecret Symmetric key, encrypted by the peer's public key.
   * @param peer address of the peer
   */
  function initializeChat(
    bytes calldata yourEncryptedChatSecret,
    bytes calldata peerEncryptedChatSecret,
    address peer
  ) external {
    require(isUserInitialized(msg.sender), 'User is not initialized.');
    require(isUserInitialized(peer), 'Peer is not initialized.');
    chatInitializations[msg.sender][peer] = yourEncryptedChatSecret;
    chatInitializations[peer][msg.sender] = peerEncryptedChatSecret;
    emit ChatInitialized(msg.sender, peer);
  }

  /**
   * @notice Changes the entry fee.
   * @param _entryFee new entry fee
   */
  function setEntryFee(uint256 _entryFee) external onlyOwner {
    entryFee = _entryFee;
    emit EntryFeeChanged(_entryFee);
  }

  /**
   * @notice Transfers the balance of the contract to the owner.
   */
  function withdraw() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }

  receive() external payable {}

  fallback() external payable {}
}
