package com.eAuction.backend.service;

import com.eAuction.backend.dto.ProductDTOs;

import java.util.List;

public interface ProductService {

    // Category Operations
    ProductDTOs.CategoryResponse createCategory(ProductDTOs.CreateCategoryRequest request, String createdByEmail);
    List<ProductDTOs.CategoryResponse>  getAllCategories();

    ProductDTOs.CategoryResponse getCategoryById(Long categoryId);

    // Product Operations
    ProductDTOs.ProductResponse createProduct(ProductDTOs.CreateProductRequest request, String sellerEmail);

    ProductDTOs.ProductResponse getProductById(Long productId);

    List<ProductDTOs.ProductResponse> getAllProducts();
    List<ProductDTOs.ProductResponse> getVerifiedProducts(); // PUBLIC - For store catalog
    List<ProductDTOs.ProductResponse> getUnverifiedProducts(); // ADMIN ONLY - Verification queue
    List<ProductDTOs.ProductResponse> getMyProducts(String sellerEmail); // SELLER ONLY - Seller inventory
    List<ProductDTOs.ProductResponse> getProductsBySellerId(Long sellerId);
    List<ProductDTOs.ProductResponse> getProductsByCategory(Long categoryId);

    ProductDTOs.ProductResponse updateProduct(Long productId, ProductDTOs.CreateProductRequest request, String sellerEmail);

    ProductDTOs.ProductResponse verifyProduct(Long productId,String adminEmail, ProductDTOs.VerifyProductRequest request);

    void deleteProduct(Long productId, String userEmail);
}