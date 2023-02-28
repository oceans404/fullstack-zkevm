//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {
  string greeting;

  uint256 currentCount = 0;

    function increment() public {
        currentCount = currentCount + 1;
    }

    function retrieve() public view returns (uint256){
        return currentCount;
    }
}