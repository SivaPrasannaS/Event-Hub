package com.eventhub.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AnalyticsSummary {
    long totalEvents;
    long publishedEvents;
    long draftEvents;
    long totalRsvps;
    List<MetricPoint> monthly;
    List<MetricPoint> byCategory;

    @Value
    @Builder
    public static class MetricPoint {
        String label;
        long value;
    }
}
