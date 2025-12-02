package com.example.munglogbackend.config.init;

import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.application.shelter.required.ShelterRepository;
import com.example.munglogbackend.application.volunteer_application.required.VolunteerApplicationRepository;
import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.dto.AddressRequest;
import com.example.munglogbackend.domain.member.dto.MemberSignUpRequest;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import com.example.munglogbackend.domain.shelter.Shelter;
import com.example.munglogbackend.domain.volunteer_application.VolunteerApplication;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 테스트용 Mock 데이터를 로딩하는 Component
 * - CSV 파일에서 10,000명의 회원 로드
 * - 기본 보호소 및 봉사 신청 데이터 생성
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"local", "prod"})
public class DevDataLoader implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final ShelterRepository shelterRepository;
    private final VolunteerApplicationRepository volunteerApplicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CsvMemberLoader csvMemberLoader;

    @Override
    @Transactional
    public void run(String... args) {
        // 중복 실행 방지
        if (memberRepository.count() > 0) {
            log.info("✅ Data already exists. Skipping data loading.");
            return;
        }

        log.info("🔧 개발 환경 - 테스트 데이터 로딩 중...");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // 1. CSV에서 대량 회원 데이터 로드
        log.info("📋 Step 1/4: CSV 회원 데이터 로딩...");
        csvMemberLoader.loadMembersFromCsv();

        // 2. 추가 특수 테스트 계정 생성
        log.info("📋 Step 2/4: 특수 테스트 계정 생성...");
        List<Member> specialMembers = createSpecialMembers();
        log.info("✅ {} Special test accounts created", specialMembers.size());

        // 3. 전체 회원 조회 (보호소 생성용)
        List<Member> allMembers = memberRepository.findAll();

        // 4. Shelter 생성 (보호소 소유자들로부터)
        log.info("📋 Step 3/4: 보호소 생성...");
        List<Shelter> shelters = createShelters(allMembers);
        log.info("✅ {} Shelters created", shelters.size());

        // 5. VolunteerApplication 생성 (일부 회원들로)
        log.info("📋 Step 4/4: 봉사 신청 생성...");
        List<VolunteerApplication> applications = createVolunteerApplications(allMembers, shelters);
        log.info("✅ {} Volunteer Applications created", applications.size());

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🎉 개발용 Mock 데이터 로딩 완료!");
        log.info("");
        log.info("📝 특수 테스트 계정 정보:");
        log.info("   - 슈퍼관리자: superadmin@test.com / test1234");
        log.info("   - 테스트봉사자: testvolunteer@test.com / test1234");
        log.info("   - 테스트보호소: testshelter@test.com / test1234");
        log.info("");
        log.info("📊 CSV 회원 (10,000명):");
        log.info("   - 이메일: user00001@test.com ~ user10000@test.com");
        log.info("   - 비밀번호: test1234 (공통)");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    /**
     * 특수 목적 테스트 계정 생성
     * - 슈퍼 관리자
     * - 명확한 테스트용 봉사자/보호소 계정
     */
    private List<Member> createSpecialMembers() {
        List<Member> members = new ArrayList<>();

        // 슈퍼 관리자
        members.add(Member.createSocialMember(
                "슈퍼관리자",
                Email.from("superadmin@test.com"),
                passwordEncoder.encode("test1234"),
                MemberRole.ADMIN
        ));

        // 테스트 봉사자
        members.add(Member.create(new MemberSignUpRequest(
                "테스트봉사자",
                "testvolunteer@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.VOLUNTEER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "테스트빌딩 101호")
        )));

        // 테스트 보호소
        members.add(Member.create(new MemberSignUpRequest(
                "테스트보호소",
                "testshelter@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.SHELTER_OWNER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "테스트빌딩 201호")
        )));

        return memberRepository.saveAll(members);
    }

    /**
     * 테스트용 Shelter 데이터 생성
     * - SHELTER_OWNER 역할을 가진 회원들 중 일부를 선택하여 보호소 생성
     */
    private List<Shelter> createShelters(List<Member> allMembers) {
        List<Shelter> shelters = new ArrayList<>();

        // SHELTER_OWNER 회원만 필터링
        List<Member> shelterOwners = allMembers.stream()
                .filter(m -> m.getRole() == MemberRole.SHELTER_OWNER)
                .limit(100) // 100개의 보호소 생성
                .toList();

        if (shelterOwners.isEmpty()) {
            log.warn("⚠️ SHELTER_OWNER 역할을 가진 회원이 없습니다.");
            return shelters;
        }

        // 보호소 템플릿
        String[][] shelterTemplates = {
                {"사랑 동물보호소", "02-1234-5678", "서울특별시 강남구 테헤란로 123", "06234"},
                {"희망 동물의집", "031-8765-4321", "경기도 성남시 분당구 판교역로 231", "13487"},
                {"행복 동물보호센터", "032-9876-5432", "인천광역시 연수구 송도과학로 32", "21990"},
                {"평화 보호소", "051-1111-2222", "부산광역시 해운대구 센텀중앙로 97", "48094"},
                {"나눔 동물센터", "053-3333-4444", "대구광역시 수성구 달구벌대로 2450", "42061"},
        };

        for (int i = 0; i < shelterOwners.size(); i++) {
            Member owner = shelterOwners.get(i);
            String[] template = shelterTemplates[i % shelterTemplates.length];

            Shelter shelter = Shelter.createShelter(
                    owner,
                    template[0] + " #" + (i + 1),
                    template[1],
                    Email.from("shelter" + (i + 1) + "@test.com"),
                    List.of("https://shelter" + (i + 1) + ".com"),
                    "유기동물 보호 및 입양을 돕는 보호소입니다.",
                    "월-금 09:00-18:00",
                    "봉사자를 모집합니다!",
                    Address.create(template[3], template[2], (i + 1) + "호")
            );

            // 대표 이미지 추가
            shelter.addShelterImage("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800");
            shelter.addShelterDogsImage("https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600");

            shelters.add(shelter);
        }

        return shelterRepository.saveAll(shelters);
    }

    /**
     * 테스트용 VolunteerApplication 데이터 생성
     * - VOLUNTEER 역할 회원들 중 일부가 보호소에 봉사 신청
     */
    private List<VolunteerApplication> createVolunteerApplications(List<Member> allMembers, List<Shelter> shelters) {
        if (shelters.isEmpty()) {
            log.warn("⚠️ 생성된 보호소가 없어 봉사 신청을 생성할 수 없습니다.");
            return List.of();
        }

        List<VolunteerApplication> applications = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // VOLUNTEER 역할 회원만 필터링 (200명 사용)
        List<Member> volunteers = allMembers.stream()
                .filter(m -> m.getRole() == MemberRole.VOLUNTEER)
                .limit(200)
                .toList();

        if (volunteers.isEmpty()) {
            log.warn("⚠️ VOLUNTEER 역할을 가진 회원이 없습니다.");
            return applications;
        }

        // 각 봉사자가 1-3개의 보호소에 신청
        for (int i = 0; i < volunteers.size(); i++) {
            Member volunteer = volunteers.get(i);
            int applicationCount = (i % 3) + 1; // 1~3개

            for (int j = 0; j < applicationCount; j++) {
                Shelter shelter = shelters.get((i + j) % shelters.size());

                VolunteerApplication app = VolunteerApplication.createApplication(
                        volunteer,
                        shelter,
                        today.plusDays(5 + (i % 15)),
                        LocalTime.of(10 + (i % 5), 0),
                        LocalTime.of(14 + (i % 3), 0),
                        "봉사 신청합니다. 열심히 하겠습니다!"
                );

                // 상태 다양화 (70% PENDING, 20% APPROVED, 10% REJECTED)
                int statusRandom = i % 10;
                if (statusRandom < 2) {
                    app.approve();
                } else if (statusRandom == 9) {
                    app.reject();
                }

                applications.add(app);
            }
        }

        return volunteerApplicationRepository.saveAll(applications);
    }
}