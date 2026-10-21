package com.example.realestatepropertylistingsystem.dto;

public record UserResponse(
        Long userId,
        String name,
        String email,
        String phone
) {}