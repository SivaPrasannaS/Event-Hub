package com.eventhub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:eventhubtest;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false",
    "app.media.upload-dir=target/test-uploads"
})
@AutoConfigureMockMvc
class EventHubApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("day_5_register_valid_data_returns_created")
    void day_5_register_valid_data_returns_created() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupPayload(uniqueUsername(), "User@123"))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("day_5_register_duplicate_username_returns_conflict")
    void day_5_register_duplicate_username_returns_conflict() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupPayload(username, "User@123"))))
            .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("day_5_register_blank_username_returns_validation_error")
    void day_5_register_blank_username_returns_validation_error() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"\",\"password\":\"User@123\"}"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.fieldErrors.username").exists());
    }

    @Test
    @DisplayName("day_5_register_blank_password_returns_validation_error")
    void day_5_register_blank_password_returns_validation_error() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"johnny\",\"password\":\"\"}"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    @DisplayName("day_5_login_valid_credentials_returns_tokens")
    void day_5_login_valid_credentials_returns_tokens() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginPayload(username, "User@123"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    @DisplayName("day_5_login_wrong_password_returns_unauthorized")
    void day_5_login_wrong_password_returns_unauthorized() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginPayload(username, "Wrong@123"))))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("day_5_login_unknown_user_returns_unauthorized")
    void day_5_login_unknown_user_returns_unauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginPayload(uniqueUsername(), "User@123"))))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("day_5_refresh_valid_refresh_token_returns_access_token")
    void day_5_refresh_valid_refresh_token_returns_access_token() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        JsonNode login = loginUser(username, "User@123");
        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", login.get("refreshToken").asText()))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("day_4_get_events_public_returns_ok")
    void day_4_get_events_public_returns_ok() throws Exception {
        mockMvc.perform(get("/api/events"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_9_get_events_filter_by_category_returns_filtered_results")
    void day_9_get_events_filter_by_category_returns_filtered_results() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryOne = createCategory(adminToken(admin), "Music");
        long categoryTwo = createCategory(adminToken(admin), "Sports");
        createEvent(adminToken(admin), categoryOne, "Live Jazz Night", "PUBLISHED", null, nextDate(10), nextDate(11));
        createEvent(adminToken(admin), categoryTwo, "Cricket Meetup", "PUBLISHED", null, nextDate(12), nextDate(13));

        mockMvc.perform(get("/api/events").param("categoryId", String.valueOf(categoryOne)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].categoryId").value(categoryOne));
    }

    @Test
    @DisplayName("day_9_get_events_filter_by_month_returns_filtered_results")
    void day_9_get_events_filter_by_month_returns_filtered_results() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Workshops");
        LocalDateTime june = LocalDateTime.of(2026, 6, 12, 10, 0);
        LocalDateTime july = LocalDateTime.of(2026, 7, 12, 10, 0);
        createEvent(adminToken(admin), categoryId, "June Workshop", "PUBLISHED", null, june, june.plusHours(2));
        createEvent(adminToken(admin), categoryId, "July Workshop", "PUBLISHED", null, july, july.plusHours(2));

        mockMvc.perform(get("/api/events").param("month", "6"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].title").value("June Workshop"));
    }

    @Test
    @DisplayName("day_4_get_published_event_public_returns_ok")
    void day_4_get_published_event_public_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Meetups");
        long eventId = createEvent(adminToken(admin), categoryId, "Open House", "PUBLISHED", null, nextDate(2), nextDate(3));
        mockMvc.perform(get("/api/events/" + eventId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(eventId));
    }

    @Test
    @DisplayName("day_11_get_draft_event_as_owner_returns_ok")
    void day_11_get_draft_event_as_owner_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Tech");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));
        long eventId = createEvent(token, categoryId, "Owner Draft", "DRAFT", null, nextDate(4), nextDate(5));
        mockMvc.perform(get("/api/events/" + eventId).header("Authorization", bearer(token)))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_get_draft_event_as_other_user_returns_forbidden")
    void day_11_get_draft_event_as_other_user_returns_forbidden() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Art");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "Private Draft", "DRAFT", null, nextDate(6), nextDate(7));
        String other = uniqueUsername();
        registerUser(other, "User@123");
        String otherToken = adminToken(loginUser(other, "User@123"));

        mockMvc.perform(get("/api/events/" + eventId).header("Authorization", bearer(otherToken)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_4_create_event_as_user_saves_draft")
    void day_4_create_event_as_user_saves_draft() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Business");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));

        mockMvc.perform(post("/api/events")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "Startup Mixer", "DRAFT", nextDate(8), nextDate(9))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("day_4_create_event_published_request_by_user_forces_draft")
    void day_4_create_event_published_request_by_user_forces_draft() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Career");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));

        mockMvc.perform(post("/api/events")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "Forced Draft", "PUBLISHED", nextDate(10), nextDate(11))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("day_5_create_event_unauthenticated_returns_unauthorized")
    void day_5_create_event_unauthenticated_returns_unauthorized() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Health");
        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "Public Health Fair", "DRAFT", nextDate(12), nextDate(13))))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("day_4_create_event_missing_title_returns_validation_error")
    void day_4_create_event_missing_title_returns_validation_error() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Finance");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));

        Map<String, Object> payload = baseEventMap(categoryId, nextDate(14), nextDate(15));
        payload.put("title", "");
        mockMvc.perform(post("/api/events")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    @DisplayName("day_4_create_event_short_description_returns_validation_error")
    void day_4_create_event_short_description_returns_validation_error() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Gaming");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));

        Map<String, Object> payload = baseEventMap(categoryId, nextDate(16), nextDate(17));
        payload.put("title", "Short Description Test");
        payload.put("description", "Too short");
        mockMvc.perform(post("/api/events")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.fieldErrors.description").exists());
    }

    @Test
    @DisplayName("day_4_update_event_as_owner_returns_ok")
    void day_4_update_event_as_owner_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Cooking");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));
        long eventId = createEvent(token, categoryId, "Dinner Club", "DRAFT", null, nextDate(18), nextDate(19));

        mockMvc.perform(put("/api/events/" + eventId)
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "Dinner Club Updated", "DRAFT", nextDate(20), nextDate(21))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Dinner Club Updated"));
    }

    @Test
    @DisplayName("day_11_update_event_as_non_owner_returns_forbidden")
    void day_11_update_event_as_non_owner_returns_forbidden() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Culture");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "Owner Event", "DRAFT", null, nextDate(22), nextDate(23));
        String other = uniqueUsername();
        registerUser(other, "User@123");
        String otherToken = adminToken(loginUser(other, "User@123"));

        mockMvc.perform(put("/api/events/" + eventId)
                .header("Authorization", bearer(otherToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "Unauthorized Update", "DRAFT", nextDate(24), nextDate(25))))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_11_update_event_as_manager_returns_ok")
    void day_11_update_event_as_manager_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Cinema");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "Film Night", "DRAFT", null, nextDate(26), nextDate(27));
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(put("/api/events/" + eventId)
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "Film Night Manager Edit", "PUBLISHED", nextDate(28), nextDate(29))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Film Night Manager Edit"));
    }

    @Test
    @DisplayName("day_11_update_event_as_admin_returns_ok")
    void day_11_update_event_as_admin_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "SportsTalk");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "SportsTalk Event", "DRAFT", null, nextDate(30), nextDate(31));

        mockMvc.perform(put("/api/events/" + eventId)
                .header("Authorization", bearer(adminToken(admin)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventPayload(categoryId, "SportsTalk Edited", "PUBLISHED", nextDate(32), nextDate(33))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("SportsTalk Edited"));
    }

    @Test
    @DisplayName("day_11_publish_event_as_user_returns_forbidden")
    void day_11_publish_event_as_user_returns_forbidden() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Poetry");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String userToken = adminToken(loginUser(username, "User@123"));
        long eventId = createEvent(userToken, categoryId, "Poetry Circle", "DRAFT", null, nextDate(34), nextDate(35));

        mockMvc.perform(patch("/api/events/" + eventId + "/publish")
                .with(csrf())
                .header("Authorization", bearer(userToken)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_11_publish_event_as_manager_returns_ok")
    void day_11_publish_event_as_manager_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Books");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "Book Exchange", "DRAFT", null, nextDate(36), nextDate(37));
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(patch("/api/events/" + eventId + "/publish")
                .with(csrf())
                .header("Authorization", bearer(managerToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    @Test
    @DisplayName("day_11_delete_event_as_owner_returns_ok")
    void day_11_delete_event_as_owner_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Community");
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));
        long eventId = createEvent(token, categoryId, "Cleanup Drive", "DRAFT", null, nextDate(38), nextDate(39));

        mockMvc.perform(delete("/api/events/" + eventId)
                .header("Authorization", bearer(token))
                .with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_delete_event_as_manager_on_other_users_event_returns_ok")
    void day_11_delete_event_as_manager_on_other_users_event_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Volunteering");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "Volunteer Meet", "DRAFT", null, nextDate(40), nextDate(41));
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(delete("/api/events/" + eventId)
                .header("Authorization", bearer(managerToken))
                .with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_delete_event_as_admin_on_any_event_returns_ok")
    void day_11_delete_event_as_admin_on_any_event_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Outdoors");
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long eventId = createEvent(ownerToken, categoryId, "Trail Walk", "DRAFT", null, nextDate(42), nextDate(43));

        mockMvc.perform(delete("/api/events/" + eventId)
                .header("Authorization", bearer(adminToken(admin)))
                .with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_4_rsvp_event_as_user_returns_created")
    void day_4_rsvp_event_as_user_returns_created() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Networking");
        long eventId = createEvent(adminToken(admin), categoryId, "Industry Mixer", "PUBLISHED", null, nextDate(44), nextDate(45));
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String userToken = adminToken(loginUser(username, "User@123"));

        mockMvc.perform(post("/api/events/" + eventId + "/rsvp")
                .header("Authorization", bearer(userToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"GOING\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("GOING"));
    }

    @Test
    @DisplayName("day_5_rsvp_event_unauthenticated_returns_unauthorized")
    void day_5_rsvp_event_unauthenticated_returns_unauthorized() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Public Talks");
        long eventId = createEvent(adminToken(admin), categoryId, "Open Lecture", "PUBLISHED", null, nextDate(46), nextDate(47));
        mockMvc.perform(post("/api/events/" + eventId + "/rsvp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"GOING\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("day_4_get_rsvp_as_owner_returns_ok")
    void day_4_get_rsvp_as_owner_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Science");
        long eventId = createEvent(adminToken(admin), categoryId, "Science Fair", "PUBLISHED", null, nextDate(48), nextDate(49));
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String userToken = adminToken(loginUser(username, "User@123"));
        saveRsvp(userToken, eventId, "MAYBE");

        mockMvc.perform(get("/api/events/" + eventId + "/rsvp").header("Authorization", bearer(userToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("MAYBE"));
    }

    @Test
    @DisplayName("day_4_cancel_rsvp_as_user_returns_ok")
    void day_4_cancel_rsvp_as_user_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Education");
        long eventId = createEvent(adminToken(admin), categoryId, "Study Circle", "PUBLISHED", null, nextDate(50), nextDate(51));
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String userToken = adminToken(loginUser(username, "User@123"));
        saveRsvp(userToken, eventId, "GOING");

        mockMvc.perform(delete("/api/events/" + eventId + "/rsvp").header("Authorization", bearer(userToken)).with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_rsvp_to_unpublished_event_returns_forbidden")
    void day_11_rsvp_to_unpublished_event_returns_forbidden() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Debate");
        long eventId = createEvent(adminToken(admin), categoryId, "Closed Debate", "DRAFT", null, nextDate(52), nextDate(53));
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String userToken = adminToken(loginUser(username, "User@123"));

        mockMvc.perform(post("/api/events/" + eventId + "/rsvp")
                .header("Authorization", bearer(userToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"GOING\"}"))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_4_get_venues_authenticated_returns_ok")
    void day_4_get_venues_authenticated_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        mockMvc.perform(get("/api/venues").header("Authorization", bearer(adminToken(admin))))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_create_venue_as_manager_returns_created")
    void day_11_create_venue_as_manager_returns_created() throws Exception {
        JsonNode admin = loginAdmin();
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(post("/api/venues")
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(venuePayload("Town Hall")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Town Hall"));
    }

    @Test
    @DisplayName("day_11_create_venue_as_user_returns_forbidden")
    void day_11_create_venue_as_user_returns_forbidden() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));
        mockMvc.perform(post("/api/venues")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(venuePayload("User Hall")))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_11_delete_venue_as_manager_returns_ok")
    void day_11_delete_venue_as_manager_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long venueId = createVenue(adminToken(admin), "Manager Venue");
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(delete("/api/venues/" + venueId).header("Authorization", bearer(managerToken)).with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_4_get_media_authenticated_returns_ok")
    void day_4_get_media_authenticated_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        mockMvc.perform(get("/api/media").header("Authorization", bearer(adminToken(admin))))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_5_get_media_unauthenticated_returns_unauthorized")
    void day_5_get_media_unauthenticated_returns_unauthorized() throws Exception {
        mockMvc.perform(get("/api/media"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("day_4_upload_media_as_user_returns_created")
    void day_4_upload_media_as_user_returns_created() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));
        mockMvc.perform(mediaUploadRequest(token, "brochure.pdf"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.originalName").value("brochure.pdf"))
            .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString("/uploads/")));
    }

    @Test
    @DisplayName("day_11_delete_media_as_non_owner_returns_forbidden")
    void day_11_delete_media_as_non_owner_returns_forbidden() throws Exception {
        String owner = uniqueUsername();
        registerUser(owner, "User@123");
        String ownerToken = adminToken(loginUser(owner, "User@123"));
        long mediaId = uploadMedia(ownerToken, "owner-file.pdf");
        String other = uniqueUsername();
        registerUser(other, "User@123");
        String otherToken = adminToken(loginUser(other, "User@123"));

        mockMvc.perform(delete("/api/media/" + mediaId).header("Authorization", bearer(otherToken)).with(csrf()))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_4_get_categories_public_returns_ok")
    void day_4_get_categories_public_returns_ok() throws Exception {
        mockMvc.perform(get("/api/categories"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_create_category_as_manager_returns_created")
    void day_11_create_category_as_manager_returns_created() throws Exception {
        JsonNode admin = loginAdmin();
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(post("/api/categories")
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryPayload("Manager Category")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Manager Category"));
    }

    @Test
    @DisplayName("day_11_create_category_as_user_returns_forbidden")
    void day_11_create_category_as_user_returns_forbidden() throws Exception {
        String username = uniqueUsername();
        registerUser(username, "User@123");
        String token = adminToken(loginUser(username, "User@123"));
        mockMvc.perform(post("/api/categories")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryPayload("User Category")))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_11_update_category_as_manager_returns_ok")
    void day_11_update_category_as_manager_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Old Category");
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(put("/api/categories/" + categoryId)
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryPayload("Updated Category")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Category"));
    }

    @Test
    @DisplayName("day_11_delete_category_as_admin_returns_ok")
    void day_11_delete_category_as_admin_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        long categoryId = createCategory(adminToken(admin), "Delete Category");
        mockMvc.perform(delete("/api/categories/" + categoryId).header("Authorization", bearer(adminToken(admin))).with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_get_users_as_admin_returns_ok")
    void day_11_get_users_as_admin_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(adminToken(admin))))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("day_11_get_users_as_manager_returns_forbidden")
    void day_11_get_users_as_manager_returns_forbidden() throws Exception {
        JsonNode admin = loginAdmin();
        String manager = uniqueUsername();
        registerUser(manager, "User@123");
        assignRole(adminToken(admin), userId(manager, "User@123"), "ROLE_MANAGER");
        String managerToken = adminToken(loginUser(manager, "User@123"));

        mockMvc.perform(get("/api/admin/users").header("Authorization", bearer(managerToken)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("day_11_assign_role_as_admin_returns_ok")
    void day_11_assign_role_as_admin_returns_ok() throws Exception {
        JsonNode admin = loginAdmin();
        String username = uniqueUsername();
        registerUser(username, "User@123");
        long userId = userId(username, "User@123");

        mockMvc.perform(put("/api/admin/users/" + userId + "/role")
                .header("Authorization", bearer(adminToken(admin)))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"role\":\"ROLE_MANAGER\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.roles[0]").value("ROLE_MANAGER"));
    }

    @Test
    @DisplayName("day_11_deactivate_self_as_admin_returns_bad_request")
    void day_11_deactivate_self_as_admin_returns_bad_request() throws Exception {
        JsonNode admin = loginAdmin();
        mockMvc.perform(delete("/api/admin/users/" + admin.get("id").asLong())
                .header("Authorization", bearer(adminToken(admin)))
                .with(csrf()))
            .andExpect(status().isBadRequest());
    }

    private Map<String, String> signupPayload(String username, String password) {
        return Map.of("username", username, "password", password);
    }

    private Map<String, String> loginPayload(String username, String password) {
        return Map.of("username", username, "password", password);
    }

    private String uniqueUsername() {
        return "user_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private void registerUser(String username, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupPayload(username, password))))
            .andExpect(status().isCreated());
    }

    private JsonNode loginUser(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginPayload(username, password))))
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private JsonNode loginAdmin() throws Exception {
        return loginUser("admin", "Admin@123");
    }

    private String adminToken(JsonNode node) {
        return node.get("accessToken").asText();
    }

    private long userId(String username, String password) throws Exception {
        return loginUser(username, password).get("id").asLong();
    }

    private long createCategory(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/categories")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(categoryPayload(name)))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void assignRole(String adminToken, long userId, String role) throws Exception {
        mockMvc.perform(put("/api/admin/users/" + userId + "/role")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"role\":\"" + role + "\"}"))
            .andExpect(status().isOk());
    }

    private long createVenue(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/venues")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(venuePayload(name)))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private long createEvent(String token, long categoryId, String title, String status, Long venueId, LocalDateTime start, LocalDateTime end) throws Exception {
        Map<String, Object> payload = baseEventMap(categoryId, start, end);
        payload.put("title", title);
        payload.put("status", status);
        if (venueId != null) {
            payload.put("venueId", venueId);
        }
        MvcResult result = mockMvc.perform(post("/api/events")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void saveRsvp(String token, long eventId, String statusValue) throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/rsvp")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"" + statusValue + "\"}"))
            .andExpect(status().isCreated());
    }

    private MockMultipartFile mediaFile(String fileName) {
        return new MockMultipartFile("file", fileName, MediaType.TEXT_PLAIN_VALUE, "sample-file".getBytes());
    }

    private MockMultipartHttpServletRequestBuilder mediaUploadRequest(String token, String fileName) {
        MockMultipartHttpServletRequestBuilder builder = multipart("/api/media");
        builder.file(mediaFile(fileName));
        builder.param("mediaType", "DOCUMENT");
        builder.header("Authorization", bearer(token));
        return builder;
    }

    private long uploadMedia(String token, String fileName) throws Exception {
        MvcResult result = mockMvc.perform(mediaUploadRequest(token, fileName))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private String categoryPayload(String name) throws Exception {
        return objectMapper.writeValueAsString(Map.of("name", name, "description", name + " description"));
    }

    private String venuePayload(String name) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
            "name", name,
            "address", "123 Main Street",
            "city", "Chennai",
            "country", "India",
            "capacity", 120
        ));
    }

    private String eventPayload(long categoryId, String title, String statusValue, LocalDateTime start, LocalDateTime end) throws Exception {
        Map<String, Object> payload = baseEventMap(categoryId, start, end);
        payload.put("title", title);
        payload.put("status", statusValue);
        return objectMapper.writeValueAsString(payload);
    }

    private Map<String, Object> baseEventMap(long categoryId, LocalDateTime start, LocalDateTime end) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", "Event Title");
        payload.put("description", "This is a sufficiently long description for the event.");
        payload.put("startDateTime", start.format(DateTimeFormatter.ISO_DATE_TIME));
        payload.put("endDateTime", end.format(DateTimeFormatter.ISO_DATE_TIME));
        payload.put("status", "DRAFT");
        payload.put("categoryId", categoryId);
        payload.put("tags", "community,networking");
        payload.put("capacity", 80);
        return payload;
    }

    private LocalDateTime nextDate(int plusDays) {
        return LocalDateTime.now().plusDays(plusDays).withNano(0);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
