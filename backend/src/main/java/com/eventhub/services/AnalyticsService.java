package com.eventhub.services;

import com.eventhub.dto.AnalyticsSummary;
import com.eventhub.enums.ContentStatus;
import com.eventhub.repositories.EventRepository;
import com.eventhub.repositories.RsvpRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {
    private final EventRepository eventRepository;
    private final RsvpRepository rsvpRepository;

    public AnalyticsService(EventRepository eventRepository, RsvpRepository rsvpRepository) {
        this.eventRepository = eventRepository;
        this.rsvpRepository = rsvpRepository;
    }

    public AnalyticsSummary getSummary() {
        return AnalyticsSummary.builder()
            .totalEvents(eventRepository.count())
            .publishedEvents(eventRepository.countByStatus(ContentStatus.PUBLISHED))
            .draftEvents(eventRepository.countByStatus(ContentStatus.DRAFT))
            .totalRsvps(rsvpRepository.count())
            .monthly(getMonthly())
            .byCategory(getByCategory())
            .build();
    }

    public List<AnalyticsSummary.MetricPoint> getMonthly() {
        return eventRepository.countByMonth().stream()
            .map(row -> AnalyticsSummary.MetricPoint.builder().label(String.valueOf(row[0])).value(((Number) row[1]).longValue()).build())
            .toList();
    }

    public List<AnalyticsSummary.MetricPoint> getByCategory() {
        return eventRepository.countByCategory().stream()
            .map(row -> AnalyticsSummary.MetricPoint.builder().label(String.valueOf(row[0])).value(((Number) row[1]).longValue()).build())
            .toList();
    }
}
