// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TranscriptIssuance.sol";

contract TranscriptVerification {
    TranscriptIssuance public issuanceContract;

    constructor(address _issuanceContract) {
        issuanceContract = TranscriptIssuance(_issuanceContract);
    }

    function verifyTranscript(bytes32 studentIDHash)
        public
        view
        returns (
            string memory studentName,
            string memory course,
            string memory grade,
            string memory graduationDate,
            string memory institution
        )
    {
        TranscriptIssuance.Transcript memory transcript = issuanceContract.getTranscript(studentIDHash);
        return (
            transcript.studentName,
            transcript.course,
            transcript.grade,
            transcript.graduationDate,
            transcript.institution
        );
    }
}
