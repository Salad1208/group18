// SPDX-License-Identifier: MIT
// complier version must be greater than or equal to 0.8.3 and less than 0.9.0
pragma solidity ^0.8.3;

contract HelloWorld {    
    function sayHelloWorld() external pure returns(string memory) {
        return "Hello World";
    }
}