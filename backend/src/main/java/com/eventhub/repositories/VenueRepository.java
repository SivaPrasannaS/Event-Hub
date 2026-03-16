package com.eventhub.repositories;

import com.eventhub.models.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    Page<Venue> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
