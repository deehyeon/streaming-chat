package com.example.munglogbackend.domain.shelter;

import com.example.munglogbackend.domain.global.AbstractEntity;
import com.example.munglogbackend.domain.shelter.exception.ShelterErrorType;
import com.example.munglogbackend.domain.shelter.exception.ShelterException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "shelter_dogs_image")
public class ShelterDogsImage extends AbstractEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Shelter shelter;

    @Column(name = "shelter_image_url", nullable = false)
    private String imageUrl;

    private ShelterDogsImage(Shelter shelter, String imageUrl) {
        this.shelter = shelter;
        this.imageUrl = imageUrl;
    }

    public static ShelterDogsImage create(Shelter shelter, String imageUrl) {
        validateImageUrl(imageUrl);
        return new ShelterDogsImage(shelter, imageUrl);
    }

    public void updateImageUrl(String imageUrl) {
        validateImageUrl(imageUrl);
        this.imageUrl = imageUrl;
    }

    private static void validateImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new ShelterException(ShelterErrorType.INVALID_IMAGE_URL);
        }
    }
}