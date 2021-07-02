pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value >= .01 ether);
        players.push(msg.sender);
    }
    
    function pickWinner() public restricted {
        players[random() % players.length].transfer(this.balance);
        players = new address[](0);
    }
    
    function random() private view returns (uint) {
        return uint(sha3(block.difficulty, now, players));
    }
    
    function refund() public restricted { // todo
        // convert the players array into a string => uint mapping
        // loop through mapping and transer the corresponding amount of eth
    }
    
    function getPlayers() public view returns(address[]) {
        return players;
    }

    function getBalance() public view returns(uint) {
        return this.balance;
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}