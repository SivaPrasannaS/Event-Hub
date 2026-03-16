package com.eventhub.services;

import com.eventhub.dto.UserRoleRequest;
import com.eventhub.enums.ERole;
import com.eventhub.exceptions.ResourceNotFoundException;
import com.eventhub.models.AuditLog;
import com.eventhub.models.Role;
import com.eventhub.models.User;
import com.eventhub.repositories.AuditLogRepository;
import com.eventhub.repositories.RoleRepository;
import com.eventhub.repositories.UserRepository;
import com.eventhub.utils.SecurityUtils;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SecurityUtils securityUtils;
    private final AuditLogRepository auditLogRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, SecurityUtils securityUtils,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.securityUtils = securityUtils;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUsers() {
        return userRepository.findAllExcludingRole(ERole.ROLE_ADMIN).stream()
            .map(this::toUserSummary)
            .toList();
    }

    public Map<String, Object> assignRole(Long id, UserRoleRequest request) {
        if (request.getRole() == ERole.ROLE_ADMIN) {
            throw new IllegalArgumentException("ROLE_ADMIN cannot be assigned through this endpoint");
        }
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Role role = roleRepository.findByName(request.getRole()).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().clear();
        user.getRoles().add(role);
        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .action("ROLE_UPDATE")
            .username(securityUtils.getCurrentUser().getUsername())
            .details("Updated role for " + saved.getUsername() + " to " + request.getRole().name())
            .build());
        return toUserSummary(saved);
    }

    public Map<String, Object> deactivateUser(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (currentUser.getId().equals(user.getId())) {
            throw new IllegalArgumentException("Admin cannot deactivate own account");
        }
        user.setActive(false);
        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .action("USER_DEACTIVATE")
            .username(currentUser.getUsername())
            .details("Deactivated user " + user.getUsername())
            .build());
        return toUserSummary(saved);
    }

    public Map<String, Object> reactivateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(true);
        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .action("USER_REACTIVATE")
            .username(securityUtils.getCurrentUser().getUsername())
            .details("Reactivated user " + user.getUsername())
            .build());
        return toUserSummary(saved);
    }

    private Map<String, Object> toUserSummary(User user) {
        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "active", user.getActive(),
            "roles", user.getRoles().stream().map(role -> role.getName().name()).toList()
        );
    }
}
