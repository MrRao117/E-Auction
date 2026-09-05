package com.eAuction.backend.service;

import com.eAuction.backend.dto.OrderStatusHistoryDTO;
import com.eAuction.backend.entity.AuctionOrder;
import com.eAuction.backend.entity.OrderStatusHistory;
import com.eAuction.backend.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderStatusHistoryServiceImpl implements OrderStatusHistoryService {

    private final OrderStatusHistoryRepository historyRepository;

    @Override
    @Transactional
    public void logStatusChange(AuctionOrder order, String status) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);

        historyRepository.save(history);
        log.info("Logged status history transition to '{}' for Order ID: {}", status, order.getOrderId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryDTO.HistoryResponse> getHistoryByOrderId(Long orderId) {
        return historyRepository.findByOrder_OrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(h -> OrderStatusHistoryDTO.HistoryResponse.builder()
                        .historyId(h.getHistoryId())
                        .orderId(h.getOrder().getOrderId())
                        .status(h.getStatus())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}