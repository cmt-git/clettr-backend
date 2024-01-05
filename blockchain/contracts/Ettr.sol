pragma solidity >=0.6.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Ettr is ERC20 {
	 constructor() public ERC20("Ettr", "ETTR") {
    }

	function get_ettr_balance_subtract(address _sender, uint256 _amount) external returns(bool){
		uint subtract_value = _amount * 10**uint(decimals());
		return balanceOf(_sender) - subtract_value >= 0;
	}

	function ettr_mint(uint256 _amount) public returns(bool) {
		_mint(msg.sender, _amount * 10**uint(decimals()));
		return true;
	}

	function external_ettr_mint(address _sender, uint256 _amount) external {
		_mint(_sender, _amount * 10**uint(decimals()));
	}

	function ettr_burn(address _sender, uint256 _amount) external {
		uint subtract_value = _amount * 10**uint(decimals());
		if (balanceOf(_sender) - subtract_value >= 0){
			_burn(_sender, subtract_value);
		}
	}
}

