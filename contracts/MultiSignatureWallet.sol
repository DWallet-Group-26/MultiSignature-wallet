// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MultiSigWalletFactory{
    mapping(address => address) public mainMapping;
    mapping(address => address) public backupMapping;

    function createWallet(address main,address backup, address server) public{
        require(mainMapping[main] == address(0), "Main address already exists");
        require(backupMapping[backup] == address(0), "Backup address already exists");

        MultiSigWallet newWallet = new MultiSigWallet(main,backup,server);

        mainMapping[main] = address(newWallet);
        backupMapping[backup] = address(newWallet);
    }
}

contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value
    );
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    address public verifyingServerAddress;
    address public backupAddress;
    address public mainAddress;

    mapping(address => bool) public isOwner;

    struct Transaction {
        address to;
        uint value;
        bool executed;
    }

    // mapping from tx index => owner => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;

    Transaction[] public transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier notServer() {
        require(msg.sender != verifyingServerAddress, "server");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    constructor(address main,address backup, address server) {
        require(main != address(0), "main is the zero address");
        require(backup != address(0), "backup is the zero address");
        require(server != address(0), "server is the zero address");
        require(main != backup, "main and backup are the same address");
        require(main != server, "main and server are the same address");
        require(backup != server, "backup and server are the same address");
              
        verifyingServerAddress = server;
        backupAddress = backup;
        mainAddress = main;
        isOwner[main] = true;
        isOwner[backup] = true;
        isOwner[server] = true;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint _value
    ) public onlyOwner notServer {
        uint txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                executed: false
            })
        );
        isConfirmed[txIndex][msg.sender] = true;

        emit SubmitTransaction(msg.sender, txIndex, _to, _value);
    }

    function confirmTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        isConfirmed[_txIndex][msg.sender] = true;
        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}("");
        require(success, "tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint _txIndex)
        public
        view
        returns (
            address to,
            uint value,
            bool executed
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.executed
        );
    }
}
