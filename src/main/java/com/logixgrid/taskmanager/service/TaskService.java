
package com.logixgrid.taskmanager.service;

import com.logixgrid.taskmanager.entity.*;
import com.logixgrid.taskmanager.repository.ProjectRepository;
import com.logixgrid.taskmanager.repository.TaskRepository;
import com.logixgrid.taskmanager.repository.TaskStatusHistoryRepository;
import com.logixgrid.taskmanager.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskStatusHistoryRepository taskStatusHistoryRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TaskStatusHistoryRepository taskStatusHistoryRepository) {

        this.taskRepository = taskRepository;
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

        // Validate relationships on the server instead of trusting
        // client-supplied entity IDs.
        var project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found"));

        var creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Creator not found"));

        task.setId(null);
        task.setProject(project);
        task.setCreatedBy(creator);

        // The server controls initial status so clients cannot create
        // tasks that appear completed without going through the workflow.
        task.setStatus(TaskStatus.TODO);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        if (assignedUserId != null) {
            var assignee = userRepository.findById(assignedUserId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Assigned user not found"));

            task.setAssignedTo(assignee);
        } else {
            task.setAssignedTo(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, Task updatedTask) {
        Task task = getTaskById(id);

        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        task.setPriority(updatedTask.getPriority());
        task.setDueDate(updatedTask.getDueDate());

        // Keep status changes in a separate method so each transition
        // is recorded consistently in the audit history.
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

        // Admins can update any task; regular users can update
        // only tasks assigned to them.
        if (!isAdmin &&
                (task.getAssignedTo() == null ||
                        !task.getAssignedTo().getEmail().equalsIgnoreCase(userEmail))) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can update only tasks assigned to you");
        }

        if (task.getStatus() == newStatus) {
            return task;
        }

        User changedBy = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        // Record the previous and new status for the task history.
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
                        new IllegalArgumentException(
                                "Assigned user not found"));

        task.setAssignedTo(assignee);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        // Query the database directly instead of loading every task
        // into memory and filtering the results in Java.
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("Project not found");
        }

        return taskRepository.findByProjectId(projectId);
    }

    public boolean isOverdue(Task task) {
        // Completed work should not appear in overdue-task reporting.
        return task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.COMPLETED;
    }

    public List<TaskStatusHistory> getTaskStatusHistory(Long taskId) {
        // Validate the task ID so a nonexistent task is not mistaken
        // for a task that simply has no status changes yet.
        getTaskById(taskId);

        return taskStatusHistoryRepository
                .findByTaskIdOrderByChangedAtDesc(taskId);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
