package com.example.munglogbackend.domain.member.persistence;

import com.example.munglogbackend.domain.global.vo.Email;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EmailAttributeConverter
        implements AttributeConverter<Email,String> {

    @Override
    public String convertToDatabaseColumn(Email attribute) {
        return attribute == null ? null : attribute.email();
    }

    @Override
    public Email convertToEntityAttribute(String dbData) {
        return dbData == null || dbData.isBlank()
                ? null
                : new Email(dbData);
    }
}
