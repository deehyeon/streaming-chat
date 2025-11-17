package com.example.munglogbackend.domain.global;

import jakarta.persistence.*;
import lombok.Getter;

@MappedSuperclass
public abstract class AbstractEntity extends BaseEntity {
    @Id
    @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}

