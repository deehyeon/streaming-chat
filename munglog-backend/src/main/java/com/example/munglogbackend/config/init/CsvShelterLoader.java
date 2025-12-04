package com.example.munglogbackend.config.init;

import com.example.munglogbackend.application.member.required.MemberRepository;
import com.example.munglogbackend.application.shelter.required.ShelterRepository;
import com.example.munglogbackend.domain.global.vo.Address;
import com.example.munglogbackend.domain.global.vo.Email;
import com.example.munglogbackend.domain.member.Member;
import com.example.munglogbackend.domain.shelter.Shelter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CSV 파일로부터 대량의 보호소 데이터를 로딩하는 Component
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"local", "prod"})
public class CsvShelterLoader {

    private final ShelterRepository shelterRepository;
    private final MemberRepository memberRepository;

    private static final String CSV_FILE_PATH = "shelters_2573.csv";
    private static final int BATCH_SIZE = 500; // 배치 크기 (성능 최적화)

    /**
     * CSV 파일에서 보호소 데이터를 읽어서 DB에 저장
     */
    @Transactional
    public void loadSheltersFromCsv() {
        try {
            ClassPathResource resource = new ClassPathResource(CSV_FILE_PATH);

            if (!resource.exists()) {
                log.warn("⚠️ CSV 파일이 존재하지 않습니다: {}", CSV_FILE_PATH);
                log.warn("⚠️ 보호소 데이터가 생성되지 않습니다.");
                return;
            }

            log.info("🏠 CSV 파일 로딩 시작: {}", CSV_FILE_PATH);
            long startTime = System.currentTimeMillis();

            // 이메일로 Member 매핑 (성능 최적화)
            Map<String, Member> memberByEmail = new HashMap<>();
            List<Member> allMembers = memberRepository.findAll();
            for (Member member : allMembers) {
                memberByEmail.put(member.getEmail().email(), member);
            }
            log.info("✓ 회원 데이터 로드 완료: {}명", memberByEmail.size());

            List<Shelter> shelterBatch = new ArrayList<>();
            int totalCount = 0;
            int lineNumber = 0;
            int skippedCount = 0;

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                // 헤더 스킵
                String headerLine = reader.readLine();
                if (headerLine == null) {
                    log.warn("⚠️ CSV 파일이 비어있습니다.");
                    return;
                }
                log.debug("📋 CSV 헤더: {}", headerLine);

                String line;
                while ((line = reader.readLine()) != null) {
                    lineNumber++;

                    try {
                        Shelter shelter = parseCsvLine(line, lineNumber, memberByEmail);
                        if (shelter != null) {
                            shelterBatch.add(shelter);
                            totalCount++;

                            // 배치 단위로 저장
                            if (shelterBatch.size() >= BATCH_SIZE) {
                                shelterRepository.saveAll(shelterBatch);
                                shelterBatch.clear();
                                log.info("✓ {}개 보호소 저장 완료...", totalCount);
                            }
                        } else {
                            skippedCount++;
                        }
                    } catch (Exception e) {
                        log.error("❌ CSV 라인 {} 파싱 실패: {}", lineNumber, e.getMessage());
                        skippedCount++;
                    }
                }

                // 남은 데이터 저장
                if (!shelterBatch.isEmpty()) {
                    shelterRepository.saveAll(shelterBatch);
                    log.info("✓ {}개 보호소 저장 완료...", totalCount);
                }

            }

            long endTime = System.currentTimeMillis();
            long duration = (endTime - startTime) / 1000;

            log.info("🎉 보호소 CSV 로딩 완료!");
            log.info("   - 총 보호소 수: {}개", totalCount);
            log.info("   - 건너뛴 데이터: {}개", skippedCount);
            log.info("   - 소요 시간: {}초", duration);

            // 통계
            logShelterStatistics();

        } catch (Exception e) {
            log.error("❌ CSV 파일 로딩 중 오류 발생", e);
            throw new RuntimeException("보호소 CSV 파일 로딩 실패", e);
        }
    }

    /**
     * CSV 라인을 파싱해서 Shelter 엔티티 생성
     * CSV 형식: shelter_id,owner_email,name,email,phone,zipcode,address,address_detail,opening_hours,volunteer_info,description,url,created_at,modified_at
     */
    private Shelter parseCsvLine(String line, int lineNumber, Map<String, Member> memberByEmail) {
        // CSV 콤마 처리 (따옴표 안의 콤마는 무시)
        String[] fields = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);

        if (fields.length < 14) {
            log.warn("⚠️ 라인 {}: 필드 수 부족 ({}개/14개)", lineNumber, fields.length);
            return null;
        }

        try {
            // shelter_id는 건너뛰기 (fields[0])
            String ownerEmail = cleanField(fields[1]);
            String name = cleanField(fields[2]);
            String email = cleanField(fields[3]);
            String phone = cleanField(fields[4]);
            String zipcode = cleanField(fields[5]);
            String address = cleanField(fields[6]);
            String addressDetail = cleanField(fields[7]);
            String openingHours = cleanField(fields[8]);
            String volunteerInfo = cleanField(fields[9]);
            String description = cleanField(fields[10]);
            String url = cleanField(fields[11]);
            // created_at, modified_at은 JPA가 자동 생성

            // Owner 찾기
            Member owner = memberByEmail.get(ownerEmail);
            if (owner == null) {
                log.warn("⚠️ 라인 {}: 소유자를 찾을 수 없습니다 ({})", lineNumber, ownerEmail);
                return null;
            }

            // Shelter 생성
            Shelter shelter = Shelter.createShelter(
                    owner,
                    name,
                    phone,
                    Email.from(email),
                    url != null ? List.of(url) : List.of(),
                    description,
                    openingHours,
                    volunteerInfo,
                    Address.create(zipcode, address, addressDetail)
            );

            return shelter;

        } catch (Exception e) {
            log.error("❌ 라인 {} 파싱 오류: {} - 라인: {}", lineNumber, e.getMessage(), line);
            return null;
        }
    }

    /**
     * CSV 필드에서 따옴표 제거 및 trim
     */
    private String cleanField(String field) {
        if (field == null) {
            return null;
        }
        String cleaned = field.trim().replace("\"", "");
        return cleaned.isEmpty() ? null : cleaned;
    }

    /**
     * 보호소 통계 로깅
     */
    private void logShelterStatistics() {
        long totalCount = shelterRepository.count();

        log.info("📊 보호소 통계:");
        log.info("   - 전체 보호소: {}개", totalCount);

        // 지역별 통계 (상위 10개)
        log.info("   - 지역별 분포는 DB 쿼리로 확인 가능합니다.");
    }
}
