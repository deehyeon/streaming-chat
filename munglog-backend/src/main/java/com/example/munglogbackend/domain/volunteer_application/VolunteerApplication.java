package com.example.munglogbackend.domain.volunteer_application;

import com.example.munglogbackend.domain.global.AbstractEntity;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
import com.example.munglogbackend.domain.volunteer_application.exception.VolunteerApplicationErrorType;
import com.example.munglogbackend.domain.volunteer_application.exception.VolunteerApplicationException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "volunteer_application")
public class VolunteerApplication extends AbstractEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_id", nullable = false)
    private Shelter shelter;

    @Column(name = "volunteer_application_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private VolunteerApplicationStatus status;

    @Column(name = "volunteer_date", nullable = false)
    private LocalDate volunteerDate;

    @Column(name = "volunteer_application_start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "volunteer_application_end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "volunteer_application_description", columnDefinition = "TEXT")
    private String description;

    private static VolunteerApplication create(Member member, Shelter shelter) {
        VolunteerApplication application = new VolunteerApplication();
        application.member = member;
        application.shelter = shelter;
        application.status = VolunteerApplicationStatus.PENDING;
        return application;
    }

    public static VolunteerApplication createApplication(
            Member member,
            Shelter shelter,
            LocalDate volunteerDate,
            LocalTime startTime,
            LocalTime endTime,
            String description
    ) {
        validateDateTime(volunteerDate, startTime, endTime);

        VolunteerApplication application = create(member, shelter);
        application.volunteerDate = volunteerDate;
        application.startTime = startTime;
        application.endTime = endTime;
        application.description = description;
        return application;
    }

    public void approve() {
        if (this.status != VolunteerApplicationStatus.PENDING) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.INVALID_STATUS_TRANSITION);
        }
        this.status = VolunteerApplicationStatus.APPROVED;
    }

    public void reject() {
        if (this.status != VolunteerApplicationStatus.PENDING) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.INVALID_STATUS_TRANSITION);
        }
        this.status = VolunteerApplicationStatus.REJECTED;
    }

    public void cancel() {
        if (this.status == VolunteerApplicationStatus.REJECTED) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.CANNOT_CANCEL_REJECTED);
        }
        if (this.status == VolunteerApplicationStatus.CANCELLED) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.ALREADY_CANCELLED);
        }
        this.status = VolunteerApplicationStatus.CANCELLED;
    }

    public void updateDateTime(LocalDate volunteerDate, LocalTime startTime, LocalTime endTime) {
        if (this.status != VolunteerApplicationStatus.PENDING) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.CANNOT_UPDATE_NON_PENDING);
        }
        validateDateTime(volunteerDate, startTime, endTime);
        this.volunteerDate = volunteerDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public void updateDescription(String description) {
        if (this.status != VolunteerApplicationStatus.PENDING) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.CANNOT_UPDATE_NON_PENDING);
        }
        this.description = description;
    }

    private static void validateDateTime(LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date.isBefore(LocalDate.now())) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.INVALID_APPLICATION_DATE);
        }
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new VolunteerApplicationException(VolunteerApplicationErrorType.INVALID_TIME_RANGE);
        }
    }
}
