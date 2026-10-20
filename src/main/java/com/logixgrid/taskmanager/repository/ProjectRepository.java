
package com.logixgrid.taskmanager.repository;

import com.logixgrid.taskmanager.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository
        extends JpaRepository<Project, Long> {
}
