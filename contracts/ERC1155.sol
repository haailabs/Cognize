// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
contract Qualifications is ERC1155 {
// Example Data Science specialties
uint256 public constant DataAnalysis = 2;
uint256 public constant DeepLearning = 3;
uint256 public constant ProbabilityTheory = 4;
uint256 public constant ArtificialIntelligence = 5;
uint256 public constant Healthcare = 6;
uint256 public constant DataEngineering = 7;
uint256 public constant BusinessAnalytics = 8;
uint256 public constant SoftwareEngineering = 9;
uint256 public constant BusinessIntelligence = 10;
uint256 public constant DataMining = 11;
uint256 public constant Mathematics = 12;
uint256 public constant NaturalLanguageProcessing = 13;
uint256 public constant Algorithms = 14;
uint256 public constant BigData = 15;
uint256 public constant Cybersecurity = 16;
uint256 public constant Finance = 17;
uint256 public constant Marketing = 18;
uint256 public constant Blockchain = 19;
uint256 public constant DataWarehousing = 20;
uint256 public constant Architecture = 21;
uint256 public constant DataCollection = 22;
uint256 public constant DataVisualization = 23;

// Example medical specialties
/*
uint256 public constant Allergy = 0;
uint256 public constant Anesthesiology = 1;
uint256 public constant Colon = 2;
uint256 public constant Dermatology = 3;
uint256 public constant Emergency = 4;
uint256 public constant Family = 5;
uint256 public constant Internal = 6;
uint256 public constant Genetics = 7;
uint256 public constant Neurological = 8;
uint256 public constant Obstetrics = 9;
uint256 public constant Ophthalmology = 10;
uint256 public constant Orthopaedic = 10;
uint256 public constant Otolaryngology = 12;
uint256 public constant Pathology = 13;
uint256 public constant Pediatrics = 14;
uint256 public constant Physical = 15;
uint256 public constant Plastic = 16;
uint256 public constant Preventive = 17;
uint256 public constant Psychiatry = 18;
uint256 public constant Radiology = 19;
uint256 public constant Surgery = 20;
uint256 public constant Thoracic = 21;
uint256 public constant Urology = 22;
*/

    constructor() ERC1155("https://haai.info") {
        _mint(msg.sender, 0, 10, "");
        _mint(msg.sender, 1, 10, "");
        _mint(msg.sender, 2, 10, "");
        _mint(msg.sender, 3, 10, "");
        _mint(msg.sender, 4, 10, "");
        _mint(msg.sender, 5, 10, "");
        _mint(msg.sender, 6, 10, "");
        _mint(msg.sender, 7, 10, "");
        _mint(msg.sender, 8, 10, "");
        _mint(msg.sender, 9, 10, "");
        _mint(msg.sender, 10, 10, "");
        _mint(msg.sender, 11, 10, "");
        _mint(msg.sender, 12, 10, "");
        _mint(msg.sender, 13, 10, "");
        _mint(msg.sender, 14, 10, "");
        _mint(msg.sender, 15, 10, "");
        _mint(msg.sender, 16, 10, "");
        _mint(msg.sender, 17, 10, "");
        _mint(msg.sender, 18, 10, "");
        _mint(msg.sender, 19, 10, "");
        _mint(msg.sender, 20, 10, "");
        _mint(msg.sender, 21, 10, "");
        _mint(msg.sender, 22, 10, "");
    }
    
    function mint() public {
    uint256[] memory specialtyIndices = new uint256[](23);
    for (uint256 i = 0; i < 23; i++) {
        specialtyIndices[i] = i;
    }
    uint256[] memory amounts = new uint256[](23);
    for (uint256 i = 0; i < 23; i++) {
        amounts[i] = 1;
    }
    _mintBatch(msg.sender, specialtyIndices, amounts, "");
    }
}
