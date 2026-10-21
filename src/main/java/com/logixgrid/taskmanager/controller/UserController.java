
package com.logixgrid.taskmanager.controller;

import com.logixgrid.taskmanager.dto.UserOption;
import com.logixgrid.taskmanager.entity.User;
import com.logixgrid.taskmanager.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Returns only the details needed to assign tasks to registered users.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserOption> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserOption(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                ))
                .toList();
    }
}
