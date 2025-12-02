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

    @Override
    @Transactional
    public void run(String... args) {
        // 중복 실행 방지
        if (memberRepository.count() > 0) {
            log.info("✅ Data already exists. Skipping data loading.");
            return;
        }

        log.info("🔧 개발 환경 - 테스트 데이터 로딩 중...");

        // 1. Member 생성
        List<Member> members = createMembers();
        log.info("✅ {} Members created", members.size());

        // 2. Shelter 생성
        List<Shelter> shelters = createShelters(members);
        log.info("✅ {} Shelters created", shelters.size());

        // 3. VolunteerApplication 생성
        List<VolunteerApplication> applications = createVolunteerApplications(members, shelters);
        log.info("✅ {} Volunteer Applications created", applications.size());

        log.info("🎉 개발용 Mock 데이터 로딩 완료!");
        log.info("📝 테스트 계정 정보:");
        log.info("   - 봉사자1: volunteer1@test.com / test1234");
        log.info("   - 봉사자2: volunteer2@test.com / test1234");
        log.info("   - 봉사자3: volunteer3@test.com / test1234");
        log.info("   - 보호소 소유자1: shelter1@test.com / test1234");
        log.info("   - 보호소 소유자2: shelter2@test.com / test1234");
        log.info("   - 보호소 소유자3: shelter3@test.com / test1234");
    }

    /**
     * 테스트용 Member 데이터 생성
     * - 봉사자 3명
     * - 보호소 소유자 3명
     */
    private List<Member> createMembers() {
        List<Member> members = new ArrayList<>();

        // Admin 계정 생성
        members.add(Member.createSocialMember(
                "관리자",
                Email.from("admin@test.com"),
                passwordEncoder.encode("test1234"),
                MemberRole.ADMIN
        ));

        // 봉사자 계정 생성
        members.add(Member.create(new MemberSignUpRequest(
                "봉사자1",
                "volunteer1@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.VOLUNTEER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "행복호")
                )
        ));

        members.add(Member.create(new MemberSignUpRequest(
                "봉사자2",
                "volunteer2@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.VOLUNTEER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "행복호")
                )
        ));

        members.add(Member.create(new MemberSignUpRequest(
                "봉사자3",
                "volunteer3@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.VOLUNTEER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "행복호")
                )
        ));

        // 보호소 소유자 계정 생성
        members.add(Member.create(new MemberSignUpRequest(
                "보호소1",
                "shelter1@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.SHELTER_OWNER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "행복호")
                )
        ));

        members.add(Member.create(new MemberSignUpRequest(
                "보호소2",
                "shelter2@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.SHELTER_OWNER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "행복호")
            )
        ));

        members.add(Member.create(new MemberSignUpRequest(
                "보호소3",
                "shelter3@test.com",
                passwordEncoder.encode("test1234"),
                MemberRole.SHELTER_OWNER,
                new AddressRequest("12345", "경기도 수원시 행복구 행복동", "행복호")
            )
        ));

        return memberRepository.saveAll(members);
    }

    /**
     * 테스트용 Shelter 데이터 생성
     */
    private List<Shelter> createShelters(List<Member> members) {
        List<Shelter> shelters = new ArrayList<>();

        // 보호소 1: 사랑 동물보호소 (서울 강남구)
        Shelter shelter1 = Shelter.createShelter(
                members.get(4), // 첫 번째 보호소 소유자
                "사랑 동물보호소",
                "02-1234-5678",
                Email.from("love@shelter.com"),
                List.of("https://love-shelter.com", "https://instagram.com/love_shelter"),
                "서울 강남구에 위치한 유기견 전문 보호소입니다. 20년의 역사를 가진 보호소로, 매년 200마리 이상의 유기견을 구조하고 입양 보내고 있습니다.",
                "월-금 09:00-18:00 (주말 휴무)",
                "주말 봉사도 가능합니다! 사전 예약 필수입니다.",
                Address.create("06234", "서울특별시 강남구 테헤란로 123", "1층")
        );

        // 보호소 이미지 추가
        shelter1.addShelterImage("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800");
        shelter1.addShelterImage("https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=800");
        shelter1.addShelterImage("https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=800");

        // 보호소 강아지 사진 추가
        shelter1.addShelterDogsImage("https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600");
        shelter1.addShelterDogsImage("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600");
        shelter1.addShelterDogsImage("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600");
        shelter1.addShelterDogsImage("https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600");

        shelters.add(shelter1);

        // 보호소 2: 희망 동물의집 (경기도 성남시)
        Shelter shelter2 = Shelter.createShelter(
                members.get(5), // 두 번째 보호소 소유자
                "희망 동물의집",
                "031-8765-4321",
                Email.from("hope@shelter.com"),
                List.of("https://hope-shelter.com", "https://facebook.com/hope.shelter"),
                "경기도 성남시에 위치한 유기묘 전문 보호소입니다. 고양이뿐만 아니라 토끼, 햄스터 등 소동물도 보호하고 있습니다.",
                "월-일 10:00-17:00 (연중무휴)",
                "언제든지 봉사 신청 가능합니다. 첫 방문 시 오리엔테이션이 있습니다.",
                Address.create("13487", "경기도 성남시 분당구 판교역로 231", "지하 1층")
        );

        // 보호소 이미지 추가
        shelter2.addShelterImage("https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800");
        shelter2.addShelterImage("https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800");

        // 보호소 강아지/고양이 사진 추가
        shelter2.addShelterDogsImage("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600");
        shelter2.addShelterDogsImage("https://images.unsplash.com/photo-1573865526739-10c1d3a1f0cc?w=600");
        shelter2.addShelterDogsImage("https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600");

        shelters.add(shelter2);

        // 보호소 3: 행복 동물보호센터 (인천 연수구)
        Shelter shelter3 = Shelter.createShelter(
                members.get(6), // 세 번째 보호소 소유자
                "행복 동물보호센터",
                "032-9876-5432",
                Email.from("happy@shelter.com"),
                List.of("https://happy-shelter.com"),
                "인천 연수구에 위치한 대형 보호소입니다. 넓은 운동장과 현대적인 시설을 갖추고 있습니다.",
                "화-일 09:00-18:00 (월요일 휴무)",
                "대형견 산책 봉사자를 특히 환영합니다!",
                Address.create("21990", "인천광역시 연수구 송도과학로 32", "2층")
        );

        // 보호소 이미지 추가
        shelter3.addShelterImage("https://images.unsplash.com/photo-1444212477490-ca407925329e?w=800");

        // 보호소 강아지 사진 추가
        shelter3.addShelterDogsImage("https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600");
        shelter3.addShelterDogsImage("https://images.unsplash.com/photo-1568572933382-74d440642117?w=600");

        shelters.add(shelter3);

        return shelterRepository.saveAll(shelters);
    }

    /**
     * 테스트용 VolunteerApplication 데이터 생성
     */
    private List<VolunteerApplication> createVolunteerApplications(List<Member> members, List<Shelter> shelters) {
        List<VolunteerApplication> applications = new ArrayList<>();

        // 오늘 날짜 기준으로 미래 날짜 생성
        LocalDate today = LocalDate.now();

        // 봉사자1이 사랑 보호소에 신청 (PENDING)
        VolunteerApplication app1 = VolunteerApplication.createApplication(
                members.get(1), // 봉사자1
                shelters.get(0), // 사랑 보호소
                today.plusDays(5),
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "강아지 산책 봉사를 희망합니다. 대형견 다루는 것에 익숙합니다."
        );
        applications.add(app1);

        // 봉사자1이 희망 보호소에 신청 (APPROVED)
        VolunteerApplication app2 = VolunteerApplication.createApplication(
                members.get(1), // 봉사자1
                shelters.get(1), // 희망 보호소
                today.plusDays(7),
                LocalTime.of(13, 0),
                LocalTime.of(17, 0),
                "고양이 케어 봉사를 신청합니다. 고양이를 좋아합니다."
        );
        app2.approve();
        applications.add(app2);

        // 봉사자2가 사랑 보호소에 신청 (PENDING)
        VolunteerApplication app3 = VolunteerApplication.createApplication(
                members.get(2), // 봉사자2
                shelters.get(0), // 사랑 보호소
                today.plusDays(10),
                LocalTime.of(9, 0),
                LocalTime.of(12, 0),
                "주말 봉사 가능합니다. 청소 및 급식 봉사 희망합니다."
        );
        applications.add(app3);

        // 봉사자2가 행복 보호소에 신청 (REJECTED)
        VolunteerApplication app4 = VolunteerApplication.createApplication(
                members.get(2), // 봉사자2
                shelters.get(2), // 행복 보호소
                today.plusDays(3),
                LocalTime.of(14, 0),
                LocalTime.of(18, 0),
                "대형견 산책 봉사 신청합니다."
        );
        app4.reject();
        applications.add(app4);

        // 봉사자3이 희망 보호소에 신청 (APPROVED)
        VolunteerApplication app5 = VolunteerApplication.createApplication(
                members.get(3), // 봉사자3
                shelters.get(1), // 희망 보호소
                today.plusDays(6),
                LocalTime.of(10, 0),
                LocalTime.of(15, 0),
                "사진 촬영 봉사 가능합니다. 입양 홍보 사진 찍어드릴게요!"
        );
        app5.approve();
        applications.add(app5);

        // 봉사자3이 행복 보호소에 신청 (PENDING)
        VolunteerApplication app6 = VolunteerApplication.createApplication(
                members.get(3), // 봉사자3
                shelters.get(2), // 행복 보호소
                today.plusDays(12),
                LocalTime.of(11, 0),
                LocalTime.of(16, 0),
                "정기적으로 봉사하고 싶습니다. 매주 토요일 가능합니다."
        );
        applications.add(app6);

        // 봉사자1이 행복 보호소에 신청 (CANCELLED)
        VolunteerApplication app7 = VolunteerApplication.createApplication(
                members.get(1), // 봉사자1
                shelters.get(2), // 행복 보호소
                today.plusDays(8),
                LocalTime.of(13, 0),
                LocalTime.of(17, 0),
                "시간이 맞지 않아 취소합니다."
        );
        app7.cancel();
        applications.add(app7);

        return volunteerApplicationRepository.saveAll(applications);
    }
}
