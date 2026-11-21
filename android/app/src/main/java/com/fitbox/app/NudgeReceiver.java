package com.fitbox.app;
import android.content.*;import org.json.*;
public class NudgeReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context context,Intent intent){try{String json=intent.getStringExtra("event");if(json!=null){JSONObject event=new JSONObject(json);NudgeScheduler.deliver(context,event,intent.getLongExtra("scheduledAt",System.currentTimeMillis()),false);if(event.optString("kind").equals("comeback"))NudgeScheduler.nextComeback(context,event);}}catch(JSONException ignored){}}
}
