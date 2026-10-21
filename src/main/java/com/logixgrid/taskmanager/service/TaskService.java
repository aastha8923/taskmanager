
package com.logixgrid.taskmanager.service;

import com.logixgrid.taskmanager.entity.*;
import com.logixgrid.taskmanager.repository.ProjectRepository;
import com.logixgrid.taskmanager.repository.TaskRepository;
import com.logixgrid.taskmanager.repository.TaskStatusHistoryRepository;
import com.logixgrid.taskmanager.repository.UserRepository;
import com.logixgrid.taskmanager.repository.TaskActivityHistoryRepository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskStatusHistoryRepository taskStatusHistoryRepository;
    private final TaskActivityHistoryRepository taskActivityHistoryRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TaskStatusHistoryRepository taskStatusHistoryRepository,
            TaskActivityHistoryRepository taskActivityHistoryRepository) {

        this.taskRepository = taskRepository;
        this.taskActivityHistoryRepository = taskActivityHistoryRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.taskStatusHistoryRepository = taskStatusHistoryRepository;
    }

    public List<Task> getAllTasks(String userEmail, boolean isAdmin) {
        // Admins can view every task; regular users see only tasks assigned to them.
        if (isAdmin) {
            return taskRepository.findAll();
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return taskRepository.findByAssignedToId(user.getId());
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found"));
    }

    @Transactional
    public Task createTask(
            Task task,
            Long projectId,
            Long assignedUserId,
            String creatorEmail) {

        var project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found"));

        var creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Creator not found"));

        task.setId(null);
        task.setProject(project);
        task.setCreatedBy(creator);
        task.setStatus(TaskStatus.TODO);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        if (assignedUserId != null) {
            var assignee = userRepository.findById(assignedUserId)
                    .orElseThrow(() ->
                            new IllegalArgumentException("Assigned user not found"));

            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, Task updatedTask, String adminEmail) {
        Task task = getTaskById(id);

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setPriority(updatedTask.getPriority());
        task.setDueDate(updatedTask.getDueDate());

        // Update the project if one was supplied.
        if (updatedTask.getProject() != null
                && updatedTask.getProject().getId() != null) {

            var project = projectRepository.findById(
                    updatedTask.getProject().getId()
            ).orElseThrow(() ->
                    new IllegalArgumentException("Project not found"));

            task.setProject(project);
        }

        // Record an activity when the assignee changes.
        Long oldAssigneeId = task.getAssignedTo() == null
                ? null : task.getAssignedTo().getId();

        if (updatedTask.getAssignedTo() != null
                && updatedTask.getAssignedTo().getId() != null) {

            var assignee = userRepository.findById(
                    updatedTask.getAssignedTo().getId()
            ).orElseThrow(() ->
                    new IllegalArgumentException("Assigned user not found"));

            if (!assignee.getId().equals(oldAssigneeId)) {
                TaskActivityHistory activity = new TaskActivityHistory();
                activity.setTask(task);
                activity.setActivityType("ASSIGNEE_CHANGED");
                activity.setOldValue(task.getAssignedTo() == null
                        ? "Unassigned"
                        : task.getAssignedTo().getName());
                activity.setNewValue(assignee.getName());

                User changedBy = userRepository.findByEmail(adminEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException("Admin not found"));

                activity.setChangedBy(changedBy);
                taskActivityHistoryRepository.save(activity);
            }

            task.setAssignedTo(assignee);
        }

        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTaskStatus(
            Long id,
            TaskStatus newStatus,
            String userEmail,
            boolean isAdmin) {

        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }

        Task task = getTaskById(id);

        // Admins can update any task; regular users can update only their tasks.
        if (!isAdmin &&
                (task.getAssignedTo() == null ||
                        !task.getAssignedTo().getEmail().equalsIgnoreCase(userEmail))) {
            throw new AccessDeniedException(
                    "You can update only tasks assigned to you");
        }

        if (task.getStatus() == newStatus) {
            return task;
        }

        User changedBy = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        TaskStatusHistory history = new TaskStatusHistory();
        history.setTask(task);
        history.setPreviousStatus(task.getStatus());
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);

        taskStatusHistoryRepository.save(history);

        task.setStatus(newStatus);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    @Transactional
    public Task assignTask(Long id, Long assignedUserId) {
        Task task = getTaskById(id);

        var assignee = userRepository.findById(assignedUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Assigned user not found"));

        task.setAssignedTo(assignee);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("Project not found");
        }

        return taskRepository.findByProjectId(projectId);
    }

    public boolean isOverdue(Task task) {
        return task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.COMPLETED;
    }

    public List<TaskStatusHistory> getTaskStatusHistory(Long taskId) {
        getTaskById(taskId);

        return taskStatusHistoryRepository
                .findByTaskIdOrderByChangedAtDesc(taskId);
    }

    // Admins can view any task's activity history.
    // Regular users can view history only for tasks currently assigned to them.
    public List<TaskActivityHistory> getTaskActivityHistory(
            Long taskId,
            String userEmail,
            boolean isAdmin) {

        Task task = getTaskById(taskId);

        if (!isAdmin &&
                (task.getAssignedTo() == null ||
                        !task.getAssignedTo().getEmail().equalsIgnoreCase(userEmail))) {
            throw new AccessDeniedException(
                    "You are not authorized to view this task's activity history.");
        }

        return taskActivityHistoryRepository
                .findByTaskIdOrderByChangedAtDesc(taskId);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskById(id);

        // Delete histories before deleting the task.
        taskStatusHistoryRepository.deleteByTaskId(id);
        taskActivityHistoryRepository.deleteByTaskId(id);

        taskRepository.delete(task);
    }
}
