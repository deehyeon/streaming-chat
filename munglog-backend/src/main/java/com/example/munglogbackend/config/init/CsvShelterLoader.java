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

            // 이메일 목록 샘플 로깅 (디버깅용)
            if (!memberByEmail.isEmpty()) {
                log.debug("✓ 회원 이메일 샘플 (처음 5개):");
                memberByEmail.keySet().stream().limit(5).forEach(email ->
                        log.debug("   - {}", email));
            }

            List<Shelter> shelterBatch = new ArrayList<>();
            int totalCount = 0;
            int lineNumber = 0;
            int skippedCount = 0;
            int ownerNotFoundCount = 0;
            int parseErrorCount = 0;

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                // 헤더 스킵
                String headerLine = reader.readLine();
                if (headerLine == null) {
                    log.warn("⚠️ CSV 파일이 비어있습니다.");
                    return;
                }
                log.info("📋 CSV 헤더: {}", headerLine);

                String line;
                while ((line = reader.readLine()) != null) {
                    lineNumber++;

                    // 빈 줄 스킵
                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    try {
                        ParseResult result = parseCsvLine(line, lineNumber, memberByEmail);

                        if (result.shelter != null) {
                            shelterBatch.add(result.shelter);
                            totalCount++;

                            // 처음 3개는 성공 로그 출력
                            if (totalCount <= 3) {
                                log.info("✓ 보호소 생성 성공 (라인 {}): {}", lineNumber, result.shelter.getName());
                            }

                            // 배치 단위로 저장
                            if (shelterBatch.size() >= BATCH_SIZE) {
                                shelterRepository.saveAll(shelterBatch);
                                shelterBatch.clear();
                                log.info("✓ {}개 보호소 저장 완료...", totalCount);
                            }
                        } else {
                            skippedCount++;
                            if (result.skipReason != null) {
                                if (result.skipReason.contains("소유자를 찾을 수 없습니다")) {
                                    ownerNotFoundCount++;
                                    // 처음 3개만 상세 로그
                                    if (ownerNotFoundCount <= 3) {
                                        log.warn("⚠️ 라인 {}: {} - {}", lineNumber, result.skipReason, result.ownerEmail);
                                    }
                                } else {
                                    parseErrorCount++;
                                    if (parseErrorCount <= 3) {
                                        log.warn("⚠️ 라인 {}: {}", lineNumber, result.skipReason);
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("❌ CSV 라인 {} 파싱 실패: {}", lineNumber, e.getMessage());
                        if (parseErrorCount < 3) {
                            log.error("   라인 내용: {}", line.substring(0, Math.min(100, line.length())));
                        }
                        parseErrorCount++;
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

            log.info("");
            log.info("🎉 보호소 CSV 로딩 완료!");
            log.info("   - 총 처리 라인: {}개", lineNumber);
            log.info("   - 성공적으로 생성된 보호소: {}개", totalCount);
            log.info("   - 건너뛴 데이터: {}개", skippedCount);
            if (ownerNotFoundCount > 0) {
                log.info("   - 소유자 미발견: {}개", ownerNotFoundCount);
            }
            if (parseErrorCount > 0) {
                log.info("   - 파싱 오류: {}개", parseErrorCount);
            }
            log.info("   - 소요 시간: {}초", duration);

            // 통계
            logShelterStatistics();

        } catch (Exception e) {
            log.error("❌ CSV 파일 로딩 중 오류 발생", e);
            throw new RuntimeException("보호소 CSV 파일 로딩 실패", e);
        }
    }

    /**
     * CSV 파싱 결과를 담는 내부 클래스
     */
    private static class ParseResult {
        Shelter shelter;
        String skipReason;
        String ownerEmail;

        static ParseResult success(Shelter shelter) {
            ParseResult result = new ParseResult();
            result.shelter = shelter;
            return result;
        }

        static ParseResult skip(String reason, String ownerEmail) {
            ParseResult result = new ParseResult();
            result.skipReason = reason;
            result.ownerEmail = ownerEmail;
            return result;
        }
    }

    /**
     * CSV 라인을 파싱해서 Shelter 엔티티 생성
     * CSV 형식: shelter_id,owner_email,name,email,phone,zipcode,address,address_detail,opening_hours,volunteer_info,description,url,created_at,modified_at
     */
    private ParseResult parseCsvLine(String line, int lineNumber, Map<String, Member> memberByEmail) {
        try {
            // 개선된 CSV 파싱: RFC 4180 표준을 따르는 파싱
            List<String> fields = parseCsvLineRFC4180(line);

            if (fields.size() < 14) {
                return ParseResult.skip(
                        String.format("필드 수 부족 (%d개/14개 필요)", fields.size()),
                        null
                );
            }

            // 필드 추출 (인덱스 0부터)
            // 0: shelter_id (사용 안 함)
            String ownerEmail = cleanField(fields.get(1));
            String name = cleanField(fields.get(2));
            String email = cleanField(fields.get(3));
            String phone = cleanField(fields.get(4));
            String zipcode = cleanField(fields.get(5));
            String address = cleanField(fields.get(6));
            String addressDetail = cleanField(fields.get(7));
            String openingHours = cleanField(fields.get(8));
            String volunteerInfo = cleanField(fields.get(9));
            String description = cleanField(fields.get(10));
            String url = cleanField(fields.get(11));
            // 12, 13: created_at, modified_at (JPA가 자동 생성)

            // 필수 필드 검증
            if (ownerEmail == null || ownerEmail.isEmpty()) {
                return ParseResult.skip("소유자 이메일이 비어있음", null);
            }

            if (name == null || name.isEmpty()) {
                return ParseResult.skip("보호소 이름이 비어있음", ownerEmail);
            }

            // Owner 찾기
            Member owner = memberByEmail.get(ownerEmail);
            if (owner == null) {
                return ParseResult.skip("소유자를 찾을 수 없습니다", ownerEmail);
            }

            // Email 검증 및 생성
            Email shelterEmail;
            if (email != null && !email.isEmpty()) {
                try {
                    shelterEmail = Email.from(email);
                } catch (Exception e) {
                    // Email 생성 실패 시 owner의 이메일 사용
                    log.debug("⚠️ 라인 {}: 잘못된 이메일 형식 '{}', owner 이메일로 대체", lineNumber, email);
                    shelterEmail = owner.getEmail();
                }
            } else {
                // email이 없으면 owner의 이메일 사용
                shelterEmail = owner.getEmail();
            }

            // URL 리스트 생성 (빈 값 처리)
            List<String> urls = new ArrayList<>();
            if (url != null && !url.isEmpty()) {
                urls.add(url);
            }

            // Address 생성 (null 체크)
            Address shelterAddress;
            try {
                shelterAddress = Address.create(
                        zipcode != null ? zipcode : "",
                        address != null ? address : "",
                        addressDetail != null ? addressDetail : ""
                );
            } catch (Exception e) {
                log.warn("⚠️ 라인 {}: 주소 생성 실패, 기본값 사용", lineNumber);
                shelterAddress = Address.create("00000", "주소 미상", "");
            }

            // Shelter 생성
            Shelter shelter = Shelter.createShelter(
                    owner,
                    name,
                    phone,
                    shelterEmail,
                    urls,
                    description,
                    openingHours,
                    volunteerInfo,
                    shelterAddress
            );

            return ParseResult.success(shelter);

        } catch (Exception e) {
            log.error("❌ 라인 {} 파싱 오류: {}", lineNumber, e.getMessage(), e);
            return ParseResult.skip("파싱 예외: " + e.getMessage(), null);
        }
    }

    /**
     * RFC 4180 표준을 따르는 CSV 파싱
     * - 따옴표로 감싸진 필드 내부의 콤마는 무시
     * - 따옴표 내부의 따옴표는 두 개의 따옴표("")로 이스케이프
     */
    private List<String> parseCsvLineRFC4180(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder currentField = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    // 이스케이프된 따옴표 ("")
                    currentField.append('"');
                    i++; // 다음 따옴표 스킵
                } else {
                    // 따옴표 토글
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                // 필드 구분자 (따옴표 밖에서만)
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }

        // 마지막 필드 추가
        fields.add(currentField.toString());

        return fields;
    }

    /**
     * CSV 필드에서 공백 제거 및 정리
     */
    private String cleanField(String field) {
        if (field == null) {
            return null;
        }
        String cleaned = field.trim();

        // 빈 문자열을 null로 변환
        if (cleaned.isEmpty() || cleaned.equalsIgnoreCase("null")) {
            return null;
        }

        return cleaned;
    }

    /**
     * 보호소 통계 로깅
     */
    private void logShelterStatistics() {
        long totalCount = shelterRepository.count();

        log.info("");
        log.info("📊 보호소 통계:");
        log.info("   - 전체 보호소: {}개", totalCount);
        log.info("   - 지역별 분포는 DB 쿼리로 확인 가능합니다.");
    }
}