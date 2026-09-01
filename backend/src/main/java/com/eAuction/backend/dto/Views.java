package com.eAuction.backend.dto;

public class Views {
    // Basic fields accessible to everyone (User, Seller, Guest)
    public interface Public {}

    // Extended fields accessible ONLY to Admins
    public interface Admin extends Public {}
}