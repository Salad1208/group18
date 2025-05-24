// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TranscriptDefs.sol"; // Assuming TranscriptDefs.sol is in the same directory

/**
 * @title ITranscriptIssuance
 * @dev Interface for interacting with the TranscriptIssuance contract.
 * Includes the updated Transcript struct definition implicitly via TranscriptDefs.
 */
interface ITranscriptIssuanceV2 { // Renamed to avoid conflict if old interface exists
    function getTranscriptById(uint256 _transcriptId) external view returns (TranscriptDefs.Transcript memory);
    function getTranscriptIdsForStudent(address _studentAddress) external view returns (uint256[] memory);
    function doesTranscriptExist(uint256 _transcriptId) external view returns (bool);
    // Functions for status change are called directly on IssuanceContract, not through this verification interface typically
}

/**
 * @title TranscriptVerification
 * @dev Allows for the verification and retrieval of academic transcript data.
 */
contract TranscriptVerification {
    // Using TranscriptDefs for TranscriptDefs.Transcript struct
    ITranscriptIssuanceV2 public immutable issuanceContract;

    constructor(address _issuanceContractAddress) {
        require(_issuanceContractAddress != address(0), "Verification: Issuance contract address cannot be zero.");
        issuanceContract = ITranscriptIssuanceV2(_issuanceContractAddress);
    }

    /**
     * @dev Retrieves the details of a specific transcript by its ID, including its status.
     */
    function viewTranscript(uint256 _transcriptId) public view returns (TranscriptDefs.Transcript memory) {
        return issuanceContract.getTranscriptById(_transcriptId);
    }

    /**
     * @dev Allows the calling student (msg.sender) to retrieve IDs of all transcripts issued to their address.
     */
    function getMyTranscriptIds() public view returns (uint256[] memory) {
        return issuanceContract.getTranscriptIdsForStudent(msg.sender);
    }

    /**
     * @dev Retrieves transcript IDs for any given student address.
     */
    function getTranscriptIdsForGivenStudent(address _studentAddress) public view returns (uint256[] memory) {
        return issuanceContract.getTranscriptIdsForStudent(_studentAddress);
    }
    
    function checkTranscriptExistence(uint256 _transcriptId) public view returns (bool) {
        return issuanceContract.doesTranscriptExist(_transcriptId);
    }
}
