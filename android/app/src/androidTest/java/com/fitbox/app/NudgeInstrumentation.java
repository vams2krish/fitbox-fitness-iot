package com.fitbox.app;

import android.app.Instrumentation;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import org.json.JSONObject;
import java.util.Map;
import java.util.Set;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** Emulator-only instrumentation; never bundled into the distributed FitBox APK. */
public class NudgeInstrumentation extends Instrumentation {
    @Override public void onCreate(Bundle arguments) { super.onCreate(arguments);start(); }
    private void check(boolean condition,String message) { if(!condition)throw new AssertionError(message); }
    @Override public void onStart() {
        Context c=getTargetContext();SharedPreferences prefs=c.getSharedPreferences("fitbox-nudges",Context.MODE_PRIVATE);
        Map<String,?> original=prefs.getAll();NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);Bundle result=new Bundle();
        try {
            NudgeScheduler.cancel(c);prefs.edit().clear().commit();long now=System.currentTimeMillis();
            JSONObject options=new JSONObject().put("sleepStart","00:00").put("sleepEnd","00:00").put("workQuiet",false).put("maxDaily",2).put("sound",false);
            prefs.edit().putString("payload",new JSONObject().put("enabled",true).put("prefs",options).put("lastOpenedAt",0).toString()).commit();
            check(NudgeScheduler.allowed(c),"Notification permission required for emulator test");
            JSONObject event=new JSONObject().put("id","instrumented-visit").put("kind","followup").put("title","FitBox delivery fixture").put("body","Native delivery regression test").put("route","program").put("at",now).put("expiresAt",now+60000).put("joinSince",now-1000);
            NudgeScheduler.foreground(c,true);NudgeScheduler.deliver(c,event,now,false);
            check(manager.getActiveNotifications().length==0,"Foreground reminder must be suppressed");
            NudgeScheduler.foreground(c,false);NudgeScheduler.deliver(c,event,now,false);
            check(manager.getActiveNotifications().length==0,"Recent native visit must suppress follow-up before WebView refresh");
            prefs.edit().putLong("lastForegroundAt",0).commit();NudgeScheduler.deliver(c,event,now,false);
            check(manager.getActiveNotifications().length==1,"Eligible background follow-up must post");
            String countKey="count-"+new SimpleDateFormat("yyyy-MM-dd",Locale.US).format(new Date());
            check(prefs.getInt(countKey,0)==1,"One successful delivery consumes one daily slot");
            NudgeScheduler.deliver(c,event,now,false);
            check(manager.getActiveNotifications().length==1&&prefs.getInt(countKey,0)==1,"Replay must not repost or consume another slot");
            event.put("id","instrumented-second").put("kind","workout");NudgeScheduler.deliver(c,event,now,false);
            check(manager.getActiveNotifications().length==2&&prefs.getInt(countKey,0)==2,"Second distinct delivery is allowed");
            event.put("id","instrumented-third");NudgeScheduler.deliver(c,event,now,false);
            check(manager.getActiveNotifications().length==2,"Daily cap must block a third delivery");
            check(prefs.getString("delivered","").contains("instrumented-second"),"Delivery IDs must persist");
            result.putString("result","PASS: real native delivery, foreground and joined-session suppression, persistent replay protection, daily cap and silent notification channel.");
            finish(-1,result);
        } catch(Throwable error) { result.putString("failure",error.toString());finish(0,result); }
        finally {
            manager.cancelAll();SharedPreferences.Editor edit=prefs.edit().clear();for(Map.Entry<String,?> entry:original.entrySet()){String k=entry.getKey();Object v=entry.getValue();if(v instanceof String)edit.putString(k,(String)v);else if(v instanceof Integer)edit.putInt(k,(Integer)v);else if(v instanceof Long)edit.putLong(k,(Long)v);else if(v instanceof Boolean)edit.putBoolean(k,(Boolean)v);else if(v instanceof Float)edit.putFloat(k,(Float)v);else if(v instanceof Set)edit.putStringSet(k,(Set<String>)v);}edit.commit();NudgeScheduler.foreground(c,false);NudgeScheduler.restore(c);
        }
    }
}
