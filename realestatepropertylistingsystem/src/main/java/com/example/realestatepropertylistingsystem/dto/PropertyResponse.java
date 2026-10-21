package com.example.realestatepropertylistingsystem.dto;

import com.example.realestatepropertylistingsystem.entity.enums.ListingType;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyStatus;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyType;

import java.math.BigDecimal;
import java.util.List;

public record PropertyResponse(
        Long propertyId,
        String title,
        String description,
        BigDecimal price,
        String location,
        PropertyType propertyType,
        ListingType listingType,
        PropertyStatus status,
        Long ownerId,
        String ownerName,
        List<ImageResponse> images
) {}