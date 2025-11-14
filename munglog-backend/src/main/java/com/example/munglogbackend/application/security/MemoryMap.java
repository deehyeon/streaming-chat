package com.example.munglogbackend.application.security;

public interface MemoryMap {
    void setValue(String key, String value, Long timeout);;

    String getValue(String key);

    void deleteValue(String key);

    boolean checkExistsValue(String key);
}
