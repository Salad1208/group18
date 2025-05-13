// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UniCertify
 * @dev Manages the issuance and verification of academic transcripts on the blockchain.
 */
contract UniCertify is AccessControl {
    using Counters for Counters.Counter;

    // Role definition for institutions authorized to issue transcripts
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    // Counter to generate unique transcript IDs
    Counters.Counter private _transcriptIds;

    // Structure to represent a single course with its grade
    struct Course {
        string name;
        string grade;
    }

    // Structure to represent an academic transcript
    struct Transcript {
        uint256 id;
        address studentAddress;         // Ethereum address of the student
        string studentName;
        string studentId;               // Institution-specific student ID
        string issuingInstitution;
        string programName;
        uint256 graduationDate;         // Store as Unix timestamp for consistency
        Course[] courses;               // Array of courses taken
        address issuerAddress;          // Address of the institution that issued this
        uint256 issueTimestamp;         // Timestamp when the transcript was issued
    }

    // Mapping from transcript ID to Transcript struct
    mapping(uint256 => Transcript) private _transcripts;

    // Mapping from student address to an array of their transcript IDs
    mapping(address => uint256[]) private _studentTranscripts;

    // Event emitted when a new transcript is successfully issued
    event TranscriptIssued(
        uint256 indexed transcriptId,
        address indexed studentAddress,   // Student's Ethereum address
        string studentId,                 // Institution-specific student ID
        string issuingInstitution,
        address indexed issuer
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Optionally grant the deployer INSTITUTION_ROLE as well for easier testing initially
        // _grantRole(INSTITUTION_ROLE, msg.sender);
    }

    /**
     * @dev Grants the INSTITUTION_ROLE to an account.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     */
    function grantInstitutionRole(address _institutionAccount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(INSTITUTION_ROLE, _institutionAccount);
    }

    /**
     * @dev Revokes the INSTITUTION_ROLE from an account.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     */
    function revokeInstitutionRole(address _institutionAccount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(INSTITUTION_ROLE, _institutionAccount);
    }

    /**
     * @dev Issues a transcript using Course[] struct array (used in advanced clients).
     * Includes student's Ethereum address.
     */
    function issueTranscript(
        string memory _studentName,
        address _studentAddress,        // Student's Ethereum address
        string memory _studentId,
        string memory _issuingInstitution,
        string memory _programName,
        uint256 _graduationDate,
        Course[] memory _courses
    ) public onlyRole(INSTITUTION_ROLE) {
        _issueTranscriptInternal(
            _studentName,
            _studentAddress,
            _studentId,
            _issuingInstitution,
            _programName,
            _graduationDate,
            _courses
        );
    }

    /**
     * @dev Helper function to issue transcript using string arrays (for Remix/frontend compatibility).
     * Includes student's Ethereum address.
     * @param _studentAddress Student's Ethereum address.
     * @param courseNames Array of course names.
     * @param courseGrades Array of grades for the courses.
     */
    function issueTranscriptManual(
        string memory _studentName,
        address _studentAddress,        // Student's Ethereum address
        string memory _studentId,
        string memory _issuingInstitution,
        string memory _programName,
        uint256 _graduationDate,
        string[] memory courseNames,
        string[] memory courseGrades
    ) public onlyRole(INSTITUTION_ROLE) {
        require(courseNames.length == courseGrades.length, "Mismatched course arrays");
        require(_studentAddress != address(0), "Student address cannot be zero");

        Course[] memory courses = new Course[](courseNames.length);
        for (uint i = 0; i < courseNames.length; i++) {
            courses[i] = Course(courseNames[i], courseGrades[i]);
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

    /**
     * @dev Internal function shared by issueTranscript and issueTranscriptManual.
     */
    function _issueTranscriptInternal(
        string memory _studentName,
        address _studentAddress,
        string memory _studentId,
        string memory _issuingInstitution,
        string memory _programName,
        uint256 _graduationDate,
        Course[] memory _courses
    ) internal {
        require(bytes(_studentName).length > 0, "Student name required");
        require(bytes(_studentId).length > 0, "Student ID required");
        require(bytes(_issuingInstitution).length > 0, "Issuing institution required");
        require(bytes(_programName).length > 0, "Program name required");
        require(_graduationDate > 0, "Graduation date required");
        require(_courses.length > 0, "At least one course required");
        // _studentAddress is validated in issueTranscriptManual, or assumed valid if issueTranscript is called directly

        _transcriptIds.increment();
        uint256 newTranscriptId = _transcriptIds.current();

        Transcript storage newTranscript = _transcripts[newTranscriptId];
        newTranscript.id = newTranscriptId;
        newTranscript.studentAddress = _studentAddress; // Store student's Ethereum address
        newTranscript.studentName = _studentName;
        newTranscript.studentId = _studentId;
        newTranscript.issuingInstitution = _issuingInstitution;
        newTranscript.programName = _programName;
        newTranscript.graduationDate = _graduationDate;
        newTranscript.issuerAddress = msg.sender;
        newTranscript.issueTimestamp = block.timestamp;

        for (uint i = 0; i < _courses.length; i++) {
            newTranscript.courses.push(_courses[i]);
        }

        // Add to the student's list of transcripts
        _studentTranscripts[_studentAddress].push(newTranscriptId);

        emit TranscriptIssued(newTranscriptId, _studentAddress, _studentId, _issuingInstitution, msg.sender);
    }

    /**
     * @dev Returns a transcript by its ID.
     */
    function getTranscript(uint256 _transcriptId) public view returns (Transcript memory) {
        require(_transcriptExists(_transcriptId), "Transcript ID not found");
        return _transcripts[_transcriptId];
    }

    /**
     * @dev Allows a student to retrieve IDs of all transcripts issued to their address.
     */
    function getMyTranscriptIds() public view returns (uint256[] memory) {
        return _studentTranscripts[msg.sender]; // msg.sender is the student calling this function
    }

    function _transcriptExists(uint256 _transcriptId) internal view returns (bool) {
        return _transcripts[_transcriptId].issuerAddress != address(0); // Check if it has been initialized
    }

    /**
     * @dev Required override for AccessControl.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}