package com.eAuction.backend.controller;

import com.eAuction.backend.dto.ProductDTOs;
import com.eAuction.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ==========================================
    // CATEGORY ENDPOINTS
    // ==========================================

    @PostMapping("/categories/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<ProductDTOs.CategoryResponse> createCategory(
            @Valid @RequestBody ProductDTOs.CreateCategoryRequest request,
            Authentication authentication
    ) {
        String currentUserEmail = authentication.getName();
        return new ResponseEntity<>(productService.createCategory(request, currentUserEmail), HttpStatus.CREATED);
    }

    @GetMapping("/categories/all")
    public ResponseEntity<List<ProductDTOs.CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<ProductDTOs.CategoryResponse> getCategoryById(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getCategoryById(categoryId));
    }


    // ==========================================
    // PRODUCT GET ENDPOINTS (SPECIFIC PATHS FIRST)
    // ==========================================

    @GetMapping
    public ResponseEntity<List<ProductDTOs.ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/verified")
    public ResponseEntity<List<ProductDTOs.ProductResponse>> getVerifiedProducts() {
        return ResponseEntity.ok(productService.getVerifiedProducts());
    }

    @GetMapping("/unverified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTOs.ProductResponse>> getUnverifiedProducts() {
        return ResponseEntity.ok(productService.getUnverifiedProducts());
    }

    @GetMapping("/my-products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<ProductDTOs.ProductResponse>> getMyProducts(Authentication authentication) {
        String sellerEmail = authentication.getName();
        return ResponseEntity.ok(productService.getMyProducts(sellerEmail));
    }

    @GetMapping("/category/{categoryId}/products")
    public ResponseEntity<List<ProductDTOs.ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    // --- DYNAMIC PATH VARIABLE GET (MUST BE LAST) ---
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTOs.ProductResponse> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }


    // ==========================================
    // PRODUCT POST/PUT/DELETE ENDPOINTS
    // ==========================================

    @PostMapping("/add")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDTOs.ProductResponse> createProduct(
            @Valid @RequestBody ProductDTOs.CreateProductRequest request,
            Authentication authentication
    ) {
        String sellerEmail = authentication.getName();
        return new ResponseEntity<>(productService.createProduct(request, sellerEmail), HttpStatus.CREATED);
    }

    @PutMapping("/{productId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTOs.ProductResponse> verifyProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductDTOs.VerifyProductRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(productService.verifyProduct(productId, adminEmail, request));
    }

    @PutMapping("/{productId}/update")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDTOs.ProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductDTOs.CreateProductRequest request,
            Authentication authentication
    ) {
        String sellerEmail = authentication.getName();
        return ResponseEntity.ok(productService.updateProduct(productId, request, sellerEmail));
    }

    @DeleteMapping("/{productId}/delete")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId, Authentication authentication) {
        String userEmail = authentication.getName();
        productService.deleteProduct(productId, userEmail);
        return ResponseEntity.noContent().build();
    }
}