// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentVerifier {
    struct Student {
        string studentId;
        string name;
        address studentAddress;
        bool exists;
    }

    // Mapping from student ID to Student record
    mapping(string => Student) private students;

    // Event emitted when a student is registered
    event StudentRegistered(string studentId, string name, address studentAddress);

    // Admin-only modifier (for simplicity, contract deployer is admin)
    address private admin;
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Registers a student with their ID, name, and address.
     */
    function registerStudent(string memory _studentId, string memory _name, address _studentAddress) public onlyAdmin {
        require(_studentAddress != address(0), "Invalid student address.");
        require(!students[_studentId].exists, "Student ID already registered.");

        students[_studentId] = Student({
            studentId: _studentId,
            name: _name,
            studentAddress: _studentAddress,
            exists: true
        });

        emit StudentRegistered(_studentId, _name, _studentAddress);
    }

    /**
     * @dev Verifies student information against stored data.
     */
    function verifyStudent(
        string memory _studentId,
        string memory _name,
        address _studentAddress
    ) public view returns (bool) {
        Student memory student = students[_studentId];
        if (!student.exists) return false;

        return (
            keccak256(bytes(student.name)) == keccak256(bytes(_name)) &&
            student.studentAddress == _studentAddress
        );
    }

    /**
     * @dev Returns true if a student ID exists.
     */
    function studentExists(string memory _studentId) public view returns (bool) {
        return students[_studentId].exists;
    }
}


