// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TranscriptIssuance {
    address public admin;

    struct Transcript {
        string studentName;
        string course;
        string grade;
        string graduationDate;
        string institution;
        bool exists;
    }

    mapping(bytes32 => Transcript) private transcripts;
    mapping(address => bool) public authorizedUniversities;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyUniversity() {
        require(authorizedUniversities[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function authorizeUniversity(address university) public onlyAdmin {
        authorizedUniversities[university] = true;
    }

    function issueTranscript(
        bytes32 studentIDHash,
        string memory studentName,
        string memory course,
        string memory grade,
        string memory graduationDate,
        string memory institution
    ) public onlyUniversity {
        transcripts[studentIDHash] = Transcript(
            studentName,
            course,
            grade,
            graduationDate,
            institution,
            true
        );
    }

    function getTranscript(bytes32 studentIDHash) public view returns (Transcript memory) {
        require(transcripts[studentIDHash].exists, "Transcript not found");
        return transcripts[studentIDHash];
    }
}
