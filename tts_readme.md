# 설치

1. flutter_tts 패키지 설치

참고로 simulator에 버전에 따라 안될수도 있어유
특히 iOS 버전 17.1 이하에 안 될수도 있어유

let voiceList = AVSpeechSynthesisVoice.speechVoices()

# 사용

### Import

`import 'package:flutter_tts/flutter_tts.dart';`

### State나 어딘가에

`late FlutterTts flutterTts;`

### Init나 어딘가에

```
flutterTts = FlutterTts();
flutterTts.setSharedInstance(true);
flutterTts.setLanguage("ko-KR");
flutterTts.setVoice({"name": "Yuna", "locale": "ko-KR"});
```

# 말하기

`await flutterTts.speak("Hello World");`

참고: 스피치 시작하자마자 다음줄로 넘어갑니다. 근데 그게 좋은 것 같아유 굳이 기다리는 것보다. 그렇다.

### 속도, 볼륨 조절

속도
`flutterTts.setSpeechRate(1.0);`
볼륨
`flutterTts.setVolume(1.0);`
목솔이 높이
`flutterTts.setPitch(1.0);`
