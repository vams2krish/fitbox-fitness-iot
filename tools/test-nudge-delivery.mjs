import {execFileSync} from 'node:child_process';import {mkdirSync} from 'node:fs';
const jdk=process.env.JAVA_HOME||'C:/Users/adamv/AppData/Local/ShamVerseToolchains/jdk-17',target='.cache/nudge-java-tests';mkdirSync(target,{recursive:true});
execFileSync(jdk+'/bin/javac.exe',['-d',target,'android/app/src/main/java/com/fitbox/app/NudgeDeliveryPolicy.java','tests/java/NudgeDeliveryPolicyTest.java'],{stdio:'inherit'});
execFileSync(jdk+'/bin/java.exe',['-cp',target,'com.fitbox.app.NudgeDeliveryPolicyTest'],{stdio:'inherit'});
