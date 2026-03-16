package com.eventhub.controllers;

import com.eventhub.dto.AnalyticsSummary;
import com.eventhub.services.AnalyticsService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_ADMIN')")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public AnalyticsSummary getSummary() {
        return analyticsService.getSummary();
    }

    @GetMapping("/monthly")
    public List<AnalyticsSummary.MetricPoint> getMonthly() {
        return analyticsService.getMonthly();
    }

    @GetMapping("/by-category")
    public List<AnalyticsSummary.MetricPoint> getByCategory() {
        return analyticsService.getByCategory();
    }
}
