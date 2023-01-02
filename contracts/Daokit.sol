// SPDX-License-Identifier: CC BY 4.0
pragma solidity ^0.8.12;
/**
* @title DAOkit contract
* @author Nassim Dehouche
*/
import "@openzeppelin/contracts/interfaces/IERC721.sol";
contract DAOkit {
address owner;
address tokenContract ;
// HIP types
enum types{ CHOICE, RANKING, SORTING, CLASSIFICATION}
uint numProposers;  
address[] proposers;
uint[] fees; 

  constructor(){
    owner = msg.sender;   
  }

  /**
  @param _tokenContract is the address of the ERC-721 contract to vet
  respondents. We assume one address, one NFT, one response.  
  Use 0xF5b2B5b042B253323cB96121ABad487C95d287ea on Kovan
  */
function initialize (address _tokenContract, uint[] calldata _fees )
public{
    require(msg.sender == owner);
    tokenContract = _tokenContract;
    fees=_fees;

}


// The HIP structure
struct HIP{ 
  types HIPType;
  uint numOptions;
  uint numClasses;
  uint creationDate;
  uint duration;
  uint numResponses;
  }

// Mapping proposers with an array of their proposed HIPs
mapping(address => HIP[]) public HIPs; 

// The Response struct for the content of the response.
struct Response{ 
  address respondent;
  uint[] response;
  }


// The Response reference struct for payment.
struct ResponseRef{ 
  address proposer;
  uint index;
  }

// Responses. The first key is the proposer address
mapping(address => mapping(uint => Response[])) internal responses;

// The Response boolean. The first key is the respondent address
mapping(address => mapping(address => mapping (uint =>bool))) public responded;

// The Response reference for payment. Mapping respondent with the HIPs they responded to.
mapping(address => ResponseRef[]) public responseRefs;

modifier onlyIfPaidEnough(types _HIPType) {
    require(msg.value==fees[uint(_HIPType)], "User did not pay the right fee for this HIP type.");
    _;
}

modifier onlyIfHoldsNFT(address _voter) {
    require(IERC721(tokenContract).balanceOf(_voter) > 0, "User does not hold the right NFT.");
    _;
} 

modifier onlyIfHasNotResponded(address _proposer, uint _id) {
    require(responded[msg.sender][_proposer][_id]==false, "User has already responded.");
    _;
} 

modifier onlyIfStillOpen(address _proposer, uint _id) {
    require(block.timestamp<=HIPs[_proposer][_id].creationDate+HIPs[_proposer][_id].duration, "This HIP is no longer open for responses.");
    _;
} 

  




function submitHIP
(  
  types _HIPType,
  uint _numOptions,
  uint _numClasses,
  uint _duration) 
public 
payable
onlyIfPaidEnough(_HIPType)

returns(uint _id)
{
bool condition;
if (_numOptions>=2){
   condition=true;
   if (_HIPType==types.SORTING || _HIPType==types.CLASSIFICATION){
    condition=_numClasses>=2;

    }
}
    
if(!condition) { revert('Trivial or invalid HIP'); }

_id= HIPs[msg.sender].length;
if (_id==0){
numProposers++;
proposers.push(msg.sender);    
}
HIPs[msg.sender].push();
HIPs[msg.sender][_id].HIPType = _HIPType;
HIPs[msg.sender][_id].numOptions = _numOptions;
HIPs[msg.sender][_id].numClasses = _numClasses;
HIPs[msg.sender][_id].creationDate = block.timestamp;
HIPs[msg.sender][_id].duration = _duration;
return _id;
}

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

function uniqueDigits (uint[] calldata _response, uint _number)
internal 
pure

returns(bool _unique)
{
bool[] memory visited; 
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



function submitResponse
(  
  address _proposer,
  uint _id,
  uint[] calldata _response) 
public 
onlyIfHoldsNFT(msg.sender)
onlyIfHasNotResponded(_proposer, _id)
onlyIfStillOpen(_proposer, _id)
returns(uint _number)
{
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
   
_number=responses[_proposer][_id].length+1;
HIPs[_proposer][_id].numResponses=_number;
responses[_proposer][_id].push();
responses[_proposer][_id][_number-1].respondent=msg.sender;
 for(uint i = 0; i < _response.length; ) {
responses[_proposer][_id][_number-1].response.push(_response[i]);
unchecked{i++;}
}
ResponseRef memory r;
        r.proposer = _proposer;
        r.index = _id;
        
responseRefs[msg.sender].push(r);
responded[msg.sender][_proposer][_id]=true;
return _number;
}

// Respondents payment function 
    function requestPayment() public 
    {
    uint _balance;
    uint _id;
    address _proposer;
    for (uint i=0;i<responseRefs[msg.sender].length;){
    _proposer=responseRefs[msg.sender][i].proposer;
    _id=responseRefs[msg.sender][i].index; 
    if (_proposer!=address(0) && block.timestamp>HIPs[_proposer][_id].creationDate+HIPs[_proposer][_id].duration)
    {
    responseRefs[msg.sender][i].proposer=address(0);        
    _balance+=fees[uint8(HIPs[_proposer][_id].HIPType)]/HIPs[_proposer][_id].numResponses;
    unchecked{i++;}
    }
    }
      (bool sent, ) = msg.sender.call{value: _balance}("");
        require(sent, "Failed to send Ether");
   
   }

    



 function getNumProposers() public view returns(uint _numProposers){
     return numProposers;
   }

 function getFee(uint i) public view returns(uint _fee){
     return fees[i];
   }
function getProposer(uint i) public view returns(address _proposer){
     return proposers[i];
   }  

function getHIPCount(address _proposer) public view returns(uint _count){
     return HIPs[_proposer].length;
   }

function getResponse(address _proposer, uint _indexHIP, uint _indexResponse) public view returns(uint[] memory _response){
     return responses[_proposer][_indexHIP][_indexResponse].response;
   }

function getBalance() public view returns(uint _balance){
   
    uint _id;
    address _proposer;
    for (uint i=0;i<responseRefs[msg.sender].length;){
    _proposer=responseRefs[msg.sender][i].proposer;
    _id=responseRefs[msg.sender][i].index; 
    if (_proposer!=address(0) && block.timestamp>HIPs[_proposer][_id].creationDate+HIPs[_proposer][_id].duration)
    {    
    _balance+=fees[uint8(HIPs[_proposer][_id].HIPType)]/HIPs[_proposer][_id].numResponses;
    unchecked{i++;}
    }
    }
    return _balance;
   }

}
