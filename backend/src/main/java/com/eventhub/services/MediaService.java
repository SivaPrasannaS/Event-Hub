package com.eventhub.services;

import com.eventhub.dto.MediaRequest;
import com.eventhub.dto.MediaResponse;
import com.eventhub.exceptions.AccessDeniedException;
import com.eventhub.exceptions.ResourceNotFoundException;
import com.eventhub.models.Media;
import com.eventhub.models.User;
import com.eventhub.repositories.MediaRepository;
import com.eventhub.utils.SecurityUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MediaService {
    private final MediaRepository mediaRepository;
    private final SecurityUtils securityUtils;
    private final Path uploadDir;

    public MediaService(MediaRepository mediaRepository,
                        SecurityUtils securityUtils,
                        @Value("${app.media.upload-dir:uploads}") String uploadDir) {
        this.mediaRepository = mediaRepository;
        this.securityUtils = securityUtils;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMedia(int page, int size, String search) {
        Page<Media> mediaPage = (search == null || search.isBlank())
            ? mediaRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
            : mediaRepository.findByFilenameContainingIgnoreCaseOrderByCreatedAtDesc(search, PageRequest.of(page, size));
        return Map.of(
            "items", mediaPage.getContent().stream().map(this::toResponse).toList(),
            "total", mediaPage.getTotalElements(),
            "page", mediaPage.getNumber()
        );
    }

    public MediaResponse upload(MediaRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        String originalName = StringUtils.cleanPath(request.getFile().getOriginalFilename());
        String storedName = UUID.randomUUID() + "-" + originalName.replaceAll("\\s+", "-");
        Path storedPath = uploadDir.resolve(storedName).normalize();
        if (!storedPath.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid file name");
        }

        try {
            Files.createDirectories(uploadDir);
            request.getFile().transferTo(storedPath);
        } catch (IOException exception) {
            throw new RuntimeException("Unable to store uploaded file", exception);
        }

        Media media = Media.builder()
            .filename(storedName)
            .originalName(originalName)
            .url("/uploads/" + storedName)
            .mediaType(request.getMediaType())
            .size(request.getFile().getSize())
            .uploadedBy(currentUser)
            .build();
        return toResponse(mediaRepository.save(media));
    }

    public void delete(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Media media = mediaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Media not found"));
        boolean isOwner = media.getUploadedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.hasRole("ROLE_ADMIN");
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to delete this media");
        }
        try {
            Files.deleteIfExists(uploadDir.resolve(media.getFilename()).normalize());
        } catch (IOException exception) {
            throw new RuntimeException("Unable to delete stored file", exception);
        }
        mediaRepository.delete(media);
    }

    private MediaResponse toResponse(Media media) {
        return MediaResponse.builder()
            .id(media.getId())
            .filename(media.getFilename())
            .originalName(media.getOriginalName())
            .url(media.getUrl())
            .mediaType(media.getMediaType())
            .size(media.getSize())
            .uploadedById(media.getUploadedBy().getId())
            .uploadedByUsername(media.getUploadedBy().getUsername())
            .createdAt(media.getCreatedAt())
            .build();
    }
}
