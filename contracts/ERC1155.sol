// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract AwesomeGame is ERC1155 {
    uint256 public constant Allergy = 0;
    uint256 public constant Anesthesiology = 1;
    uint256 public constant Colon = 2;
    uint256 public constant Dermatology = 3;
    uint256 public constant Emergency = 4;

    constructor() ERC1155("https://meddao.xyz/medcred.json") {
        _mint(msg.sender, Allergy, 10, "");
        _mint(msg.sender, Anesthesiology, 10, "");
        _mint(msg.sender, Colon, 10, "");
        _mint(msg.sender, Dermatology, 10, "");
        _mint(msg.sender, Emergency, 10, "");
    }
}
