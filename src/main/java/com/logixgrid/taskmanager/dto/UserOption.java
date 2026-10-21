
package com.logixgrid.taskmanager.dto;

// Contains only the user details needed by the task assignment dropdown.
public record UserOption(
        Long id,
        String name,
        String email
) {
}
