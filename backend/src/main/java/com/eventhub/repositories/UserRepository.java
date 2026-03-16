package com.eventhub.repositories;

import com.eventhub.models.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByUsername(String username);

    @Query("""
        select distinct u
        from User u
        join fetch u.roles r
        where not exists (
            select 1 from u.roles excludedRole where excludedRole.name = :roleName
        )
        order by u.active desc, u.username asc
        """)
    List<User> findAllExcludingRole(@Param("roleName") com.eventhub.enums.ERole roleName);
}
