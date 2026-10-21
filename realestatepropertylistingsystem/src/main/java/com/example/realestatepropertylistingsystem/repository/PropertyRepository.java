package com.example.realestatepropertylistingsystem.repository;

import com.example.realestatepropertylistingsystem.entity.Property;
import com.example.realestatepropertylistingsystem.entity.enums.ListingType;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyStatus;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByUser_UserId(Long userId);

    List<Property> findByStatus(PropertyStatus status);

    List<Property> findByPropertyType(PropertyType propertyType);

    List<Property> findByListingType(ListingType listingType);

    List<Property> findByLocationContainingIgnoreCase(String location);

    List<Property> findByPriceBetween(BigDecimal min, BigDecimal max);

    List<Property> findByListingTypeAndStatus(ListingType listingType, PropertyStatus status);
}