package com.universidad.triage_back.repository;
import com.universidad.triage_back.entity.AcademicRequest;
import com.universidad.triage_back.enums.Priority;
import com.universidad.triage_back.enums.RequestType;
import com.universidad.triage_back.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicRequestRepository extends JpaRepository<AcademicRequest, Long> {

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible")
    List<AcademicRequest> findAllWithUsers();

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible WHERE r.status = :status")
    List<AcademicRequest> findWithFilters(@Param("status") Status status);

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible WHERE r.type = :type")
    List<AcademicRequest> findWithFilters(@Param("type") RequestType type);

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible WHERE r.priority = :priority")
    List<AcademicRequest> findWithFilters(@Param("priority") Priority priority);

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible WHERE r.status = :status AND r.type = :type AND r.priority = :priority")
    List<AcademicRequest> findWithFilters(@Param("status") Status status, @Param("type") RequestType type, @Param("priority") Priority priority);

    @Query("""
        SELECT r FROM AcademicRequest r
        JOIN FETCH r.applicant
        LEFT JOIN FETCH r.responsible
        WHERE (:hasStatus = false OR r.status = :status)
          AND (:hasType = false OR r.type = :type)
          AND (:hasPriority = false OR r.priority = :priority)
          AND (:responsibleId IS NULL OR (r.responsible IS NOT NULL AND r.responsible.id = :responsibleId))
        """)
    List<AcademicRequest> findWithFilters(
            @Param("status") Status status,      @Param("hasStatus") boolean hasStatus,
            @Param("type") RequestType type,     @Param("hasType") boolean hasType,
            @Param("priority") Priority priority, @Param("hasPriority") boolean hasPriority,
            @Param("responsibleId") Long responsibleId);

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible WHERE r.applicant.id = :applicantId")
    List<AcademicRequest> findByApplicantId(@Param("applicantId") Long applicantId);

    @Query("SELECT r FROM AcademicRequest r JOIN FETCH r.applicant LEFT JOIN FETCH r.responsible WHERE r.id = :id")
    Optional<AcademicRequest> findByIdWithUsers(@Param("id") Long id);
}
