package com.example.munglogbackend.application.shelter.required;

import com.example.munglogbackend.domain.shelter.Shelter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShelterRepository extends JpaRepository<Shelter, Long> {
    @Query("SELECT s FROM Shelter s " +
            "WHERE :region IS NULL OR s.address.street LIKE CONCAT('%', :region, '%')")
    Page<Shelter> findSheltersByAddressContaining(@Param("region") String region, Pageable pageable);

    Page<Shelter> findAll(Pageable pageable);

    Optional<Shelter> findByMember_Id(Long memberId);

    // @EntityGraph 사용으로 MultipleBagFetchException 해결
    @EntityGraph(attributePaths = {"shelterImages", "shelterDogsImages", "urls"})
    @Query("SELECT s FROM Shelter s WHERE s.name LIKE CONCAT('%', :name, '%')")
    Page<Shelter> findByNameContaining(@Param("name") String name, Pageable pageable);

    @EntityGraph(attributePaths = {"shelterImages", "shelterDogsImages", "urls"})
    @Query("SELECT s FROM Shelter s WHERE s.id = :shelterId")
    Optional<Shelter> findByIdWithImages(@Param("shelterId") Long shelterId);

    @EntityGraph(attributePaths = {"shelterImages", "shelterDogsImages", "urls"})
    @Query("SELECT s FROM Shelter s WHERE s.member.id = :memberId")
    Optional<Shelter> findByMemberIdWithImages(@Param("memberId") Long memberId);
}