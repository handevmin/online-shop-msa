package com.example.product.service;

import com.example.product.dto.OrderRequest;
import com.example.product.dto.OrderResponse;
import com.example.product.model.Order;
import com.example.product.model.OrderItem;
import com.example.product.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setUserId(orderRequest.getUserId());
        order.setItems(convertToOrderItems(orderRequest.getItems()));
        order.setTotal(calculateTotal(orderRequest.getItems()));

        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    private List<OrderItem> convertToOrderItems(List<OrderRequest.OrderItem> requestItems) {
        return requestItems.stream()
                .map(item -> new OrderItem(item.getProductId(), item.getQuantity(), item.getPrice()))
                .collect(Collectors.toList());
    }

    private double calculateTotal(List<OrderRequest.OrderItem> items) {
        return items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getItems(),
                order.getTotal()
        );
    }
}