
package com.logixgrid.taskmanager.repository;

import com.logixgrid.taskmanager.entity.TaskStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskStatusHistoryRepository
        extends JpaRepository<TaskStatusHistory, Long> {

    List<TaskStatusHistory> findByTaskIdOrderByChangedAtDesc(Long taskId);
}
