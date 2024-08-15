package com.example.product.dto;

import com.example.product.model.OrderItem;
import java.util.List;

public class OrderResponse {
    private Long id;
    private Long userId;
    private List<OrderItem> items;
    private double total;

    public OrderResponse(Long id, Long userId, List<OrderItem> items, double total) {
        this.id = id;
        this.userId = userId;
        this.items = items;
        this.total = total;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }
}