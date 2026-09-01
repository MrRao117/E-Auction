package com.eAuction.backend.service;

import com.eAuction.backend.dto.AddressDTOs;
import com.eAuction.backend.entity.Address;
import com.eAuction.backend.entity.User;
import com.eAuction.backend.exception.ResourceNotFoundException;
import com.eAuction.backend.exception.UnauthorizedAccessException;
import com.eAuction.backend.repository.AddressRepository;
import com.eAuction.backend.repository.AdminRepository;
import com.eAuction.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    @Override
    public AddressDTOs.AddressResponse addAddress(String userEmail, AddressDTOs.CreateAddressRequest request) {
        log.info("Adding new address for user email: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault());

        if (shouldBeDefault) {
            unsetExistingDefaults(user.getUserId());
        }

        Address address = new Address();
        address.setUser(user);
        address.setHouseNo(request.getHouseNo());
        address.setVillage_city(request.getVillageCity());
        address.setDistrict(request.getDistrict());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setIsDefault(shouldBeDefault);

        Address savedAddress = addressRepository.save(address);
        return mapToAddressResponse(savedAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressDTOs.AddressResponse> getAddressesByUserEmail(String userEmail) {
        log.info("Fetching addresses for user email: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return addressRepository.findByUserUserId(user.getUserId()).stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AddressDTOs.AddressResponse getAddressById(Long addressId, String userEmail) {
        log.info("Fetching address ID: {} for user: {}", addressId, userEmail);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        validateAddressOwnership(address, userEmail);

        return mapToAddressResponse(address);
    }

    @Override
    public AddressDTOs.AddressResponse updateAddress(Long addressId, AddressDTOs.CreateAddressRequest request, String userEmail) {
        log.info("Updating address ID: {} for user: {}", addressId, userEmail);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        validateAddressOwnership(address, userEmail);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetExistingDefaults(address.getUser().getUserId());
            address.setIsDefault(true);
        } else if (request.getIsDefault() != null) {
            address.setIsDefault(false);
        }

        address.setHouseNo(request.getHouseNo());
        address.setVillage_city(request.getVillageCity());
        address.setDistrict(request.getDistrict());
        address.setState(request.getState());
        address.setPincode(request.getPincode());

        Address updatedAddress = addressRepository.save(address);
        return mapToAddressResponse(updatedAddress);
    }

    @Override
    public void deleteAddress(Long addressId, String userEmail) {
        log.info("Deleting address ID: {} by user: {}", addressId, userEmail);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        validateAddressOwnership(address, userEmail);

        addressRepository.delete(address);
    }

    // Helper: Validates ownership or checks if requester is in Admin table
    private void validateAddressOwnership(Address address, String email) {
        boolean isAdmin = adminRepository.existsByEmail(email);
        if (isAdmin) {
            return;
        }


        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && address.getUser().getUserId().equals(userOpt.get().getUserId())) {
            return;
        }


        throw new UnauthorizedAccessException("You are not authorized to perform actions on this address.");
    }

    private void unsetExistingDefaults(Long userId) {
        List<Address> addresses = addressRepository.findByUserUserId(userId);
        for (Address addr : addresses) {
            if (Boolean.TRUE.equals(addr.getIsDefault())) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }

    private AddressDTOs.AddressResponse mapToAddressResponse(Address address) {
        return AddressDTOs.AddressResponse.builder()
                .addressId(address.getAddressId())
                .houseNo(address.getHouseNo())
                .villageCity(address.getVillage_city())
                .district(address.getDistrict())
                .state(address.getState())
                .pincode(address.getPincode())
                .isDefault(address.getIsDefault())
                .build();
    }
}