package com.example.munglogbackend.config.init;

import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.member.enumerate.MemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * CSV 파일로부터 대량의 회원 데이터를 로딩하는 Component
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"local", "prod"})
public class CsvMemberLoader {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CSV_FILE_PATH = "members_10k.csv";
    private static final int BATCH_SIZE = 500; // 배치 크기 (성능 최적화)

    /**
     * CSV 파일에서 회원 데이터를 읽어서 DB에 저장
     */
    @Transactional
    public void loadMembersFromCsv() {
        try {
            ClassPathResource resource = new ClassPathResource(CSV_FILE_PATH);

            if (!resource.exists()) {
                log.warn("⚠️ CSV 파일이 존재하지 않습니다: {}", CSV_FILE_PATH);
                log.warn("⚠️ 기본 Mock 데이터만 생성됩니다.");
                return;
            }

            log.info("📄 CSV 파일 로딩 시작: {}", CSV_FILE_PATH);
            long startTime = System.currentTimeMillis();

            List<Member> memberBatch = new ArrayList<>();
            int totalCount = 0;
            int lineNumber = 0;

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                // 헤더 스킵
                String headerLine = reader.readLine();
                if (headerLine == null) {
                    log.warn("⚠️ CSV 파일이 비어있습니다.");
                    return;
                }

                String line;
                while ((line = reader.readLine()) != null) {
                    lineNumber++;

                    try {
                        Member member = parseCsvLine(line, lineNumber);
                        if (member != null) {
                            memberBatch.add(member);
                            totalCount++;

                            // 배치 단위로 저장
                            if (memberBatch.size() >= BATCH_SIZE) {
                                memberRepository.saveAll(memberBatch);
                                memberBatch.clear();
                                log.info("✓ {}명 저장 완료...", totalCount);
                            }
                        }
                    } catch (Exception e) {
                        log.error("❌ CSV 라인 {} 파싱 실패: {}", lineNumber, e.getMessage());
                    }
                }

                // 남은 데이터 저장
                if (!memberBatch.isEmpty()) {
                    memberRepository.saveAll(memberBatch);
                    log.info("✓ {}명 저장 완료...", totalCount);
                }

            }

            long endTime = System.currentTimeMillis();
            long duration = (endTime - startTime) / 1000;

            log.info("🎉 CSV 로딩 완료!");
            log.info("   - 총 회원 수: {}명", totalCount);
            log.info("   - 소요 시간: {}초", duration);

            // 역할별 통계
            logMemberStatistics();

        } catch (Exception e) {
            log.error("❌ CSV 파일 로딩 중 오류 발생", e);
            throw new RuntimeException("CSV 파일 로딩 실패", e);
        }
    }

    /**
     * CSV 라인을 파싱해서 Member 엔티티 생성
     * CSV 형식: name,email,password,role,zipcode,address,addressDetail
     */
    private Member parseCsvLine(String line, int lineNumber) {
        // CSV 콤마 처리 (따옴표 안의 콤마는 무시)
        String[] fields = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

        if (fields.length < 7) {
            log.warn("⚠️ 라인 {}: 필드 수 부족 ({}개)", lineNumber, fields.length);
            return null;
        }

        try {
            String name = fields[0].trim().replace("\"", "");
            String email = fields[1].trim().replace("\"", "");
            String rawPassword = fields[2].trim().replace("\"", "");
            String roleStr = fields[3].trim().replace("\"", "");
            String zipcode = fields[4].trim().replace("\"", "");
            String address = fields[5].trim().replace("\"", "");
            String addressDetail = fields[6].trim().replace("\"", "");

            // 역할 변환
            MemberRole role = MemberRole.valueOf(roleStr);

            // 비밀번호 인코딩
            String encodedPassword = passwordEncoder.encode(rawPassword);

            // Member 생성
            return Member.builder()
                    .name(name)
                    .email(Email.from(email))
                    .hashedPassword(encodedPassword)
                    .role(role)
                    .address(Address.create(zipcode, address, addressDetail))
                    .build();

        } catch (Exception e) {
            log.error("❌ 라인 {} 파싱 오류: {}", lineNumber, e.getMessage());
            return null;
        }
    }

    /**
     * 회원 역할별 통계 로깅
     */
    private void logMemberStatistics() {
        long volunteerCount = memberRepository.countByRole(MemberRole.VOLUNTEER);
        long shelterOwnerCount = memberRepository.countByRole(MemberRole.SHELTER_OWNER);
        long adminCount = memberRepository.countByRole(MemberRole.ADMIN);
        long totalCount = memberRepository.count();

        log.info("📊 회원 통계:");
        log.info("   - 전체: {}명", totalCount);
        log.info("   - 봉사자 (VOLUNTEER): {}명 ({}%)",
                volunteerCount, String.format("%.1f", volunteerCount * 100.0 / totalCount));
        log.info("   - 보호소 소유자 (SHELTER_OWNER): {}명 ({}%)",
                shelterOwnerCount, String.format("%.1f", shelterOwnerCount * 100.0 / totalCount));
        log.info("   - 관리자 (ADMIN): {}명 ({}%)",
                adminCount, String.format("%.1f", adminCount * 100.0 / totalCount));
    }
}
