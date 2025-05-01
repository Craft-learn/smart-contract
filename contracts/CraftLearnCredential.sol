// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CraftLearnCredential is ERC721URIStorage, AccessControl {
    uint256 private _tokenIdCounter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    struct Credential {
        string courseName;
        address learner;
        uint256 issueTimestamp;
        string learnerName;
        bool verified;
    }

    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) private _userTokens;
    mapping(address => bool) private _hasMinted;

    event CredentialMinted(uint256 tokenId, address learner, string courseName, string learnerName);
    event CredentialVerified(uint256 tokenId, bool isVerified);
    event StudentRegistered(address indexed account, address indexed admin);
    event TransferAttemptPrevented(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor() ERC721("CraftLearn Skill Credential", "CRAFT-CRED") {
        _tokenIdCounter = 0;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Add multiple addresses to the student role
     * @param addresses Array of addresses to add as students
     */
    function registerStudents(address[] memory addresses) public {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (isStudent(addresses[i])) {
                revert("Address is already a student");
            }
            grantRole(STUDENT_ROLE, addresses[i]);
            emit StudentRegistered(addresses[i], msg.sender);
        }
    }

    /**
     * @dev Check if an address is a student
     * @param account The address to check
     * @return True if the address is a student, false otherwise
     */
    function isStudent(address account) public view returns (bool) {
        return hasRole(STUDENT_ROLE, account);
    }

    function mintCredential(
        string memory _courseName,
        string memory _tokenURI,
        string memory _learnerName
    ) public onlyRole(STUDENT_ROLE) returns (uint256) {
        require(!_hasMinted[msg.sender], "User has already minted a credential");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _hasMinted[msg.sender] = true;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        credentials[newTokenId] = Credential({
            courseName: _courseName,
            learner: msg.sender,
            issueTimestamp: block.timestamp,
            learnerName: _learnerName,
            verified: false
        });

        _userTokens[msg.sender].push(newTokenId);

        // Auto-verify on mint for now
        verifyCredential(newTokenId, true);

        emit CredentialMinted(newTokenId, msg.sender, _courseName, _learnerName);

        return newTokenId;
    }

    function verifyCredential(uint256 _tokenId, bool _isVerified) public {
        require(ownerOf(_tokenId) != address(0), "Credential does not exist");
        credentials[_tokenId].verified = _isVerified;
        emit CredentialVerified(_tokenId, _isVerified);
    }

    function getCredentialDetails(uint256 _tokenId) 
        public 
        view 
        returns (Credential memory) 
    {
        require(ownerOf(_tokenId) != address(0), "Credential does not exist");
        return credentials[_tokenId];
    }

    function getUserTokens(address _user) public view returns (uint256[] memory) {
        return _userTokens[_user];
    }

    /**
     * @dev Burn a certificate NFT
     * @param tokenId The token ID to burn
     */
    function burnCertificate(uint256 tokenId) public onlyRole(ADMIN_ROLE) {
        _burn(tokenId);
    }

    /**
     * @dev Override _update to enforce soulbound property
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            emit TransferAttemptPrevented(from, to, tokenId);
            revert("Soulbound: Transfers are not allowed");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Prevent token transfers to enforce soulbound property
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        if (from != address(0) && to != address(0)) {
            emit TransferAttemptPrevented(from, to, tokenId);
            revert("Soulbound: Transfers are not allowed");
        }
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Prevent safe token transfers with data to enforce soulbound property
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        public
        virtual
        override(ERC721, IERC721)
    {
        if (from != address(0) && to != address(0)) {
            emit TransferAttemptPrevented(from, to, tokenId);
            revert("Soulbound: Transfers are not allowed");
        }
        super.safeTransferFrom(from, to, tokenId, data);
    }

    /**
     * @dev Custom implementation to prevent approvals
     */
    function approve(address, uint256) public virtual override(ERC721, IERC721) {
        revert("Soulbound: Approvals are not allowed");
    }

    /**
     * @dev Custom implementation to prevent approvals for all
     */
    function setApprovalForAll(address, bool) public virtual override(ERC721, IERC721) {
        revert("Soulbound: Approvals are not allowed");
    }

    /**
     * @dev Implementation of the {IERC165} interface.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}