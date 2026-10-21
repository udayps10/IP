
package com.example.realestatepropertylistingsystem.controller;

import com.example.realestatepropertylistingsystem.dto.PropertyRequest;
import com.example.realestatepropertylistingsystem.dto.PropertyResponse;
import com.example.realestatepropertylistingsystem.entity.enums.ListingType;
import com.example.realestatepropertylistingsystem.entity.enums.PropertyType;
import com.example.realestatepropertylistingsystem.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public ResponseEntity<PropertyResponse> create(@Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.create(request));
    }

    @GetMapping
    public List<PropertyResponse> getAll() {
        return propertyService.getAll();
    }

    // e.g. /api/properties/search?location=andheri&type=APARTMENT&listingType=RENT (all optional)
    @GetMapping("/search")
    public List<PropertyResponse> search(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) ListingType listingType) {
        return propertyService.search(location, type, listingType);
    }

    @GetMapping("/user/{userId}")
    public List<PropertyResponse> getByUser(@PathVariable Long userId) {
        return propertyService.getByUser(userId);
    }

    @GetMapping("/{propertyId}")
    public PropertyResponse getById(@PathVariable Long propertyId) {
        return propertyService.getById(propertyId);
    }

    @PutMapping("/{propertyId}")
    public PropertyResponse update(@PathVariable Long propertyId,
                                   @Valid @RequestBody PropertyRequest request) {
        return propertyService.update(propertyId, request);
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> delete(@PathVariable Long propertyId) {
        propertyService.delete(propertyId);
        return ResponseEntity.noContent().build();
    }

    // Postman: Body -> form-data, key "files" (type File), add multiple rows for multiple images
    @PostMapping(value = "/{propertyId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyResponse> uploadImages(@PathVariable Long propertyId,
                                                         @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.addImages(propertyId, files));
    }

    @DeleteMapping("/{propertyId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long propertyId, @PathVariable Long imageId) {
        propertyService.deleteImage(propertyId, imageId);
        return ResponseEntity.noContent().build();
    }
}