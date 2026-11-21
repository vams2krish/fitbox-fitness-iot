package com.fitbox.app;

/** Pure delivery guard, shared by native delivery and JVM regression checks. */
public final class NudgeDeliveryPolicy {
    private NudgeDeliveryPolicy() {}
    public static boolean allow(boolean enabled, boolean foreground, boolean quiet,
            long now, long scheduledAt, long ttl, boolean followup,
            long lastOpenedAt, long joinSince, int used, int maximum, boolean delivered) {
        if (!enabled || foreground || quiet || delivered || ttl <= 0) return false;
        if (now < scheduledAt || now - scheduledAt > ttl) return false;
        if (followup && (joinSince <= 0 || lastOpenedAt >= joinSince)) return false;
        return used < Math.max(1, Math.min(2, maximum));
    }
}
