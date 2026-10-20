
package com.logixgrid.taskmanager.dto;

/**
 * Returns the authentication token and basic user details
 * to the frontend after a successful login.
 */
public class LoginResponse {

    private String token;
    private String name;
    private String email;
    private String role;

    public LoginResponse(String token, String name, String email, String role) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
