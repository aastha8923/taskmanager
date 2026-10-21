
package com.logixgrid.taskmanager.repository;

import com.logixgrid.taskmanager.entity.TaskActivityHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskActivityHistoryRepository
        extends JpaRepository<TaskActivityHistory, Long> {

    List<TaskActivityHistory> findByTaskIdOrderByChangedAtDesc(Long taskId);
    void deleteByTaskId(Long taskId);
}
