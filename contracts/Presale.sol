pragma solidity 0.5.16;

import "./Peach.sol";

contract PreSale is Context, Ownable {
    using SafeMath for uint256;

    Peach public Token;
    address payable public paymentAddress;
    uint256 public maxMintable;
    uint256 public totalMinted;
    uint256 public minValue;
    uint256 public maxValue;
    uint256 public exchangeRate;
    bool public funding;
    bool public isClosed;
    bool private configSet;

    mapping (address => uint256) private _balances;

    constructor() public {
        maxMintable = 20000000000000000000000000000;
        minValue = 100000000000000000;
        maxValue = 20000000000000000000;
        funding = false;
        exchangeRate = 20000000;
        isClosed = false;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier isNotConfig() {
        require(!configSet, "Config: configuration is setted");
        _;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier isConfig() {
        require(configSet, "Config: configuration is not setted");
        _;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier isFunding() {
        require(funding, "Funding: funding is not setted");
        _;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier isClose() {
        require(false == isClosed);
        _;
    }

    modifier isCorrectValue() {
        require(msg.value >= minValue, "Is Not Correct Value");
        require(msg.value <= maxValue, "Is Not Correct Value");
        _;
    }

    function setup(address _tokenAddress, address payable _paymentAddress) external isNotConfig onlyOwner returns (bool) {
        Token = Peach(_tokenAddress);
        paymentAddress = _paymentAddress;
        funding = true;
        configSet = true;

        return true;
    }

    function closeSale() external onlyOwner returns (bool) {
        isClosed = true;
        funding = false;
        return true;
    }

    function () external isFunding isCorrectValue payable {
        uint256 amount = msg.value * exchangeRate;
        uint256 total = totalMinted + amount;
        require(total<=maxMintable);
        totalMinted += amount;
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        Token.transferTo(msg.sender, amount);
        paymentAddress.transfer(msg.value);
    }

    function contribute() external isFunding isCorrectValue payable {
        uint256 amount = msg.value * exchangeRate;
        uint256 total = totalMinted + amount;
        require(total<=maxMintable);
        totalMinted += amount;
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        Token.transferTo(msg.sender, amount);
        paymentAddress.transfer(msg.value);
    }

    function updateRate(uint256 rate) external onlyOwner returns (bool) {
        exchangeRate = rate;

        return true;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function setPaymentAddress(address payable account) external onlyOwner returns (bool) {
        _setPaymentAddress(account);
        return true;
    }

    function _setPaymentAddress(address payable account) internal {
        paymentAddress = account;
    }
}
