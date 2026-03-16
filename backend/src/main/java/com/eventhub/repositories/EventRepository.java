package com.eventhub.repositories;

import com.eventhub.enums.ContentStatus;
import com.eventhub.models.Event;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"organizer", "category", "venue"})
    Optional<Event> findWithDetailsById(Long id);

    long countByStatus(ContentStatus status);

    @Query("select count(e) from Event e where e.createdAt between :start and :end")
    long countCreatedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select c.name, count(e) from Event e join e.category c group by c.name order by count(e) desc")
    List<Object[]> countByCategory();

    @Query("select function('month', e.startDateTime), count(e) from Event e group by function('month', e.startDateTime) order by function('month', e.startDateTime)")
    List<Object[]> countByMonth();

    @Query("select e from Event e where e.status = 'PUBLISHED' order by e.startDateTime asc")
    List<Event> findPublishedForHomepage(Pageable pageable);
}
