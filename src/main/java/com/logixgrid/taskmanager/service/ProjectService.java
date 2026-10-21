
package com.logixgrid.taskmanager.service;

import com.logixgrid.taskmanager.entity.Project;
import com.logixgrid.taskmanager.entity.User;
import com.logixgrid.taskmanager.repository.ProjectRepository;
import com.logixgrid.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.logixgrid.taskmanager.repository.TaskRepository;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found"));
    }

    @Transactional
    public Project createProject(Project project, String userEmail) {

        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        project.setId(null);
        project.setCreatedBy(creator);
        project.setStatus("PLANNED");

        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, Project updatedProject) {

        Project project = getProjectById(id);

        project.setName(updatedProject.getName());
        project.setDescription(updatedProject.getDescription());
        project.setDueDate(updatedProject.getDueDate());

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectById(id);

        long taskCount = taskRepository.countByProjectId(id);

        if (taskCount > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete this project because it still has tasks. "
                            + "Delete or reassign its tasks first."
            );
        }

        projectRepository.delete(project);
    }
}
