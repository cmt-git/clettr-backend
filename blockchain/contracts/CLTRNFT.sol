pragma solidity ^0.8.5;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

import './Ettr.sol';
import './SUSDC.sol';

contract CLTRNFT is ERC721, Ownable{
    using SafeMath for uint256;

    // Optional mapping for token URIs
    mapping (uint256 => string) private _tokenURIs;

    uint256 public tokenCounter;
    constructor() ERC721("Cletter NFT", "CLTRNFT") public {
        tokenCounter = 0;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _findTokenURI(string memory _tokenURI) public returns(uint256 index){
        for(uint i = 0; i < tokenCounter; i++){
            if (keccak256(abi.encodePacked(_tokenURIs[i])) == keccak256(abi.encodePacked(_tokenURI))){
                return i;
            }
        }
        return 0;
    }

    event TokenMinted(address indexed owner, uint256 tokenId);
    function cltrnft_mint(string memory _tokenURI, uint256 _amount, address _ettr_contract, address _susdc_contract, uint256 _type) public returns (bool) {
        Ettr E = Ettr(_ettr_contract);
        SUSDC S = SUSDC(_susdc_contract);

        require(_type == 0 || _type == 1, "Invalid token type");

        if (_type == 0) {
            require(E.get_ettr_balance_subtract(msg.sender, _amount), "Insufficient ETTR balance");
            E.ettr_burn(msg.sender, _amount);
        } else if (_type == 1) {
            require(S.get_susdc_balance_subtract(msg.sender, _amount), "Insufficient sUSDC balance");
            S.susdc_burn(msg.sender, _amount);
        } else {
            revert("Invalid token type");
        }

        tokenCounter = tokenCounter.add(1);
        emit TokenMinted(msg.sender, tokenCounter);
        _safeMint(msg.sender, tokenCounter);
        _setTokenURI(tokenCounter, _tokenURI);

        return true;
    }

    function cltrnft_market_buy(address owner, string memory _tokenURI, uint256 _amount, address _ettr_contract, address _susdc_contract) public returns(bool) {
        Ettr E = Ettr(_ettr_contract);
        require(E.get_ettr_balance_subtract(msg.sender, _amount), "Insufficient ETTR balance");
        uint tokenId = _findTokenURI((_tokenURI));
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(ownerOf(tokenId), owner, tokenId, "");
        // Ettr E = Ettr(_ettr_contract);
        // if (E.get_ettr_balance_subtract(msg.sender, _amount) == true){
        //     E.ettr_burn(msg.sender, _amount);

        //     E.external_ettr_mint(owner, _amount);

        //     _safeMint(msg.sender, tokenCounter);
        //     _setTokenURI(tokenCounter, _tokenURI);
        //     tokenCounter = tokenCounter + 1;
        //     return true;
        // }
        // else {
        //     return false;
        // }
    }

    function cltrnft_market_sell(string memory _tokenURI) public returns(bool) {
        uint tokenId = _findTokenURI((_tokenURI));
        approve(msg.sender, tokenId);
    }

    function cltrnft_forge(uint _tokenId_1, uint _tokenId_2, uint _tokenId_3, string memory _tokenURI, uint256 _amount, address _ettr_contract) public returns(bool) {
        Ettr E = Ettr(_ettr_contract);
        require(E.get_ettr_balance_subtract(msg.sender, _amount), "Insufficient ETTR balance");
        E.ettr_burn(msg.sender, _amount);

        _burn(_tokenId_1);
        _burn(_tokenId_2);
        _burn(_tokenId_3);

        tokenCounter = tokenCounter.add(1);
        emit TokenMinted(msg.sender, tokenCounter);
        _safeMint(msg.sender, tokenCounter);
        _setTokenURI(tokenCounter, _tokenURI);
        return true;
    }
}
