package com.fitbox.app;
public class NudgeDeliveryPolicyTest {
  static void check(boolean expected, boolean enabled, boolean foreground, boolean quiet, long now, long scheduled, long ttl, boolean followup, long lastOpen, long since, int used, int max, boolean duplicate) {
    if(NudgeDeliveryPolicy.allow(enabled,foreground,quiet,now,scheduled,ttl,followup,lastOpen,since,used,max,duplicate)!=expected)throw new AssertionError("Native reminder guard regression");
  }
  public static void main(String[] args) {
    check(true,true,false,false,1000,900,500,false,0,0,0,2,false);
    check(false,true,true,false,1000,900,500,false,0,0,0,2,false);
    check(false,true,false,true,1000,900,500,false,0,0,0,2,false);
    check(false,false,false,false,1000,900,500,false,0,0,0,2,false);
    check(false,true,false,false,1000,900,500,false,0,0,0,2,true);
    check(false,true,false,false,1500,900,500,false,0,0,0,2,false);
    check(false,true,false,false,800,900,500,false,0,0,0,2,false);
    check(false,true,false,false,1000,900,500,false,0,0,2,2,false);
    check(true,true,false,false,1000,900,500,true,500,700,1,2,false);
    check(false,true,false,false,1000,900,500,true,700,700,1,2,false);
    check(false,true,false,false,1000,900,500,true,800,700,1,2,false);
    check(false,true,false,false,1000,900,500,true,0,0,0,2,false);
    System.out.println("PASS: 12 native reminder delivery cases: foreground, quiet hours, consent, duplicate, expiry, clock rollback, daily cap and joined-session suppression.");
  }
}
