package com.example.munglogbackend.domain.shelter;

import com.example.munglogbackend.domain.global.AbstractEntity;
import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.persistence.EmailAttributeConverter;
import com.example.munglogbackend.domain.shelter.exception.ShelterErrorType;
import com.example.munglogbackend.domain.shelter.exception.ShelterException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "shelter")
public class Shelter extends AbstractEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @OneToMany(mappedBy = "shelter", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")  // 또는 id ASC
    private Set<ShelterImage> shelterImages = new LinkedHashSet<>();

    @OneToMany(mappedBy = "shelter", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private Set<ShelterDogsImage> shelterDogsImages = new LinkedHashSet<>();

    @Column(name = "shelter_name", nullable = false)
    private String name;

    @Column(name = "shelter_phone")
    private String phone;

    @Convert(converter = EmailAttributeConverter.class)
    @Column(name = "email", nullable = false, length = 100)
    private Email email;

    @ElementCollection
    @CollectionTable(
            name = "shelter_urls",
            joinColumns = @JoinColumn(name = "shelter_id")
    )
    @Column(name = "url")
    private List<String> urls = new ArrayList<>();

    @Column(name = "shelter_description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "shelter_opening_hours")
    private String openingHours;

    @Column(name = "shelter_volunteer_info", columnDefinition = "TEXT")
    private String volunteerInfo;

    @Embedded
    private Address address;

    private static Shelter create(Member member) {
        Shelter shelter = new Shelter();
        shelter.member = member;
        return shelter;
    }

    public static Shelter createShelter(
            Member member,
            String name,
            String phone,
            Email email,
            List<String> urls,
            String description,
            String openingHours,
            String volunteerInfo,
            Address address
    ) {
        Shelter shelter = create(member);
        shelter.name = name;
        shelter.phone = phone;
        shelter.email = email;
        shelter.urls = urls != null ? new ArrayList<>(urls) : new ArrayList<>();
        shelter.description = description;
        shelter.openingHours = openingHours;
        shelter.volunteerInfo = volunteerInfo;
        shelter.address = address;
        return shelter;
    }

    public void updateBasicInfo(String name, String phone, Email email) {
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    public void updateUrls(List<String> urls) {
        this.urls.clear();
        if (urls != null) {
            this.urls.addAll(urls);
        }
    }

    public void addUrl(String url) {
        if (!this.urls.contains(url)) {
            this.urls.add(url);
        }
    }

    public void removeUrl(String url) {
        this.urls.remove(url);
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public void updateOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }

    public void updateVolunteerInfo(String volunteerInfo) {
        this.volunteerInfo = volunteerInfo;
    }

    public void updateAddress(Address address) {
        this.address =  Address.create(address.getPostalCode(), address.getStreet(), address.getDetail());
    }

    // 보호소 사진 관리
    public void addShelterImage(String imageUrl) {
        ShelterImage shelterImage = ShelterImage.create(this, imageUrl);
        this.shelterImages.add(shelterImage);
    }

    public void removeShelterImage(Long shelterImageId) {
        ShelterImage image = shelterImages.stream()
                .filter(img -> img.getId().equals(shelterImageId))
                .findFirst()
                .orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_IMAGE_NOT_FOUND));
        this.shelterImages.remove(image);
    }

    // 보호소 강아지 사진 관리
    public void addShelterDogsImage(String imageUrl) {
        ShelterDogsImage dogsImage = ShelterDogsImage.create(this, imageUrl);
        this.shelterDogsImages.add(dogsImage);
    }

    public void removeShelterDogsImage(Long dogsImageId) {
        ShelterDogsImage image = shelterDogsImages.stream()
                .filter(img -> img.getId().equals(dogsImageId))
                .findFirst()
                .orElseThrow(() -> new ShelterException(ShelterErrorType.SHELTER_DOGS_IMAGE_NOT_FOUND));
        this.shelterDogsImages.remove(image);
    }
}