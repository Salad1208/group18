// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./TranscriptDefs.sol"; // Assuming TranscriptDefs.sol is in the same directory

/**
 * @title TranscriptIssuance
 * @dev Manages the issuance and status updates of academic transcripts.
 */
contract TranscriptIssuance is AccessControl {
    using Counters for Counters.Counter;
    // No 'using TranscriptDefs for...' needed here as we directly use TranscriptDefs.StructName

    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    Counters.Counter private _transcriptIds;

    mapping(uint256 => TranscriptDefs.Transcript) private _transcripts;
    mapping(address => uint256[]) private _studentTranscripts;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantInstitutionRole(address _institutionAccount) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(INSTITUTION_ROLE, _institutionAccount);
    }

    function revokeInstitutionRole(address _institutionAccount) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(INSTITUTION_ROLE, _institutionAccount);
    }

    function issueTranscriptManual(
        string memory _studentName,
        address _studentAddress,
        string memory _studentId,
        string memory _issuingInstitution,
        string memory _programName,
        uint256 _graduationDate,
        string[] memory _courseNames,
        string[] memory _courseGrades
    ) public virtual onlyRole(INSTITUTION_ROLE) {
        require(_courseNames.length == _courseGrades.length, "Issuance: Course names and grades arrays must have the same length.");
        
        TranscriptDefs.Course[] memory courses = new TranscriptDefs.Course[](_courseNames.length);
        for (uint i = 0; i < _courseNames.length; i++) {
            courses[i] = TranscriptDefs.Course(_courseNames[i], _courseGrades[i]);
        }

        _issueTranscriptInternal(
            _studentName,
            _studentAddress,
            _studentId,
            _issuingInstitution,
            _programName,
            _graduationDate,
            courses
        );
    }

    function _issueTranscriptInternal(
        string memory _studentName,
        address _studentAddress,
        string memory _studentId,
        string memory _issuingInstitution,
        string memory _programName,
        uint256 _graduationDate,
        TranscriptDefs.Course[] memory _courses
    ) internal {
        require(bytes(_studentName).length > 0, "Issuance: Student name is required.");
        require(_studentAddress != address(0), "Issuance: Student Ethereum address is required.");
        // ... other requires from previous version

        _transcriptIds.increment();
        uint256 newTranscriptId = _transcriptIds.current();

        TranscriptDefs.Transcript storage newTranscript = _transcripts[newTranscriptId];
        newTranscript.id = newTranscriptId;
        newTranscript.studentAddress = _studentAddress;
        newTranscript.studentName = _studentName;
        newTranscript.studentId = _studentId;
        newTranscript.issuingInstitution = _issuingInstitution;
        newTranscript.programName = _programName;
        newTranscript.graduationDate = _graduationDate;
        newTranscript.issuerAddress = msg.sender;
        newTranscript.issueTimestamp = block.timestamp;
        newTranscript.status = TranscriptDefs.Status.Pending; // Initial status

        for (uint i = 0; i < _courses.length; i++) {
            newTranscript.courses.push(_courses[i]);
        }

        _studentTranscripts[_studentAddress].push(newTranscriptId);

        emit TranscriptDefs.TranscriptIssued(newTranscriptId, _studentAddress, _studentId, _issuingInstitution, msg.sender, newTranscript.status);
    }

    /**
     * @dev Allows a student to accept their transcript.
     * @param _transcriptId The ID of the transcript to accept.
     */
    function acceptTranscript(uint256 _transcriptId) public virtual {
        TranscriptDefs.Transcript storage transcript = _transcripts[_transcriptId];
        require(doesTranscriptExist(_transcriptId), "Issuance: Transcript ID not found.");
        require(transcript.studentAddress == msg.sender, "Issuance: Only the student can accept this transcript.");
        require(transcript.status == TranscriptDefs.Status.Pending, "Issuance: Transcript must be pending to be accepted.");

        transcript.status = TranscriptDefs.Status.AcceptedByStudent;
        emit TranscriptDefs.TranscriptStatusChanged(_transcriptId, transcript.studentAddress, msg.sender, transcript.status, "Student accepted transcript.");
    }

    /**
     * @dev Allows a student to reject their transcript.
     * @param _transcriptId The ID of the transcript to reject.
     * @param _reason The reason for rejection.
     */
    function rejectTranscript(uint256 _transcriptId, string memory _reason) public virtual {
        TranscriptDefs.Transcript storage transcript = _transcripts[_transcriptId];
        require(doesTranscriptExist(_transcriptId), "Issuance: Transcript ID not found.");
        require(transcript.studentAddress == msg.sender, "Issuance: Only the student can reject this transcript.");
        require(transcript.status == TranscriptDefs.Status.Pending, "Issuance: Transcript must be pending to be rejected.");

        transcript.status = TranscriptDefs.Status.RejectedByStudent;
        emit TranscriptDefs.TranscriptStatusChanged(_transcriptId, transcript.studentAddress, msg.sender, transcript.status, _reason);
    }

    /**
     * @dev Allows the issuing institution to revoke a transcript.
     * @param _transcriptId The ID of the transcript to revoke.
     * @param _reason The reason for revocation.
     */
    function revokeTranscriptByInstitution(uint256 _transcriptId, string memory _reason) public virtual onlyRole(INSTITUTION_ROLE) {
        TranscriptDefs.Transcript storage transcript = _transcripts[_transcriptId];
        require(doesTranscriptExist(_transcriptId), "Issuance: Transcript ID not found.");
        // Ensure the caller is the original issuer or an admin of that institution (more complex role mgmt needed for latter)
        require(transcript.issuerAddress == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Issuance: Only original issuer or admin can revoke.");
        // Prevent revoking an already rejected transcript if that's desired logic
        // require(transcript.status != TranscriptDefs.Status.RejectedByStudent, "Issuance: Cannot revoke an already rejected transcript.");

        transcript.status = TranscriptDefs.Status.RevokedByInstitution;
        emit TranscriptDefs.TranscriptStatusChanged(_transcriptId, transcript.studentAddress, msg.sender, transcript.status, _reason);
    }


    function getTranscriptById(uint256 _transcriptId) public view virtual returns (TranscriptDefs.Transcript memory) {
        require(doesTranscriptExist(_transcriptId), "Issuance: Transcript ID not found.");
        return _transcripts[_transcriptId];
    }

    function getTranscriptIdsForStudent(address _studentAddress) public view virtual returns (uint256[] memory) {
        return _studentTranscripts[_studentAddress];
    }
    
    function doesTranscriptExist(uint256 _transcriptId) public view virtual returns (bool) {
        return _transcripts[_transcriptId].issuerAddress != address(0); // Check if issuerAddress is set (meaning it was initialized)
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }
}
