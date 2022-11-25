// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// Error codes
uint8 constant ErrUserAlreadyInitialized = 1;
uint8 constant ErrChatNotInitialized = 2;
uint8 constant ErrUserNotInitialized = 3;
uint8 constant ErrPeerNotInitialized = 4; 
uint8 constant ErrIncorrectEntryFee = 5; 
error BlockchattingError(uint8 code);

/// @title Blockchatting: P2P Chatting via Smart Contracts
/// @author Erhan Tezcan (erhant)
/// @dev A chat contract that allows users to send messages via their addresses
contract Chat is Ownable {
  /// @dev See `initializeUser` function
  struct UserInitialization {
    bytes encryptedUserSecret;
    bool publicKeyPrefix;
    bytes32 publicKeyX;
  }

  event MessageSent(address indexed _from, address indexed _to, string _message, uint256 _time);
  event EntryFeeChanged(uint256 amount);
  event UserInitialized(address indexed user);
  event ChatInitialized(address indexed initializer, address indexed peer);

  /// @notice Users must pay this entry fee to start using the application
  uint256 public entryFee = 0.008 ether;

  /// @notice Mapping of user to their initialization object
  mapping(address => UserInitialization) public userInitializations;

  /// @notice A shared secret between two users, encrypted by the public key of first user
  mapping(address => mapping(address => bytes)) public chatInitializations;

  /// @notice Checks if a user has been initialized
  /// @param user address
  function isUserInitialized(address user) public view returns (bool) {
    return
      !(userInitializations[user].encryptedUserSecret.length == 0 &&
        userInitializations[user].publicKeyX == bytes32(0));
  }

  /// @notice Checks if two users has initialized their chat
  /// @param initializer address
  /// @param peer address
  function isChatInitialized(address initializer, address peer) public view returns (bool) {
    return !(chatInitializations[initializer][peer].length == 0 && chatInitializations[peer][initializer].length == 0);
  }

  /// @notice Emits a MessageEvent, assuming chat is initialized
  /// @param ciphertext A message encrypted by the secret chatting key
  /// @param to recipient address
  function sendMessage(
    string calldata ciphertext,
    address to,
    uint256 time
  ) external {
    if (!isChatInitialized(msg.sender, to)) {
      revert BlockchattingError(ErrChatNotInitialized);
    } 
    emit MessageSent(msg.sender, to, ciphertext, time);
  }

  /// @notice Initializes a user, which allows two things:
  /// - user will be able to generate their own key on later logins, by retrieving the encrypted key-gen input and decrypt with their MetaMask
  /// - other users will be able to encrypt messages using this users public key
  /// @param encryptedUserSecret user secret to generate key-pair for the chatting application. it is encrypted by the MetaMask public key
  /// @param publicKeyPrefix prefix of the compressed key stored as a boolean (0x02: true, 0x03: false)
  /// @param publicKeyX 32-byte X-coordinate of the compressed key
  function initializeUser(
    bytes calldata encryptedUserSecret,
    bool publicKeyPrefix,
    bytes32 publicKeyX
  ) external payable {
    console.log("Length:", encryptedUserSecret.length);
    if (isUserInitialized(msg.sender)) {
      revert BlockchattingError(ErrUserAlreadyInitialized);
    }
    if (msg.value != entryFee) {
      revert BlockchattingError(ErrIncorrectEntryFee);
    } 
    userInitializations[msg.sender] = UserInitialization(encryptedUserSecret, publicKeyPrefix, publicKeyX);
    emit UserInitialized(msg.sender);
  }

  /// @notice Initializes a chatting session between two users: msg.sender and a given peer.
  /// A symmetric key is encrypted with both public keys once and stored for each
  /// @dev Both users must be initialized
  /// @param yourEncryptedChatSecret Symmetric key, encrypted by the msg.sender's public key
  /// @param peerEncryptedChatSecret Symmetric key, encrypted by the peer's public key
  /// @param peer address of the peer
  function initializeChat(
    bytes calldata yourEncryptedChatSecret,
    bytes calldata peerEncryptedChatSecret,
    address peer
  ) external {
    if (!isUserInitialized(msg.sender)) {
      revert BlockchattingError(ErrUserNotInitialized);
    }
    if (!isUserInitialized(peer)) {
      revert BlockchattingError(ErrPeerNotInitialized);
    } 
    chatInitializations[msg.sender][peer] = yourEncryptedChatSecret;
    chatInitializations[peer][msg.sender] = peerEncryptedChatSecret;
    emit ChatInitialized(msg.sender, peer);
  }

  /// @notice Changes the entry fee
  /// @param _entryFee new entry fee
  function setEntryFee(uint256 _entryFee) external onlyOwner {
    entryFee = _entryFee;
    emit EntryFeeChanged(_entryFee);
  }

  /// @notice Transfers the balance of the contract to the owner
  function withdraw() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }

  receive() external payable {}
  fallback() external payable {}
}
