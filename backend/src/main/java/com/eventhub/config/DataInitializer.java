package com.eventhub.config;

import com.eventhub.enums.ERole;
import com.eventhub.models.Role;
import com.eventhub.models.User;
import com.eventhub.repositories.RoleRepository;
import com.eventhub.repositories.UserRepository;
import java.util.Set;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedRole(ERole.ROLE_USER);
        seedRole(ERole.ROLE_MANAGER);
        seedRole(ERole.ROLE_ADMIN);

        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("Admin@123"))
                .active(true)
                .roles(Set.of(roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow()))
                .build();
            userRepository.save(admin);
        }
    }

    private void seedRole(ERole roleName) {
        if (!roleRepository.existsByName(roleName)) {
            roleRepository.save(Role.builder().name(roleName).build());
        }
    }
}
