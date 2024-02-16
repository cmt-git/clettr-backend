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

    // Mapping to track approval status of each NFT
    mapping(uint256 => bool) private _saleApproved;

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
            // - In a production scenario this would to another wallet, or another contract
            E.ettr_burn(msg.sender, _amount);
        } else if (_type == 1) {
            require(S.get_susdc_balance_subtract(msg.sender, _amount), "Insufficient sUSDC balance");
            // - In a production scenario this would to another wallet, or another contract
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

    function cltrnft_market_buy(uint _tokenId, uint256 _amount, address _ettr_contract, address _susdc_contract, uint256 _type) public returns(bool) {
        Ettr E = Ettr(_ettr_contract);
        SUSDC S = SUSDC(_susdc_contract);

        require(_type == 0 || _type == 1, "Invalid token type");

        if (_type == 0)  {
            require(E.get_ettr_balance_subtract(msg.sender, _amount), "Insufficient ETTR balance");
            E.ettr_burn(msg.sender, _amount);
            E.external_ettr_mint(ownerOf(_tokenId), _amount);
        } else if (_type == 1) {
            require(S.get_susdc_balance_subtract(msg.sender, _amount), "Insufficient sUSDC balance");
            S.susdc_burn(msg.sender, _amount);
            S.external_susdc_mint(ownerOf(_tokenId), _amount);
        } else {
            revert("Invalid token type");
        }

        require(_saleApproved[_tokenId], "Sale not approved");
        _transfer(ownerOf(_tokenId), msg.sender, _tokenId);
    }

    // Event triggered when an NFT sale is approved
    event SaleApproved(uint256 indexed tokenId);
    function cltrnft_market_sell(uint _tokenId) public {
        require(_exists(_tokenId), "Token ID does not exist");
        //require(ownerOf(_tokenId) == msg.sender, "Only the owner can approve the sale");
        require(!_saleApproved[_tokenId], "Sale already approved");

        _saleApproved[_tokenId] = true;

        emit SaleApproved(_tokenId);
    }

    // Event triggered when an NFT sale approval is revoked
    event SaleApprovalRevoked(uint256 indexed tokenId);
    function cltrnft_market_revoke_approval(uint256 tokenId) public {
        require(_exists(tokenId), "Token ID does not exist");
        //require(ownerOf(tokenId) == owner(), "Only the owner can revoke the sale approval");
        require(_saleApproved[tokenId], "Sale approval not granted");

        _saleApproved[tokenId] = false;

        emit SaleApprovalRevoked(tokenId);
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
