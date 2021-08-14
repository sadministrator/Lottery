// SPDX-License-Identifier: ISC
pragma solidity ^0.8;

contract Lottery {
    address public manager;
    address[] public players;
    
    constructor() {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value >= .0001 ether);
        players.push(msg.sender);
    }
    
    function pickWinner() public restricted {
        payable(players[random() % players.length]).transfer(address(this).balance);
        players = new address[](0);
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
    
    function getPlayers() public view returns(address[] memory) {
        return players;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}