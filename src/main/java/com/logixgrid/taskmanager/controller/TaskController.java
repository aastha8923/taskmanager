
package com.logixgrid.taskmanager.controller;

import com.logixgrid.taskmanager.entity.Task;
import com.logixgrid.taskmanager.entity.TaskStatus;
import com.logixgrid.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.logixgrid.taskmanager.entity.TaskStatusHistory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(Authentication authentication) {
        // Pass the authenticated user's email and role to enforce task visibility.
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(
                taskService.getAllTasks(authentication.getName(), isAdmin)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(
                taskService.getTasksByProject(projectId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody Task task,
            @RequestParam Long projectId,
            @RequestParam(required = false) Long assignedUserId,
            Authentication authentication) {

        Task created = taskService.createTask(
                task, projectId, assignedUserId,
                authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody Task task) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }



    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

        TaskStatus taskStatus = TaskStatus.valueOf(status);

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(
                taskService.updateTaskStatus(
                        id,
                        taskStatus,
                        authentication.getName(),
                        isAdmin
                )
        );
    }



    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> assignTask(
            @PathVariable Long id,
            @RequestParam Long assignedUserId) {

        return ResponseEntity.ok(
                taskService.assignTask(id, assignedUserId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<TaskStatusHistory>> getTaskStatusHistory(
            @PathVariable Long id) {



        return ResponseEntity.ok(
                taskService.getTaskStatusHistory(id));
    }

}
