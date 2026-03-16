package com.eventhub.repositories;

import com.eventhub.models.Rsvp;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RsvpRepository extends JpaRepository<Rsvp, Long> {
    Optional<Rsvp> findByEventIdAndUserId(Long eventId, Long userId);

    long countByEventId(Long eventId);
}
