package com.eventhub.repositories;

import com.eventhub.models.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, Long> {
    @EntityGraph(attributePaths = "uploadedBy")
    Page<Media> findByFilenameContainingIgnoreCaseOrderByCreatedAtDesc(String filename, Pageable pageable);

    @EntityGraph(attributePaths = "uploadedBy")
    Page<Media> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
