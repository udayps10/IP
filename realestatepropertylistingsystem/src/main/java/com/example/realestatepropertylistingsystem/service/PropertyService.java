package com.example.realestatepropertylistingsystem.service;

import com.example.realestatepropertylistingsystem.dto.ImageResponse;
import com.example.realestatepropertylistingsystem.dto.PropertyRequest;
import com.example.realestatepropertylistingsystem.dto.PropertyResponse;
import com.example.realestatepropertylistingsystem.entity.Property;
import com.example.realestatepropertylistingsystem.entity.PropertyImage;
import com.example.realestatepropertylistingsystem.entity.User;
import com.example.realestatepropertylistingsystem.entity.enums.ListingType;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyStatus;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyType;
import com.example.realestatepropertylistingsystem.exception.ResourceNotFoundException;
import com.example.realestatepropertylistingsystem.repository.PropertyImageRepository;
import com.example.realestatepropertylistingsystem.repository.PropertyRepository;
import com.example.realestatepropertylistingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;

    // ---------- CRUD ----------

    @Transactional
    public PropertyResponse create(PropertyRequest request) {
        // Owner comes from the JWT, request.userId() is ignored
        User owner = userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Property property = new Property();
        applyFields(property, request);
        property.setStatus(request.status() != null ? request.status() : PropertyStatus.AVAILABLE);
        property.setUser(owner);

        return toResponse(propertyRepository.save(property));
    }

    @Transactional(readOnly = true)
    public PropertyResponse getById(Long propertyId) {
        return toResponse(findOrThrow(propertyId));
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> getAll() {
        return propertyRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> getByUser(Long userId) {
        return propertyRepository.findByUser_UserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> search(String location, PropertyType type, ListingType listingType) {
        // Simple in-memory filtering on top of one query. Fine for a mini-project.
        List<Property> base = (location != null && !location.isBlank())
                ? propertyRepository.findByLocationContainingIgnoreCase(location)
                : propertyRepository.findAll();

        return base.stream()
                .filter(p -> type == null || p.getPropertyType() == type)
                .filter(p -> listingType == null || p.getListingType() == listingType)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PropertyResponse update(Long propertyId, PropertyRequest request) {
        Property property = findOwnedOrThrow(propertyId);
        applyFields(property, request);
        if (request.status() != null) {
            property.setStatus(request.status());
        }
        return toResponse(property); // managed entity, flushed on commit
    }

    @Transactional
    public void delete(Long propertyId) {
        Property property = findOwnedOrThrow(propertyId);

        // Remove the files from MinIO first, then the DB rows (cascade handles images)
        for (PropertyImage image : property.getImages()) {
            minioService.delete(image.getBucketName(), image.getObjectKey());
        }
        propertyRepository.delete(property);
    }

    // ---------- Images ----------

    @Transactional
    public PropertyResponse addImages(Long propertyId, List<MultipartFile> files) {
        Property property = findOwnedOrThrow(propertyId);

        for (MultipartFile file : files) {
            String objectKey = minioService.upload(file, propertyId);

            PropertyImage image = new PropertyImage();
            image.setObjectKey(objectKey);
            image.setBucketName(minioService.getBucketName());
            property.addImage(image);
        }
        propertyRepository.save(property); // cascade persists the new images
        return toResponse(property);
    }

    @Transactional
    public void deleteImage(Long propertyId, Long imageId) {
        findOwnedOrThrow(propertyId); // ownership check first

        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        if (!image.getProperty().getPropertyId().equals(propertyId)) {
            throw new IllegalArgumentException("Image " + imageId + " does not belong to property " + propertyId);
        }

        minioService.delete(image.getBucketName(), image.getObjectKey());
        image.getProperty().removeImage(image); // orphanRemoval deletes the row
    }

    // ---------- Helpers ----------

    private Property findOrThrow(Long propertyId) {
        return propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + propertyId));
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Property findOwnedOrThrow(Long propertyId) {
        Property property = findOrThrow(propertyId);
        if (!property.getUser().getEmail().equals(currentEmail())) {
            throw new AccessDeniedException("You do not own this property");
        }
        return property;
    }

    private void applyFields(Property property, PropertyRequest request) {
        property.setTitle(request.title());
        property.setDescription(request.description());
        property.setPrice(request.price());
        property.setLocation(request.location());
        property.setPropertyType(request.propertyType());
        property.setListingType(request.listingType());
    }

    private PropertyResponse toResponse(Property p) {
        List<ImageResponse> images = p.getImages().stream()
                .map(img -> new ImageResponse(
                        img.getImageId(),
                        img.getObjectKey(),
                        minioService.presignedUrl(img.getBucketName(), img.getObjectKey())))
                .toList();

        return new PropertyResponse(
                p.getPropertyId(),
                p.getTitle(),
                p.getDescription(),
                p.getPrice(),
                p.getLocation(),
                p.getPropertyType(),
                p.getListingType(),
                p.getStatus(),
                p.getUser().getUserId(),
                p.getUser().getName(),
                images);
    }
}