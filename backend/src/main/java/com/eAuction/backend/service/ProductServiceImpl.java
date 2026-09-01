package com.eAuction.backend.service;

import com.eAuction.backend.dto.ProductDTOs;
import com.eAuction.backend.entity.Admin;
import com.eAuction.backend.entity.Product;
import com.eAuction.backend.entity.ProductCategory;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.exception.DuplicateResourceException;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.exception.UnauthorizedAccessException;
import com.eAuction.backend.repository.AdminRepository;
import com.eAuction.backend.repository.ProductCategoryRepository;
import com.eAuction.backend.repository.ProductRepository;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final AdminRepository adminRepository;


    @Override
    public ProductDTOs.CategoryResponse createCategory(ProductDTOs.CreateCategoryRequest request, String createdByEmail) {
        log.info("Creating product category '{}' by user: {}", request.getCategoryName(), createdByEmail);

        if (productCategoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName().trim()).isPresent()) {
            log.warn("Category creation failed. Category name already exists: {}", request.getCategoryName());
            throw new DuplicateResourceException("Category already exists with name: " + request.getCategoryName());
        }

        ProductCategory category = new ProductCategory();
        category.setCategoryName(request.getCategoryName().trim());

        ProductCategory savedCategory = productCategoryRepository.save(category);
        log.info("Category created successfully with ID: {} by {}", savedCategory.getCategoryId(), createdByEmail);

        return mapToCategoryResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.CategoryResponse> getAllCategories() {
        log.info("Fetching all product categories");

        return productCategoryRepository.findAll().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public ProductDTOs.CategoryResponse getCategoryById(Long categoryId) {
        log.info("Fetching category with ID: {}", categoryId);

        ProductCategory category = productCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        return mapToCategoryResponse(category);
    }


    @Override
    public ProductDTOs.ProductResponse createProduct(ProductDTOs.CreateProductRequest request, String sellerEmail) {
        log.info("Creating product '{}' for seller email: {}", request.getPname(), sellerEmail);

        // Fetch seller directly from DB using email extracted from JWT token
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> {
                    log.warn("Product creation failed. Seller not found with email: {}", sellerEmail);
                    return new ResourceNotFoundException("Seller not found with email: " + sellerEmail);
                });

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = productCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> {
                        log.warn("Product creation failed. Category not found with ID: {}", request.getCategoryId());
                        return new ResourceNotFoundException("Category not found with id: " + request.getCategoryId());
                    });
        }

        Product product = new Product();
        product.setSeller(seller); // Set seller from JWT lookup
        product.setCategoryId(category);
        product.setPname(request.getPname());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setImageURL(request.getImageUrl());
        product.setVerified(false);

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getProductId());

        return mapToProductResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTOs.ProductResponse getProductById(Long productId) {
        log.info("Fetching product details for ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    log.warn("Product not found with ID: {}", productId);
                    return new ResourceNotFoundException("Product not found with id: " + productId);
                });

        return mapToProductResponse(product);
    }



    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.ProductResponse> getProductsBySellerId(Long sellerId) {
        log.info("Fetching all products for seller ID: {}", sellerId);

        if (!userRepository.existsById(sellerId)) {
            log.warn("Fetch failed. Seller not found with ID: {}", sellerId);
            throw new ResourceNotFoundException("Seller not found with id: " + sellerId);
        }

        return productRepository.findBySellerUserId(sellerId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.ProductResponse> getProductsByCategory(Long categoryId) {
        log.info("Fetching products for category ID: {}", categoryId);
        if (!productCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return productRepository.findByCategoryIdCategoryId(categoryId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.ProductResponse> getAllProducts() {
        log.info("Fetching all products");

        return productRepository.findAll().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.ProductResponse> getVerifiedProducts() {
        log.info("Fetching all verified products for public catalog");
        return productRepository.findByIsVerifiedTrue().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.ProductResponse> getUnverifiedProducts() {
        log.info("Fetching all pending/unverified products for admin verification");
        return productRepository.findByIsVerifiedFalse().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTOs.ProductResponse> getMyProducts(String sellerEmail) {
        log.info("Fetching inventory for seller email: {}", sellerEmail);
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with email: " + sellerEmail));

        return productRepository.findBySellerUserId(seller.getUserId()).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }



    @Override
    public ProductDTOs.ProductResponse updateProduct(Long productId, ProductDTOs.CreateProductRequest request, String sellerEmail) {
        log.info("Updating product ID: {} by seller email: {}", productId, sellerEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Security Check: Only the owner or an admin can update
        if (!product.getSeller().getEmail().equalsIgnoreCase(sellerEmail)) {
            throw new UnauthorizedAccessException("You do not have permission to update this product");
        }

        if (request.getCategoryId() != null) {
            ProductCategory category = productCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategoryId(category);
        } else {
            product.setCategoryId(null);
        }

        product.setPname(request.getPname());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setImageURL(request.getImageUrl());
        // Re-verify product if seller modifies details
        product.setVerified(false);

        Product updatedProduct = productRepository.save(product);
        return mapToProductResponse(updatedProduct);
    }

    @Override
    public ProductDTOs.ProductResponse verifyProduct(Long productId,String adminEmail, ProductDTOs.VerifyProductRequest request) {
        log.info("Verifying product ID: {} by admin email: {}", productId, adminEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    log.warn("Product verification failed. Product not found with ID: {}", productId);
                    return new ResourceNotFoundException("Product not found with id: " + productId);
                });

        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + adminEmail));

        product.setVerified(request.getIsVerified() != null ? request.getIsVerified() : true);
        product.setVerifiedBy(admin);
        product.setRemarks(request.getRemarks());

        Product verifiedProduct = productRepository.save(product);
        log.info("Product ID: {} verification status updated to: {}", productId, verifiedProduct.isVerified());

        return mapToProductResponse(verifiedProduct);
    }

    @Override
    public void deleteProduct(Long productId, String userEmail) {
        log.info("Deleting product ID: {} requested by user: {}", productId, userEmail);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Allow deletion if requested by the seller who owns it
        if (!product.getSeller().getEmail().equalsIgnoreCase(userEmail)) {
            throw new UnauthorizedAccessException("You are not authorized to delete this product");
        }

        productRepository.delete(product);
        log.info("Product ID: {} deleted successfully", productId);
    }

    private ProductDTOs.CategoryResponse mapToCategoryResponse(ProductCategory category) {
        return ProductDTOs.CategoryResponse.builder()
                    .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .build();
    }

    private ProductDTOs.ProductResponse mapToProductResponse(Product product) {
        return ProductDTOs.ProductResponse.builder()
                .productId(product.getProductId())
                .pname(product.getPname())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .imageUrl(product.getImageURL())
                .isVerified(product.isVerified())
                .categoryId(product.getCategoryId() != null ? product.getCategoryId().getCategoryId() : null)
                .categoryName(product.getCategoryId() != null ? product.getCategoryId().getCategoryName() : null)
                .sellerEmail(product.getSeller() != null ? product.getSeller().getEmail() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getName() : null)
                .remarks(product.getRemarks())
                .build();
    }
}