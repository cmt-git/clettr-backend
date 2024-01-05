import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import './Ettr.sol';

contract CLTRNFT is ERC721{

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

    function cltrnft_mint(string memory _tokenURI, uint256 _amount, address _ettr_contract) public returns(bool) {
        Ettr E = Ettr(_ettr_contract);
        if (E.get_ettr_balance_subtract(msg.sender, _amount) == true){
            E.ettr_burn(msg.sender, _amount);
            uint256 newItemId = tokenCounter;
            _safeMint(msg.sender, tokenCounter);
            _setTokenURI(tokenCounter, _tokenURI);
            tokenCounter = tokenCounter + 1;
            return true;
        }
        else {
            return false;
        }
    }

    function cltrnft_market_buy(address owner,string memory _tokenURI, uint256 _amount, address _ettr_contract) public returns(bool) {
        Ettr E = Ettr(_ettr_contract);
        if (E.get_ettr_balance_subtract(msg.sender, _amount) == true){
            E.ettr_burn(msg.sender, _amount);

            E.external_ettr_mint(owner, _amount);

            uint256 newItemId = tokenCounter;
            _safeMint(msg.sender, tokenCounter);
            _setTokenURI(tokenCounter, _tokenURI);
            tokenCounter = tokenCounter + 1;
            return true;
        }
        else {
            return false;
        }
    }

    function cltrnft_market_sell(string memory _tokenURI) public returns(bool) {
        uint tokenId = _findTokenURI((_tokenURI));
        _burn(tokenId);
        return true;
    }

    function cltrnft_forge(string memory _tokenURI_1, string memory _tokenURI_2, string memory _tokenURI_3, string memory _tokenURI, uint256 _amount, address _ettr_contract) public returns(bool) {
        Ettr E = Ettr(_ettr_contract);
        if (E.get_ettr_balance_subtract(msg.sender, _amount) == true){
            E.ettr_burn(msg.sender, _amount);

            uint tokenId = _findTokenURI((_tokenURI_1));
            _burn(tokenId);

            tokenId = _findTokenURI((_tokenURI_2));
            _burn(tokenId);

            tokenId = _findTokenURI((_tokenURI_3));
            _burn(tokenId);

            uint256 newItemId = tokenCounter;
            _safeMint(msg.sender, tokenCounter);
            _setTokenURI(tokenCounter, _tokenURI);
            tokenCounter = tokenCounter + 1;
            return true;
        }
        else {
            return false;
        }
    }
}
