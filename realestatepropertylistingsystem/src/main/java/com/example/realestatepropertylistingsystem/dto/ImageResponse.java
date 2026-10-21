package com.example.realestatepropertylistingsystem.dto;

public record ImageResponse(
        Long imageId,
        String objectKey,
        String url   // presigned URL, expires in 1 hour
) {}