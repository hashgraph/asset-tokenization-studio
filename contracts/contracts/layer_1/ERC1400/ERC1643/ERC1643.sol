// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC1643} from '../../interfaces/ERC1400/IERC1643.sol';
import {_DOCUMENTER_ROLE} from '../../constants/roles.sol';
import {_ERC1643_STORAGE_POSITION} from '../../constants/storagePositions.sol';
import {Common} from '../../common/Common.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {_ERC1643_RESOLVER_KEY} from '../../constants/resolverKeys.sol';

contract ERC1643 is IERC1643, IStaticFunctionSelectors, Common {
    struct Document {
        bytes32 docHash; // Hash of the document
        uint256 lastModified; // Timestamp at which document details was last modified
        string uri; // URI of the document that exist off-chain
    }

    struct ERC1643Storage {
        // mapping to store the documents details in the document
        mapping(bytes32 => Document) documents;
        // mapping to store the document name indexes
        mapping(bytes32 => uint256) docIndexes;
        // Array use to store all the document name present in the contracts
        bytes32[] docNames;
    }

    /**
     * @notice Used to attach a new document to the contract, or update the URI or hash of an existing attached document
     * @dev Can only be executed by the owner of the contract.
     * @param _name Name of the document. It should be unique always
     * @param _uri Off-chain uri of the document from where it is accessible to investors/advisors to read.
     * @param _documentHash hash (of the contents) of the document.
     */
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    ) external virtual override onlyRole(_DOCUMENTER_ROLE) onlyUnpaused {
        if (_name == bytes32(0)) {
            revert EmptyName();
        }
        if (bytes(_uri).length == 0) {
            revert EmptyURI();
        }
        if (_documentHash == bytes32(0)) {
            revert EmptyHASH();
        }
        ERC1643Storage storage erc1643Storage = _getERC1643Storage();
        if (erc1643Storage.documents[_name].lastModified == uint256(0)) {
            erc1643Storage.docNames.push(_name);
            erc1643Storage.docIndexes[_name] = erc1643Storage.docNames.length;
        }
        erc1643Storage.documents[_name] = Document(
            _documentHash,
            block.timestamp,
            _uri
        );
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    /**
     * @notice Used to remove an existing document from the contract by giving the name of the document.
     * @dev Can only be executed by the owner of the contract.
     * @param _name Name of the document. It should be unique always
     */
    function removeDocument(
        bytes32 _name
    ) external virtual override onlyRole(_DOCUMENTER_ROLE) onlyUnpaused {
        ERC1643Storage storage erc1643Storage = _getERC1643Storage();
        if (erc1643Storage.documents[_name].lastModified == uint256(0)) {
            revert DocumentDoesNotExist(_name);
        }
        uint256 index = erc1643Storage.docIndexes[_name] - 1;
        if (index != erc1643Storage.docNames.length - 1) {
            erc1643Storage.docNames[index] = erc1643Storage.docNames[
                erc1643Storage.docNames.length - 1
            ];
            erc1643Storage.docIndexes[erc1643Storage.docNames[index]] =
                index +
                1;
        }
        erc1643Storage.docNames.pop();
        emit DocumentRemoved(
            _name,
            erc1643Storage.documents[_name].uri,
            erc1643Storage.documents[_name].docHash
        );
        delete erc1643Storage.documents[_name];
    }

    /**
     * @notice Used to return the details of a document with a known name (`bytes32`).
     * @param _name Name of the document
     * @return string The URI associated with the document.
     * @return bytes32 The hash (of the contents) of the document.
     * @return uint256 the timestamp at which the document was last modified.
     */
    function getDocument(
        bytes32 _name
    ) external view virtual override returns (string memory, bytes32, uint256) {
        ERC1643Storage storage erc1643Storage = _getERC1643Storage();
        return (
            erc1643Storage.documents[_name].uri,
            erc1643Storage.documents[_name].docHash,
            erc1643Storage.documents[_name].lastModified
        );
    }

    /**
     * @notice Used to retrieve a full list of documents attached to the smart contract.
     * @return bytes32 List of all documents names present in the contract.
     */
    function getAllDocuments()
        external
        view
        virtual
        override
        returns (bytes32[] memory)
    {
        return _getERC1643Storage().docNames;
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC1643_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.getDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .removeDocument
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getAllDocuments
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1643).interfaceId;
    }

    function _getERC1643Storage()
        internal
        pure
        virtual
        returns (ERC1643Storage storage erc1643Storage)
    {
        bytes32 position = _ERC1643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1643Storage.slot := position
        }
    }
}
