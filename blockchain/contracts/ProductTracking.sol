// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProductTracking - ChainTrack supply chain registry
/// @notice Stores products on-chain and tracks them through 4 sequential stages.
contract ProductTracking {
    /// Supply chain stages. Products must move strictly forward one step at a time.
    enum Status {
        Manufactured, // 0
        InWarehouse,  // 1
        Shipped,      // 2
        Delivered     // 3
    }

    struct Product {
        string id;
        string name;
        string manufacturer;
        string category;
        string manufacturingDate;
        string description;
        Status status;
        uint256 registeredAt;
        uint256 updatedAt;
        address registeredBy;
    }

    address public owner;
    mapping(string => Product) private products;
    mapping(string => bool) private exists;
    mapping(address => bool) public authorized;
    string[] private productIds;

    /// `productIdKey` is indexed (hashed) so the frontend can filter logs by product ID.
    event ProductRegistered(
        string indexed productIdKey,
        string productId,
        string name,
        address indexed registeredBy,
        uint256 timestamp
    );
    event ProductStatusUpdated(
        string indexed productIdKey,
        string productId,
        Status previousStatus,
        Status newStatus,
        address indexed updatedBy,
        uint256 timestamp
    );
    event AccountAuthorizationChanged(address indexed account, bool allowed);

    error NotOwner();
    error NotAuthorized();
    error EmptyProductId();
    error EmptyField(string field);
    error ProductAlreadyExists(string productId);
    error ProductNotFound(string productId);
    error InvalidStatusTransition(Status current, Status requested);
    error AlreadyDelivered(string productId);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != owner && !authorized[msg.sender]) revert NotAuthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Owner can allow extra wallets (e.g. warehouse, courier) to update statuses.
    function setAuthorized(address account, bool allowed) external onlyOwner {
        authorized[account] = allowed;
        emit AccountAuthorizationChanged(account, allowed);
    }

    /// @notice Register a new product. Only the contract owner may call this.
    function registerProduct(
        string calldata _id,
        string calldata _name,
        string calldata _manufacturer,
        string calldata _category,
        string calldata _manufacturingDate,
        string calldata _description
    ) external onlyOwner {
        if (bytes(_id).length == 0) revert EmptyProductId();
        if (bytes(_name).length == 0) revert EmptyField("name");
        if (bytes(_manufacturer).length == 0) revert EmptyField("manufacturer");
        if (exists[_id]) revert ProductAlreadyExists(_id);

        products[_id] = Product({
            id: _id,
            name: _name,
            manufacturer: _manufacturer,
            category: _category,
            manufacturingDate: _manufacturingDate,
            description: _description,
            status: Status.Manufactured,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp,
            registeredBy: msg.sender
        });
        exists[_id] = true;
        productIds.push(_id);

        emit ProductRegistered(_id, _id, _name, msg.sender, block.timestamp);
    }

    /// @notice Move a product to the next stage. Backward/skipped/post-delivery updates revert.
    function updateProductStatus(string calldata _id, Status _newStatus) external onlyAuthorized {
        if (!exists[_id]) revert ProductNotFound(_id);
        Product storage p = products[_id];
        if (p.status == Status.Delivered) revert AlreadyDelivered(_id);
        if (uint8(_newStatus) != uint8(p.status) + 1) {
            revert InvalidStatusTransition(p.status, _newStatus);
        }

        Status previous = p.status;
        p.status = _newStatus;
        p.updatedAt = block.timestamp;

        emit ProductStatusUpdated(_id, _id, previous, _newStatus, msg.sender, block.timestamp);
    }

    function getProduct(string calldata _id) external view returns (Product memory) {
        if (!exists[_id]) revert ProductNotFound(_id);
        return products[_id];
    }

    function getAllProductIds() external view returns (string[] memory) {
        return productIds;
    }

    function productExists(string calldata _id) external view returns (bool) {
        return exists[_id];
    }

    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }
}
