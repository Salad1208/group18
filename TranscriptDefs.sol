// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TranscriptDefs
 * @dev Library defining shared data structures and events for transcript management.
 */
library TranscriptDefs {
    // Enum to represent the status of a transcript
    enum Status {
        Pending,          // Issued, awaiting student review
        AcceptedByStudent,  // Student confirmed accuracy
        RejectedByStudent,  // Student marked as incorrect
        RevokedByInstitution // Institution revoked the transcript
    }

    // Structure to represent a single course with its grade
    struct Course {
        string name;
        string grade;
    }

    // Structure to represent an academic transcript
    struct Transcript {
        uint256 id;             // Unique identifier for the transcript
        address studentAddress; // Ethereum address of the student
        string studentName;
        string studentId;        // Institution-specific student ID
        string issuingInstitution;
        string programName;
        uint256 graduationDate; // Store as Unix timestamp
        Course[] courses;       // Array of courses taken
        address issuerAddress;  // Address of the institution that issued this
        uint256 issueTimestamp; // Timestamp when the transcript was issued
        Status status;          // Current status of the transcript
    }

    // Event emitted when a new transcript is successfully issued
    event TranscriptIssued(
        uint256 indexed transcriptId,
        address indexed studentAddress,
        string studentId,
        string issuingInstitution,
        address indexed issuer,
        Status initialStatus
    );

    // Event emitted when a transcript's status changes
    event TranscriptStatusChanged(
        uint256 indexed transcriptId,
        address indexed studentAddress,
        address indexed changedBy, // Address that initiated the status change
        Status newStatus,
        string reason // Optional reason, e.g., for rejection or revocation
    );
}
