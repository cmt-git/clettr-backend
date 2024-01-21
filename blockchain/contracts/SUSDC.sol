//pragma solidity >=0.6.0 <0.9.0;
pragma solidity ^0.8.5;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract SUSDC is ERC20 {

	constructor() public ERC20("SUSDC", "SUSDC") {
	}

	event BalanceCheck(address indexed account, uint256 balance, uint256 subtractedValue, bool isBalanceEnough);

	function get_susdc_balance_subtract(address _sender, uint256 _amount) external returns(bool){
		// uint subtract_value = _amount * 10**uint(decimals());
		// return balanceOf(_sender) - subtract_value >= 0;

		uint subtract_value = _amount * 10**uint(decimals());
    bool isBalanceEnough = balanceOf(_sender) >= subtract_value;
    emit BalanceCheck(_sender, balanceOf(_sender), subtract_value, isBalanceEnough);
    return isBalanceEnough;
	}

	function susdc_mint(uint256 _amount) public returns(bool) {
		_mint(msg.sender, _amount * 10**uint(decimals()));
		return true;
	}

	function external_susdc_mint(address _sender, uint256 _amount) external {
		_mint(_sender, _amount * 10**uint(decimals()));
	}

	function susdc_burn(address _sender, uint256 _amount) external {
		uint subtract_value = _amount * 10**uint(decimals());
		if (balanceOf(_sender) - subtract_value >= 0){
			_burn(_sender, subtract_value);
		}
	}
}

