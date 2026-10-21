package com.example.realestatepropertylistingsystem.repository;

import com.example.realestatepropertylistingsystem.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByProperty_PropertyId(Long propertyId);
}

