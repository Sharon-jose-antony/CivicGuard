package com.civicshield.model;

public class UserResponse {
    private String username;
    private String role;
    private boolean authenticated;

    public UserResponse() {}

    public UserResponse(String username, String role, boolean authenticated) {
        this.username = username;
        this.role = role;
        this.authenticated = authenticated;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }
}
