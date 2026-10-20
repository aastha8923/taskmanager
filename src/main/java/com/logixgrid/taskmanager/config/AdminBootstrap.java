
package com.logixgrid.taskmanager.config;

import com.logixgrid.taskmanager.entity.Role;
import com.logixgrid.taskmanager.entity.User;
import com.logixgrid.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrap {

    @Value("${app.admin.name:}")
    private String adminName;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner createInitialAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            // Require explicit credentials so an Admin is never created with a default password.
            if (adminName.isBlank()
                    || adminEmail.isBlank()
                    || adminPassword.isBlank()) {
                System.out.println(
                        "Admin bootstrap skipped: configure app.admin credentials to create an Admin.");
                return;
            }

            // Never create a second Admin automatically after one already exists.
            if (userRepository.existsByRole(Role.ADMIN)) {
                System.out.println("An Admin account already exists.");
                return;
            }

            if (userRepository.existsByEmail(adminEmail)) {
                throw new IllegalStateException(
                        "The configured Admin email already belongs to another account.");
            }

            User admin = new User();
            admin.setName(adminName);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println("Initial Admin account created successfully.");
        };
    }
}
