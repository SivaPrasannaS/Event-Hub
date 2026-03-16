package com.eventhub.services;

import com.eventhub.dto.VenueRequest;
import com.eventhub.dto.VenueResponse;
import com.eventhub.exceptions.ResourceNotFoundException;
import com.eventhub.models.Venue;
import com.eventhub.repositories.VenueRepository;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class VenueService {
    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getVenues(int page, int size) {
        Page<Venue> venuePage = venueRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return Map.of(
            "items", venuePage.getContent().stream().map(this::toResponse).toList(),
            "total", venuePage.getTotalElements(),
            "page", venuePage.getNumber()
        );
    }

    public VenueResponse createVenue(VenueRequest request) {
        Venue venue = Venue.builder()
            .name(request.getName().trim())
            .address(request.getAddress().trim())
            .city(request.getCity().trim())
            .country(request.getCountry().trim())
            .capacity(request.getCapacity())
            .build();
        return toResponse(venueRepository.save(venue));
    }

    public VenueResponse updateVenue(Long id, VenueRequest request) {
        Venue venue = venueRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        venue.setName(request.getName().trim());
        venue.setAddress(request.getAddress().trim());
        venue.setCity(request.getCity().trim());
        venue.setCountry(request.getCountry().trim());
        venue.setCapacity(request.getCapacity());
        return toResponse(venueRepository.save(venue));
    }

    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        venueRepository.delete(venue);
    }

    private VenueResponse toResponse(Venue venue) {
        return VenueResponse.builder()
            .id(venue.getId())
            .name(venue.getName())
            .address(venue.getAddress())
            .city(venue.getCity())
            .country(venue.getCountry())
            .capacity(venue.getCapacity())
            .createdAt(venue.getCreatedAt())
            .build();
    }
}
