// SPDX-License-Identifier: CC BY 4.0
pragma solidity ^0.8.12;
/**
* @title Peer Review contract
* @author Nassim Dehouche
*/
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
contract PeerReview {
    // Address of the contract owner
    address owner;
    // Address of the ERC-1155 contract used to vet respondents
    address tokenContract;
    // Number of proposers
    uint numProposers;
     // Number of HIPS
    uint numHIPs;    
    // Array of proposer addresses
    address[] proposers;
    // Fee for submission of a manuscript
    uint public fee; 

    // Constructor that sets the owner address to the msg.sender
    constructor() {
    owner = msg.sender;   
    }

    /**
    * @dev Initializes the contract with the ERC-721 contract address and fees
    * @param _tokenContract is the address of the ERC-721 contract to vet respondents
    * @param _fee is the submission fee
    * We assume one address, one NFT, one response. 
    */
    function initialize (address _tokenContract, uint _fee )
    public {
        // Only the owner can initialize the contract
        require(msg.sender == owner);
        // Set the ERC-721 contract address
        tokenContract = _tokenContract;
        // Set the fees
        fee = _fee;
    }


    // The HIP structure
    struct HIP { 
        // Creation date
        uint creationDate;
        // Duration
        uint duration;
        // Number of responses
        uint numResponses;
        // Hash of PDF file
        bytes32 pdfHash;
        // Hash of request
        bytes32 requestHash;
        // Medical specialties
        // Binary representation of one or several IDs from 0 to 22
        uint32 specialties;
    }

    // Mapping proposers with an array of their proposed HIPs
    mapping(address => HIP[]) public HIPs; 

    // Mapping unique indices with corresponding HIPs
    mapping(uint => HIP) public HIPIndex; 

    // The Response struct for the content of the response.
    struct Response{ 
        // Address of the respondent
        address respondent;
        // Classification
        uint response;
        // Hash of the response argumentation
        bytes32 responseHash;
    }

    // The Response reference struct for payment.
    struct ResponseRef {
    // Address of the proposer
    address proposer;
    // Index of the HIP
    uint index;
    // Withdrawal status
    bool paid;
    }

    // Responses. The first key is the proposer address
    mapping(address => mapping(uint => Response[])) internal responses;

    // The Response boolean. The first key is the respondent address
    mapping(address => mapping(address => mapping (uint =>bool))) public responded;

    // The Response reference for payment. Mapping respondent with the HIPs they responded to.
    mapping(address => ResponseRef[]) public responseRefs;

    // Modifier to check if the user has paid the right fee for the HIP type
    modifier onlyIfPaidEnough() {
        require(msg.value==fee, "User did not pay the right fee.");
        _;
    }
    
    // Helper function that returns the i-th bit of the binary representation n
    function getBit(uint32 n, uint8 i) public pure returns (bool){
    return (n& (1<<i)) !=0; 
    }

    // Modifier to check if the user holds the required NFT
    modifier onlyIfHoldsNFT(address _proposer, uint _id, uint8 _specialty) {
        require(IERC1155Upgradeable(tokenContract).balanceOf(msg.sender, _specialty) > 0 
        && getBit(HIPs[_proposer][_id].specialties, _specialty)==true
        , "User does not hold the right NFT.");
        _;
    } 

    // Modifier to check if the user has already responded to this HIP
    modifier onlyIfHasNotResponded(address _proposer, uint _id) {
        require(responded[msg.sender][_proposer][_id]==false, "User has already responded.");
        _;
    } 

    // Modifier to check if the HIP is still open for responses
    modifier onlyIfStillOpen(address _proposer, uint _id) {
        require(block.timestamp<=HIPs[_proposer][_id].creationDate+HIPs[_proposer][_id].duration, "This HIP is no longer open for responses.");
        _;
    } 

    
    
    /**
    * @dev Submits a HIP
    * @param _duration is the duration of the HIP
    * @param _index is the unique index of the HIP among all HIPs
    * @return _id is the index of the HIP in the proposer's HIP array
    */
  
    function submitHIP(uint _duration, bytes32 _pdfHash, bytes32 _requestHash, uint32 _specialties, uint _index) 
    public 
    payable
    onlyIfPaidEnough()
    returns(uint _id){
        // Set the index of the HIP in the proposer's HIP array
        _id= HIPs[msg.sender].length;
        // If this is the proposer's first HIP, increment the number of proposers and add the proposer's address to the proposers array
        if (_id==0){
            numProposers++;
            proposers.push(msg.sender);    
        }
        // Add the HIP to the proposer's HIP array
        HIPs[msg.sender].push();
        // Set the HIP's properties
        HIPs[msg.sender][_id].creationDate = block.timestamp;
        HIPs[msg.sender][_id].duration = _duration;
        HIPs[msg.sender][_id].pdfHash = _pdfHash;
        HIPs[msg.sender][_id].requestHash = _requestHash;
        HIPs[msg.sender][_id].specialties = _specialties;
        HIPIndex[_index]=HIPs[msg.sender][_id];
        numHIPs++;
        return _id;
    }

  /**
* @dev Submits a response to a HIP
* @param _proposer is the address of the proposer of the HIP
* @param _specialty is the specialty of the respondent
* @param _id is the index of the HIP among the proposer's
* @param _responseValue is the submitted response value
* @param _responseHash is the submitted response hash
*/
function submitResponse(address _proposer, uint8 _specialty, uint _id, uint _responseValue, bytes32 _responseHash) 
public 
onlyIfHoldsNFT(_proposer, _id, _specialty)
onlyIfHasNotResponded(_proposer, _id)
onlyIfStillOpen(_proposer, _id)
returns(uint _number)
{
    // Check if the response is valid
    if (_responseValue > 3) { revert("Invalid response"); }
    // Set the index of the response in the proposer's response array
    _number = responses[_proposer][_id].length + 1;
    // Increment the number of responses for the HIP
    HIPs[_proposer][_id].numResponses = _number;
    // Add the response to the proposer's response array
    responses[_proposer][_id].push();
    // Set the respondent's address
    responses[_proposer][_id][_number - 1].respondent = msg.sender;
    // Set the response
    responses[_proposer][_id][_number - 1].response = _responseValue;
    responses[_proposer][_id][_number - 1].responseHash = _responseHash;
    // Create a ResponseRef struct for payment
    ResponseRef memory r;
    r.proposer = _proposer;
    r.index = _id;
    // Add the ResponseRef struct to the respondent's responseRefs array
    responseRefs[msg.sender].push(r);
    // Set the respondent's responded boolean for this HIP to true
    responded[msg.sender][_proposer][_id] = true;
    return _number;
}


  /**
 * @dev Withdraws payment for a particular response using the response index
 * @param _responseIndex is the index of the response in the respondent's responseRefs array
 */
function withdrawPayment(uint _responseIndex) public {
    require(_responseIndex < responseRefs[msg.sender].length, "Invalid response index");

    ResponseRef storage ref = responseRefs[msg.sender][_responseIndex];
    require(ref.paid == false, "Payment already withdrawn");

    address _proposer = ref.proposer;
    uint _id = ref.index;

    require(block.timestamp > HIPs[_proposer][_id].creationDate + HIPs[_proposer][_id].duration, "HIP still open for responses");

    uint _payment = fee / HIPs[_proposer][_id].numResponses;
    ref.paid = true;

    (bool sent, ) = msg.sender.call{value: _payment}("");
    require(sent, "Failed to send Ether");
}


    /**
    * @dev Returns the total number of proposers
    */
    function getNumProposers() public view returns(uint _numProposers){
        return numProposers;
    }

    /**
    * @dev Returns the total number of HIPs
    */
    function getNumHIPs() public view returns(uint){
        return numHIPs;
    }

    /**
    * @dev Returns the i-th proposer for indexing
    */
    function getProposer(uint i) public view returns(address _proposer){
        return proposers[i];
    }  

    /**
    * @dev Returns the total number of HIPs of proposer for indexing
    */
    function getHIPCount(address _proposer) public view returns(uint _count){
     return HIPs[_proposer].length;
    }

    /**
    * @dev Returns a particular response to a HIP
    */
    function getResponse(address _proposer, uint _indexHIP, uint _indexResponse) public view returns(uint response, bytes32 responseHash){
        return (responses[_proposer][_indexHIP][_indexResponse].response, responses[_proposer][_indexHIP][_indexResponse].responseHash);
    }
    
    /**
    * @dev Returns the balance of msg.sender
    */
    function getBalance() public view returns(uint _balance){
        uint _id;
        address _proposer;
        for (uint i=0;i<responseRefs[msg.sender].length;){
        _proposer=responseRefs[msg.sender][i].proposer;
        _id=responseRefs[msg.sender][i].index; 
        if (_proposer!=address(0) && block.timestamp>HIPs[_proposer][_id].creationDate+HIPs[_proposer][_id].duration){    
            _balance+=fee/HIPs[_proposer][_id].numResponses;
            }
            unchecked{i++;}
        }
        return _balance;
    }
    }
