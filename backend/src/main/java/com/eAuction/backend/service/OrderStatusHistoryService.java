package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderStatusHistoryDTO;
import com.eAuction.backend.entity.AuctionOrder;

import java.util.List;

public interface OrderStatusHistoryService {
    void logStatusChange(AuctionOrder order, String status);
    List<OrderStatusHistoryDTO.HistoryResponse> getHistoryByOrderId(Long orderId);
}