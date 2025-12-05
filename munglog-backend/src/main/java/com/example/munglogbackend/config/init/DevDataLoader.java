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
import com.example.munglogbackend.domain.volunteer_application.enumerate.VolunteerApplicationStatus;
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
import java.util.Random;
import java.util.stream.Collectors;

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
    private final CsvShelterLoader csvShelterLoader;
    private final ChatRoomLoader chatRoomLoader;

    @Override
    @Transactional
    public void run(String... args) {
        // 중복 실행 방지
        if (memberRepository.count() > 0) {
            log.info("✅ Data already exists. Skipping data loading.");
            log.info("   - Members: {}", memberRepository.count());
            log.info("   - Shelters: {}", shelterRepository.count());
            log.info("   - Volunteer Applications: {}", volunteerApplicationRepository.count());
            return;
        }

        log.info("🔧 개발 환경 - 테스트 데이터 로딩 중...");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try {
            // 1. CSV에서 대량 회원 데이터 로드
            log.info("");
            log.info("📋 Step 1/5: CSV 회원 데이터 로딩...");
            log.info("-----------------------------------------------");
            csvMemberLoader.loadMembersFromCsv();

            // 2. 추가 특수 테스트 계정 생성
            log.info("");
            log.info("📋 Step 2/5: 특수 테스트 계정 생성...");
            log.info("-----------------------------------------------");
            List<Member> specialMembers = createSpecialMembers();
            log.info("✅ {} Special test accounts created", specialMembers.size());

            // 3. CSV에서 보호소 데이터 로드
            log.info("");
            log.info("📋 Step 3/5: CSV 보호소 데이터 로딩...");
            log.info("-----------------------------------------------");
            csvShelterLoader.loadSheltersFromCsv();

            // 4. 전체 회원 및 보호소 조회
            List<Member> allMembers = memberRepository.findAll();
            List<Shelter> allShelters = shelterRepository.findAll();

            // 5. VolunteerApplication 생성
            log.info("");
            log.info("📋 Step 4/5: 봉사 신청 생성...");
            log.info("-----------------------------------------------");
            try {
                List<VolunteerApplication> applications = createVolunteerApplications(allMembers, allShelters);
                log.info("✅ {} Volunteer Applications created", applications.size());
            } catch (Exception e) {
                log.error("❌ 봉사 신청 생성 중 오류 발생 - 나머지 데이터는 유지합니다.", e);
            }

            Long chatRoomId = chatRoomLoader.createLoadTestGroupRoom();
            log.info("✅ Group chat room created with ID: {}", chatRoomId);

            // 6. 최종 통계
            log.info("");
            log.info("📋 Step 5/5: 최종 통계");
            log.info("-----------------------------------------------");
            logFinalStatistics();

            log.info("");
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

        } catch (Exception e) {
            log.error("❌ 데이터 로드 중 오류 발생", e);
            throw e;
        }
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
     * 봉사 신청 데이터 생성
     * - 랜덤하게 봉사자들이 보호소에 봉사 신청
     */
    private List<VolunteerApplication> createVolunteerApplications(
            List<Member> allMembers,
            List<Shelter> allShelters) {

        if (allShelters.isEmpty()) {
            log.warn("⚠️ 보호소가 없어 봉사 신청을 생성할 수 없습니다.");
            return new ArrayList<>();
        }

        List<VolunteerApplication> applications = new ArrayList<>();
        Random random = new Random();

        // 봉사자만 필터링
        List<Member> volunteers = allMembers.stream()
                .filter(m -> m.getRole() == MemberRole.VOLUNTEER)
                .collect(Collectors.toList());

        if (volunteers.isEmpty()) {
            log.warn("⚠️ 봉사자가 없어 봉사 신청을 생성할 수 없습니다.");
            return new ArrayList<>();
        }

        // 봉사자의 약 30%가 1~3개의 신청을 함
        int applicationCount = Math.min(volunteers.size() * 30 / 100, 2000); // 최대 2000개

        log.info("🔄 {}개의 봉사 신청 생성 중...", applicationCount);

        try {
            for (int i = 0; i < applicationCount; i++) {
                // 랜덤 봉사자 선택
                Member volunteer = volunteers.get(random.nextInt(volunteers.size()));

                // 랜덤 보호소 선택
                Shelter shelter = allShelters.get(random.nextInt(allShelters.size()));

                // 랜덤 날짜 (오늘부터 60일 이내)
                LocalDate volunteerDate = LocalDate.now().plusDays(random.nextInt(60));

                // 랜덤 시간
                LocalTime startTime = LocalTime.of(9 + random.nextInt(5), 0); // 09:00 ~ 13:00
                LocalTime endTime = startTime.plusHours(2 + random.nextInt(4)); // 2~5시간 봉사

                // 랜덤 상태
                VolunteerApplicationStatus status = VolunteerApplicationStatus.values()[
                        random.nextInt(VolunteerApplicationStatus.values().length)
                        ];

                // 설명 (50% 확률로)
                String description = random.nextBoolean() ?
                        "봉사 활동에 참여하고 싶습니다. 강아지를 사랑합니다!" : null;
                VolunteerApplication application = VolunteerApplication.createApplication(
                        volunteer,
                        shelter,
                        volunteerDate,
                        startTime,
                        endTime,
                        description
                );

                applications.add(application);

                // 배치 저장 (500개씩)
                if (applications.size() >= 500) {
                    volunteerApplicationRepository.saveAll(applications);
                    applications.clear();
                    log.info("   ✓ {}개 저장...", i + 1);
                }
            }

            // 남은 데이터 저장
            if (!applications.isEmpty()) {
                volunteerApplicationRepository.saveAll(applications);
            }

            long totalApplications = volunteerApplicationRepository.count();
            log.info("✅ 총 {}개의 봉사 신청 생성 완료", totalApplications);

            return applications;

        } catch (Exception e) {
            log.error("❌ 봉사 신청 생성 중 오류", e);
            throw e;
        }
    }

    /**
     * 최종 통계 로깅
     */
    private void logFinalStatistics() {
        long memberCount = memberRepository.count();
        long shelterCount = shelterRepository.count();
        long applicationCount = volunteerApplicationRepository.count();

        long volunteerCount = memberRepository.countByRole(MemberRole.VOLUNTEER);
        long shelterOwnerCount = memberRepository.countByRole(MemberRole.SHELTER_OWNER);
        long adminCount = memberRepository.countByRole(MemberRole.ADMIN);

        log.info("📊 최종 통계:");
        log.info("   [회원]");
        log.info("   - 전체: {}명", memberCount);
        log.info("   - 봉사자: {}명 ({}%)",
                volunteerCount, String.format("%.1f", volunteerCount * 100.0 / memberCount));
        log.info("   - 보호소 소유자: {}명 ({}%)",
                shelterOwnerCount, String.format("%.1f", shelterOwnerCount * 100.0 / memberCount));
        log.info("   - 관리자: {}명 ({}%)",
                adminCount, String.format("%.1f", adminCount * 100.0 / memberCount));
        log.info("");
        log.info("   [보호소]");
        log.info("   - 전체: {}개", shelterCount);
        log.info("");
        log.info("   [봉사 신청]");
        log.info("   - 전체: {}개", applicationCount);

        if (applicationCount > 0) {
            long pendingCount = volunteerApplicationRepository.countByStatus(VolunteerApplicationStatus.PENDING);
            long approvedCount = volunteerApplicationRepository.countByStatus(VolunteerApplicationStatus.APPROVED);
            long rejectedCount = volunteerApplicationRepository.countByStatus(VolunteerApplicationStatus.REJECTED);
            long cancelledCount = volunteerApplicationRepository.countByStatus(VolunteerApplicationStatus.CANCELLED);

            log.info("   - 대기중: {}개 ({}%)",
                    pendingCount, String.format("%.1f", pendingCount * 100.0 / applicationCount));
            log.info("   - 승인됨: {}개 ({}%)",
                    approvedCount, String.format("%.1f", approvedCount * 100.0 / applicationCount));
            log.info("   - 거절됨: {}개 ({}%)",
                    rejectedCount, String.format("%.1f", rejectedCount * 100.0 / applicationCount));
            log.info("   - 취소됨: {}개 ({}%)",
                    cancelledCount, String.format("%.1f", cancelledCount * 100.0 / applicationCount));
        }
    }
}