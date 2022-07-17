// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
if this file is not seen by VsCode, you can add the following to your .vscode/settings.json:
  "solidity.defaultCompiler": "localFile",
  "solidity.packageDefaultDependenciesDirectory": "./contracts/node_modules"
*/
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
  constructor(
    uint256 initialSupply,
    string memory name,
    string memory symbol
  ) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply);
  }
}
