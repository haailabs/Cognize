//SPDX-License-Identifier: CC-BY-NC-SA-4.0
pragma solidity ^0.8.12;
/**
* @title SciDex Peer Review contract
* @author Nassim Dehouche
*/
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
contract SciDex {
    // Address of the contract owner
    address owner;
    // Address of the ERC-1155 contract used to qualify reviewers
    address tokenContract;
    // Number of proposers
    uint numProposers;
     // Number of HIPS
    uint numHIPs;    
    // Array of proposer addresses
    address[] proposers;
   

    // Constructor that sets the owner address to the msg.sender
    constructor() {
    owner = msg.sender;   
    }

    /**
    * @dev Initializes the contract 
    * @param _tokenContract is the address of the ERC-1155 contract to qualify reviewers
    * One review per manuscript per reviewer 
    */
    function initialize (address _tokenContract )
    public {
        // Only the owner can initialize the contract
        require(msg.sender == owner);
        // Set the ERC-721 contract address
        tokenContract = _tokenContract;

    }


    // The Human Intelligence Primitive structure, i.e. a request for review
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
        // Manuscript Specialties
        // Binary representation of one or several IDs from 0 to 22
        //Change this number if you have more or fewer specialties
        uint32 specialties;
         // Bounty paid by proposer
        uint fee; 
        // Double indexing the proposer
        address proposer;

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
    mapping(uint => Response[]) internal responses;

    // The Response boolean. The first key is the respondent address
    mapping(address => mapping(uint =>bool)) public responded;

    // The Response reference for payment. Mapping respondent with the HIPs they responded to.
    mapping(address => ResponseRef[]) public responseRefs;

    // Modifier to check if the user has paid the right fee for the HIP type
    modifier onlyIfPaidEnough(uint _fee) {
        require(msg.value==_fee, "User did not pay the right fee.");
        _;
    }
    
    // Helper function that returns the i-th bit of the binary representation n
    function getBit(uint32 n, uint8 i) public pure returns (bool){
    return (n& (1<<i)) !=0; 
    }

    // Modifier to check if the user holds the required NFT
    modifier onlyIfHoldsNFT(uint _id, uint8 _specialty) {
        require(IERC1155Upgradeable(tokenContract).balanceOf(msg.sender, _specialty) > 0 
        && getBit(HIPIndex[_id].specialties, _specialty)==true
        , "User does not hold the right NFT.");
        _;
    } 

    // Modifier to check if the user has already responded to this HIP
    modifier onlyIfHasNotResponded(uint _id) {
        require(responded[msg.sender][_id]==false, "User has already responded.");
        _;
    } 

    // Modifier to check if the HIP is still open for responses
    modifier onlyIfStillOpen(uint _id) {
        require(block.timestamp<=HIPIndex[_id].creationDate+HIPIndex[_id].duration, "This HIP is no longer open for responses.");
        _;
    } 

    // Modifier to check if the HIP is closed for responses
    modifier onlyIfClosed(uint _id) {
    require(block.timestamp > HIPIndex[_id].creationDate + HIPIndex[_id].duration, "This HIP is still open for responses.");
    _;
    }

    // Modifier to check if the HIP has no responses
    modifier onlyIfNoResponses(uint _id) {
    require(HIPIndex[_id].numResponses == 0, "This HIP has already received responses.");
    _;
    }

    /**
    * @dev Allows the creator of a HIP to withdraw their fee
    * @param _id is the index of the HIP in the HIP index
    */
    function withdrawFee(uint _id) 
    public
    onlyIfClosed(_id)
    onlyIfNoResponses(_id)
    {
    // Check if the caller is the creator of the HIP
    require(msg.sender == HIPIndex[_id].proposer, "Only the creator of the HIP can withdraw the fee.");

    // Transfer the fee to the creator of the HIP
    uint fee = HIPIndex[_id].fee;
    HIPIndex[_id].fee = 0;
    (bool success, ) = msg.sender.call{value: fee}("");
    require(success, "Fee withdrawal failed.");
    }

    
    
    /**
    * @dev Submits a HIP
    * @param _duration is the duration of the HIP
    * @param _index is the unique index of the HIP among all HIPs
    * @return _id is the index of the HIP in the proposer's HIP array
    */
  
    function submitHIP(uint _duration, bytes32 _pdfHash, bytes32 _requestHash, uint32 _specialties, uint _fee, uint _index) 
    public 
    payable
    onlyIfPaidEnough(_fee)
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
        HIPs[msg.sender][_id].proposer = msg.sender;
        HIPs[msg.sender][_id].fee = _fee;
        HIPIndex[_index]=HIPs[msg.sender][_id];
        numHIPs++;
        return _id;
    }

  /**
* @dev Submits a response to a HIP
* @param _specialty is the specialty of the respondent
* @param _id is the index of the HIP among all HIPs
* @param _responseValue is the submitted response value
* @param _responseHash is the submitted response hash
*/
function submitResponse(uint8 _specialty, uint _id, uint _responseValue, bytes32 _responseHash) 
public 
onlyIfHoldsNFT(_id, _specialty)
onlyIfHasNotResponded(_id)
onlyIfStillOpen(_id)
returns(uint _number)
{
    // Check if the response is valid
    if (_responseValue > 3) { revert("Invalid response"); }
    // Set the index of the response in the proposer's response array
    _number = responses[_id].length + 1;
    // Increment the number of responses for the HIP
    HIPIndex[_id].numResponses = _number;
    // Add the response to the proposer's response array
    responses[_id].push();
    // Set the respondent's address
    responses[_id][_number - 1].respondent = msg.sender;
    // Set the response
    responses[_id][_number - 1].response = _responseValue;
    responses[_id][_number - 1].responseHash = _responseHash;
    // Create a ResponseRef struct for payment
    ResponseRef memory r;
    r.proposer = HIPIndex[_id].proposer;
    r.index = _id;
    // Add the ResponseRef struct to the respondent's responseRefs array
    responseRefs[msg.sender].push(r);
    // Set the respondent's responded boolean for this HIP to true
    responded[msg.sender][_id] = true;
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

    uint _payment = HIPs[_proposer][_id].fee / HIPs[_proposer][_id].numResponses;
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
    function getResponse(uint _indexHIP, uint _indexResponse) public view returns(uint response, bytes32 responseHash){
        return (responses[_indexHIP][_indexResponse].response, responses[_indexHIP][_indexResponse].responseHash);
    }
    
    }
    
