package com.eAuction.backend.service;

import com.eAuction.backend.dto.AddressDTOs;
import java.util.List;

public interface AddressService {

    AddressDTOs.AddressResponse addAddress(String userEmail, AddressDTOs.CreateAddressRequest request);

    List<AddressDTOs.AddressResponse> getAddressesByUserEmail(String userEmail);

    AddressDTOs.AddressResponse getAddressById(Long addressId, String userEmail);

    AddressDTOs.AddressResponse updateAddress(Long addressId, AddressDTOs.CreateAddressRequest request, String userEmail);

    void deleteAddress(Long addressId, String userEmail);
}