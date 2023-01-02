// SPDX-License-Identifier: CC BY 4.0
pragma solidity ^0.8.12;
/**
* @title Action contract
* @author Nassim Dehouche
*/
contract Action {
  address public actionContract;
  bytes public actionCall;
  /**
  @param _actionContract is the address of the action contract for
  an action to be enacted.
  @param _actionCall is the abi encoding of a function call in the 
  action contract, with arguments.
  */
  constructor(
    address _actionContract,
    bytes memory _actionCall
  ) {
    actionContract = _actionContract;
    actionCall = _actionCall;
  }

  /// @dev Function to enact an action resulting from a Human Intelligence Primitive.
  function enact() external virtual {
    (bool success, ) = actionContract.call(actionCall);
    require(success, "Failed to enact proposal.");
  }
}
