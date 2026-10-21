package com.example.realestatepropertylistingsystem.dto;

import com.example.realestatepropertylistingsystem.entity.enums.ListingType;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyStatus;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PropertyRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @NotNull @Positive BigDecimal price,
        @NotBlank @Size(max = 255) String location,
        @NotNull PropertyType propertyType,
        @NotNull ListingType listingType,
        PropertyStatus status,   // optional; defaults to AVAILABLE on create
        Long userId              // required on create, ignored on update
) {}