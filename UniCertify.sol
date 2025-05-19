// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**

    @title UniCertify

    @dev Manages the issuance and verification of academic transcripts on the blockchain.

    Allows institutions to issue transcripts and students to view their transcript IDs.
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
    uint256 id;                     // Unique identifier for the transcript
    address studentAddress;         // Ethereum address of the student
    string studentName;
    string studentId;               // Institution-specific student ID (e.g., university ID number)
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
    address indexed issuer            // Address of the institution account that called issue
    );

    constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    // Optionally, grant the deployer INSTITUTION_ROLE for easier initial testing:
    // _grantRole(INSTITUTION_ROLE, msg.sender);
    }

    /**
        @dev Grants the INSTITUTION_ROLE to an account.
        Can only be called by accounts with the DEFAULT_ADMIN_ROLE. */ function grantInstitutionRole(address _institutionAccount) public onlyRole(DEFAULT_ADMIN_ROLE) { grantRole(INSTITUTION_ROLE, _institutionAccount); }

    /**
        @dev Revokes the INSTITUTION_ROLE from an account.
        Can only be called by accounts with the DEFAULT_ADMIN_ROLE. */ function revokeInstitutionRole(address _institutionAccount) public onlyRole(DEFAULT_ADMIN_ROLE) { revokeRole(INSTITUTION_ROLE, _institutionAccount); }

    /**
        @dev Issues a transcript using Course[] struct array.
        This version is useful if the caller can easily construct the Course struct array.
        @param _studentName Name of the student.
        @param _studentAddress Ethereum address of the student.
        @param _studentId Institution-specific ID of the student.
        @param _issuingInstitution Name of the issuing institution.
        @param _programName Name of the academic program or degree.
        @param _graduationDate Date of graduation (Unix timestamp).
        @param _courses Array of Course structs representing courses and grades. */ function issueTranscript( string memory _studentName, address _studentAddress, string memory _studentId, string memory _issuingInstitution, string memory _programName, uint256 _graduationDate, Course[] memory _courses ) public onlyRole(INSTITUTION_ROLE) { _issueTranscriptInternal( _studentName, _studentAddress, _studentId, _issuingInstitution, _programName, _graduationDate, _courses ); }

    /**

        @dev Issues a transcript using separate string arrays for course names and grades.

        This version is often easier to call from basic frontends or Remix.

        @param _studentName Name of the student.

        @param _studentAddress Ethereum address of the student.

        @param _studentId Institution-specific ID of the student.

        @param _issuingInstitution Name of the issuing institution.

        @param _programName Name of the academic program or degree.

        @param _graduationDate Date of graduation (Unix timestamp).

        @param courseNames Array of course names.

        @param courseGrades Array of grades for the courses.
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
        require(courseNames.length == courseGrades.length, "UniCertify: Course names and grades arrays must have the same length.");
        require(_studentAddress != address(0), "UniCertify: Student address cannot be the zero address.");

        Course[] memory courses = new Course;
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

        @dev Internal function shared by issueTranscript and issueTranscriptManual to handle transcript creation.
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
        // Input validation
        require(bytes(_studentName).length > 0, "UniCertify: Student name is required.");
        require(_studentAddress != address(0), "UniCertify: Student Ethereum address is required.");
        require(bytes(_studentId).length > 0, "UniCertify: Student ID is required.");
        require(bytes(_issuingInstitution).length > 0, "UniCertify: Issuing institution is required.");
        require(bytes(_programName).length > 0, "UniCertify: Program name is required.");
        require(_graduationDate > 0, "UniCertify: Graduation date is required.");
        require(_courses.length > 0, "UniCertify: At least one course is required.");

        _transcriptIds.increment();
        uint256 newTranscriptId = _transcriptIds.current();

        Transcript storage newTranscript = _transcripts[newTranscriptId];
        newTranscript.id = newTranscriptId;
        newTranscript.studentAddress = _studentAddress;
        newTranscript.studentName = _studentName;
        newTranscript.studentId = _studentId;
        newTranscript.issuingInstitution = _issuingInstitution;
        newTranscript.programName = _programName;
        newTranscript.graduationDate = _graduationDate;
        newTranscript.issuerAddress = msg.sender; // The institution account that called the function
        newTranscript.issueTimestamp = block.timestamp;

        for (uint i = 0; i < _courses.length; i++) {
        newTranscript.courses.push(_courses[i]);
        }

        _studentTranscripts[_studentAddress].push(newTranscriptId);

        emit TranscriptIssued(newTranscriptId, _studentAddress, _studentId, _issuingInstitution, msg.sender);
        }

    /**
        @dev Retrieves the details of a specific transcript by its ID.
        Accessible by anyone. */ function getTranscript(uint256 _transcriptId) public view returns (Transcript memory) { require(_transcriptExists(_transcriptId), "UniCertify: Transcript ID not found."); return _transcripts[_transcriptId]; }

    /**
        @dev Allows the calling student (msg.sender) to retrieve IDs of all transcripts issued to their address. */ function getMyTranscriptIds() public view returns (uint256[] memory) { return _studentTranscripts[msg.sender]; }

    /**
        @dev Helper function to check if a transcript ID exists and has been initialized. */ function _transcriptExists(uint256 _transcriptId) internal view returns (bool) { return _transcripts[_transcriptId].issuerAddress != address(0); }

    /**
        @dev See {IERC165-supportsInterface}.
        Required override for AccessControl. */ function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) { return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId); } }