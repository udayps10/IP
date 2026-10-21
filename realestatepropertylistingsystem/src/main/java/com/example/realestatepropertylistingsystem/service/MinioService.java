
package com.example.realestatepropertylistingsystem.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public String getBucketName() {
        return bucketName;
    }

    /** Uploads the file and returns the generated object key. */
    public String upload(MultipartFile file, Long propertyId) {
        String contentType = file.getContentType();
        if (file.isEmpty() || contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only non-empty image files are allowed");
        }

        String objectKey = "properties/" + propertyId + "/" + UUID.randomUUID() + extensionOf(file);

        try (InputStream in = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(in, file.getSize(), -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image to MinIO", e);
        }
        return objectKey;
    }

    public void delete(String bucket, String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder().bucket(bucket).object(objectKey).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image from MinIO", e);
        }
    }

    /** Temporary link the browser can use to display the image (valid 1 hour). */
    public String presignedUrl(String bucket, String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(objectKey)
                            .expiry(1, TimeUnit.HOURS)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate image URL", e);
        }
    }

    private String extensionOf(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null && name.lastIndexOf('.') >= 0) {
            return name.substring(name.lastIndexOf('.')).toLowerCase();
        }
        return "";
    }
}