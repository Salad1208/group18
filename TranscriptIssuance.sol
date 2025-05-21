// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TranscriptIssuance
 * @dev Manages institution roles, and the issuance and storage of academic transcripts.
 */
contract TranscriptIssuance is AccessControl {
    using Counters for Counters.Counter;
    enum Status {Pending, Accepted, Rejected}

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
        uint256 id;                 // Unique identifier for the transcript
        address studentAddress;       // Ethereum address of the student
        string studentName;
        string studentId;            // Institution-specific student ID
        string issuingInstitution;   // Name of the issuing institution
        string programName;
        uint256 graduationDate;       // Store as Unix timestamp
        Course[] courses;            // Array of courses taken
        address issuerAddress;        // Address of the institution that issued this
        uint256 issueTimestamp;       // Timestamp when the transcript was issued
        Status status;               // Grabs variables from enum above for different states of transcript
        bool isValid;                // Flag to ensure struct is properly initialized
    }

    // Mapping from transcript ID to Transcript struct
    mapping(uint256 => Transcript) private _transcripts;

    // Mapping from student address to an array of their transcript IDs
    mapping(address => uint256[]) private _studentTranscripts;

    // Event emitted when a new transcript is successfully issued
    event TranscriptIssued(
        uint256 indexed transcriptId,
        address indexed studentAddress,    // Student's Ethereum address
        string studentId,                  // Institution-specific student ID
        string issuingInstitution,         // Name of the issuing institution
        address indexed issuer             // Address of the institution account that called issue
    );

    // Event emitted when Transcript is acceped or rejected
    event TranscriptAccepted(uint256 indexed transcriptId, address indexed student);
    event TranscriptRejected(uint256 indexed transcriptId, address indexed student);


    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Initialize counter so the first ID is 1
        _transcriptIds.increment();
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
     * @dev Issues a transcript using separate string arrays for course names and grades.
     * Only callable by an address with INSTITUTION_ROLE.
     */
    function issueTranscriptManual(
        string memory _studentName,
        address _studentAddress,
        string memory _studentId,
        string memory _issuingInstitution,
        string memory _programName,
        uint256 _graduationDate,
        string[] memory courseNames,
        string[] memory courseGrades
    ) public onlyRole(INSTITUTION_ROLE) {
        // Input validation
        require(bytes(_studentName).length > 0, "TI: Student name is required.");
        require(_studentAddress != address(0), "TI: Student Ethereum address is required.");
        require(bytes(_studentId).length > 0, "TI: Student ID is required.");
        require(bytes(_issuingInstitution).length > 0, "TI: Issuing institution is required.");
        require(bytes(_programName).length > 0, "TI: Program name is required.");
        require(_graduationDate > 0, "TI: Graduation date is required.");
        require(courseNames.length > 0, "TI: At least one course is required.");
        require(courseNames.length == courseGrades.length, "TI: Course names and grades arrays must have the same length.");

        Course[] memory courses = new Course[](courseNames.length);
        for (uint i = 0; i < courseNames.length; i++) {
            courses[i] = Course(courseNames[i], courseGrades[i]);
        }

    }

    /**
     * @dev Internal function shared by issueTranscript and issueTranscriptManual to handle transcript creation.
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
        uint256 newTranscriptId = _transcriptIds.current();
        _transcriptIds.increment(); // Prepare for the next ID

        Transcript storage newTranscript = _transcripts[newTranscriptId];
        newTranscript.id = newTranscriptId;
        newTranscript.studentAddress = _studentAddress;
        newTranscript.studentName = _studentName;
        newTranscript.studentId = _studentId;
        newTranscript.issuingInstitution = _issuingInstitution;
        newTranscript.programName = _programName;
        newTranscript.graduationDate = _graduationDate;
        newTranscript.courses = _courses; // Direct assignment of memory array to storage array
        newTranscript.issuerAddress = msg.sender;
        newTranscript.issueTimestamp = block.timestamp;
        newTranscript.isValid = true; // Mark as initialized

        _studentTranscripts[_studentAddress].push(newTranscriptId);

        emit TranscriptIssued(newTranscriptId, _studentAddress, _studentId, _issuingInstitution, msg.sender);
    }

    // --- Getter functions for external reads (e.g., by TranscriptVerification contract) ---

    /**
     * @dev Retrieves the details of a specific transcript by its ID.
     * Ensures the transcript is valid before returning.
     */
    function getTranscriptById(uint256 _transcriptId) public view returns (Transcript memory) {
        require(_transcripts[_transcriptId].isValid, "TI: Transcript ID not found or invalid.");
        return _transcripts[_transcriptId];
    }

    /**
     * @dev Retrieves all transcript IDs for a given student address.
     */
    function getTranscriptIdsForStudent(address _studentAddress) public view returns (uint256[] memory) {
        return _studentTranscripts[_studentAddress];
    }

    /**
     * @dev Checks if a transcript ID exists and has been initialized (is valid).
     */
    function doesTranscriptExist(uint256 _transcriptId) public view returns (bool) {
        return _transcripts[_transcriptId].isValid;
    }

    /**
     * @dev Checks if an account has the INSTITUTION_ROLE.
     */
    function isInstitution(address _account) public view returns (bool) {
        return hasRole(INSTITUTION_ROLE, _account);
    }



    /**
     * @dev See {IERC165-supportsInterface}.
     * Required override for AccessControl.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }
}