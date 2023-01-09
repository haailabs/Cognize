// SPDX-License-Identifier: CC BY 4.0
pragma solidity ^0.8.12;
/**
* @title DAOkit contract
* @author Nassim Dehouche
*/
import "@openzeppelin/contracts/interfaces/IERC721.sol";
contract DAOkit {
    // Address of the contract owner
    address owner;
    // Address of the ERC-721 contract used to vet respondents
    address tokenContract ;
    // Enum for HIP types
    enum types{ CHOICE, RANKING, SORTING, CLASSIFICATION}
    // Number of proposers
    uint numProposers;  
    // Array of proposer addresses
    address[] proposers;
    // Array of fees for different HIP types
    uint[] fees; 

    // Constructor that sets the owner address to the msg.sender
    constructor() {
    owner = msg.sender;   
    }

    /**
    * @dev Initializes the contract with the ERC-721 contract address and fees
    * @param _tokenContract is the address of the ERC-721 contract to vet respondents
    * @param _fees is the array of fees for different HIP types
    * We assume one address, one NFT, one response. 
    * Use 0xF5b2B5b042B253323cB96121ABad487C95d287ea on Kovan
    */
    function initialize (address _tokenContract, uint[] calldata _fees )
    public {
        // Only the owner can initialize the contract
        require(msg.sender == owner);
        // Set the ERC-721 contract address
        tokenContract = _tokenContract;
        // Set the fees
        fees = _fees;
    }


    // The HIP structure
    struct HIP { 
        // HIP type
        types HIPType;
        // Number of options
        uint numOptions;
        // Number of classes
        uint numClasses;
        // Creation date
        uint creationDate;
        // Duration
        uint duration;
        // Number of responses
        uint numResponses;
    }

    // Mapping proposers with an array of their proposed HIPs
    mapping(address => HIP[]) public HIPs; 

    // The Response struct for the content of the response.
    struct Response{ 
        // Address of the respondent
        address respondent;
        // Array of responses
        uint[] response;
    }

    // The Response reference struct for payment.
    struct ResponseRef{ 
        // Address of the proposer
        address proposer;
        // Index of the HIP
        uint index;
    }

    // Responses. The first key is the proposer address
    mapping(address => mapping(uint => Response[])) internal responses;

    // The Response boolean. The first key is the respondent address
    mapping(address => mapping(address => mapping (uint =>bool))) public responded;

    // The Response reference for payment. Mapping respondent with the HIPs they responded to.
    mapping(address => ResponseRef[]) public responseRefs;

    // Modifier to check if the user has paid the right fee for the HIP type
    modifier onlyIfPaidEnough(types _HIPType) {
        require(msg.value==fees[uint(_HIPType)], "User did not pay the right fee for this HIP type.");
        _;
    }

    // Modifier to check if the user holds the required NFT
    modifier onlyIfHoldsNFT(address _voter) {
        require(IERC721(tokenContract).balanceOf(_voter) > 0, "User does not hold the right NFT.");
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
    * @param _HIPType is the type of HIP
    * @param _numOptions is the number of options in the HIP
    * @param _numClasses is the number of classes in the HIP
    * @param _duration is the duration of the HIP
    * @return _id is the index of the HIP in the proposer's HIP array
    */
  
    function submitHIP(types _HIPType, uint _numOptions, uint _numClasses, uint _duration) 
    public 
    payable
    onlyIfPaidEnough(_HIPType)
    returns(uint _id){
        bool condition;
        // Check if the HIP is trivial or invalid
        if (_numOptions>=2){
        condition=true;
        if (_HIPType==types.SORTING || _HIPType==types.CLASSIFICATION){
        condition=_numClasses>=2;}
        }
    
        if(!condition) { revert('Trivial or invalid HIP'); }
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
        HIPs[msg.sender][_id].HIPType = _HIPType;
        HIPs[msg.sender][_id].numOptions = _numOptions;
        HIPs[msg.sender][_id].numClasses = _numClasses;
        HIPs[msg.sender][_id].creationDate = block.timestamp;
        HIPs[msg.sender][_id].duration = _duration;
        return _id;
    }

    // Helper function to check that submitted digits in a response are valid
    function rightDigits (uint[] calldata _response, uint _number)
    internal 
    pure
    returns(bool _right)
    {
        uint i;
        _right=true;
        while (i<_response.length){
            if (_response[i]>=_number){
            return false;
            } 
    unchecked{i++;}
        }
    return _right;
    }

    // Helper function to check that submitted digits in a response are valid
    function uniqueDigits (uint[] calldata _response, uint _number)
    internal 
    pure
    returns(bool _unique){
        bool[] memory visited=new bool[](_number); 
        uint i;
        _unique=true;
        while (i<_response.length){
            if (_response[i]>=_number || visited[_response[i]]==true){
                return false;
            }
            else{
                visited[_response[i]]=true;
            } 
            unchecked{i++;}
        }
        return _unique;
    }

    /**
    * @dev Submits a response to a HIP
    * @param _proposer is the address of the proposer of the HIP
    * @param _id is the index of the HIP among the proposer's
    * @param _response is the submitted reponse array
    */
    function submitResponse(address _proposer, uint _id, uint[] calldata _response) 
    public 
    onlyIfHoldsNFT(msg.sender)
    onlyIfHasNotResponded(_proposer, _id)
    onlyIfStillOpen(_proposer, _id)
    returns(uint _number)
    {
        // Check if the response is valid
        bool condition;
        if (HIPs[_proposer][_id].HIPType==types.CHOICE){
            condition=_response.length==1 && _response[0]<HIPs[_proposer][_id].numOptions;
        }
        else if (HIPs[_proposer][_id].HIPType==types.RANKING){
            condition=_response.length==HIPs[_proposer][_id].numOptions && uniqueDigits(_response, _response.length);
            }
        else if (HIPs[_proposer][_id].HIPType==types.SORTING || HIPs[_proposer][_id].HIPType==types.CLASSIFICATION){
            condition=_response.length==HIPs[_proposer][_id].numOptions && rightDigits(_response, HIPs[_proposer][_id].numClasses);
            }
        if(!condition) { revert('Invalid response'); }
        // Set the index of the response in the proposer's response array
        _number=responses[_proposer][_id].length+1;
        // Increment the number of responses for the HIP
        HIPs[_proposer][_id].numResponses=_number;
        // Add the response to the proposer's response array
        responses[_proposer][_id].push();
        // Set the respondent's address
        responses[_proposer][_id][_number-1].respondent=msg.sender;
        // Set the response
        for(uint i = 0; i < _response.length; ) {
            responses[_proposer][_id][_number-1].response.push(_response[i]);
            unchecked{i++;}
        }
        // Create a ResponseRef struct for payment
        ResponseRef memory r;
        r.proposer = _proposer;
        r.index = _id;
        // Add the ResponseRef struct to the respondent's responseRefs array
        responseRefs[msg.sender].push(r);
        // Set the respondent's responded boolean for this HIP to true
        responded[msg.sender][_proposer][_id]=true;
        return _number;
    }

    /**
    * @dev Respondents payment request function for a particular HIP
    */
    function requestPayment() public 
    {
        uint _balance;
        uint _id;
        address _proposer;
        for (uint i=0;i<responseRefs[msg.sender].length;){
            _proposer=responseRefs[msg.sender][i].proposer;
            _id=responseRefs[msg.sender][i].index; 
            if (_proposer!=address(0) && block.timestamp>HIPs[_proposer][_id].creationDate+HIPs[_proposer][_id].duration){
        responseRefs[msg.sender][i].proposer=address(0);        
        _balance+=fees[uint8(HIPs[_proposer][_id].HIPType)]/HIPs[_proposer][_id].numResponses;
            }
            unchecked{i++;}
        }
      (bool sent, ) = msg.sender.call{value: _balance}("");
      require(sent, "Failed to send Ether");
   }

    /**
    * @dev Returns the total number of proposers
    */
    function getNumProposers() public view returns(uint _numProposers){
        return numProposers;
    }

    /**
    * @dev Returns the fee for a particular HIP type
    */
    function getFee(uint i) public view returns(uint _fee){
        return fees[i];
    }

    /**
    * @dev Returns the i-th proposer for indexing
    */
    function getProposer(uint i) public view returns(address _proposer){
        return proposers[i];
    }  

    /**
    * @dev Returns the total number of HIPs for indexing
    */
    function getHIPCount(address _proposer) public view returns(uint _count){
     return HIPs[_proposer].length;
    }

    /**
    * @dev Returns a particular response to a HIP
    */
    function getResponse(address _proposer, uint _indexHIP, uint _indexResponse) public view returns(uint[] memory _response){
        return responses[_proposer][_indexHIP][_indexResponse].response;
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
            _balance+=fees[uint8(HIPs[_proposer][_id].HIPType)]/HIPs[_proposer][_id].numResponses;
            }
            unchecked{i++;}
        }
        return _balance;
