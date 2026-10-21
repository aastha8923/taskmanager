-- TaskFlow local MySQL database setup
-- Run this script in MySQL Workbench or the MySQL CLI.
-- This creates the database; JPA/Hibernate manages entity tables according
-- to the spring.jpa.hibernate.ddl-auto setting in application.properties.

CREATE DATABASE IF NOT EXISTS task_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE task_manager;
