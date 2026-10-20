
package com.logixgrid.taskmanager.repository;

import com.logixgrid.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import com.logixgrid.taskmanager.entity.Role;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
}
