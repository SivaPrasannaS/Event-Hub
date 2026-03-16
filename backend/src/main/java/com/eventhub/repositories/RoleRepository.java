package com.eventhub.repositories;

import com.eventhub.enums.ERole;
import com.eventhub.models.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    boolean existsByName(ERole name);

    Optional<Role> findByName(ERole name);
}
