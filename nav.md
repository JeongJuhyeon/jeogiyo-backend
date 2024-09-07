# Coordinates

## 약수역 (시작점)

```json
{
	"latitude": 37.554759,
	"longitude": 127.010649
}
```

- 남쪽 방향에 있는 역 예: 신사역
- 북쪽 방향에 있는 역 예: 안국역

# 위치 들고오기

### 설치

1. Install package `fl_location`
2. Add to Info.plist

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location when open.</string>
```

### 현위치 가져오기

밑 함수 일단 선언 (일단 미사용)

```dart
Future<bool> _checkAndRequestPermission({bool? background}) async {
  if (!await FlLocation.isLocationServicesEnabled) {
    // Location services is disabled.
    return false;
  }

  LocationPermission permission = await FlLocation.checkLocationPermission();
  if (permission == LocationPermission.deniedForever) {
    // Location permission has been permanently denied.
    return false;
  } else if (permission == LocationPermission.denied) {
    // Ask the user for location permission.
    permission = await FlLocation.requestLocationPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      // Location permission has been denied.
      return false;
    }
  }

  // Location permission must always be granted (LocationPermission.always)
  // to collect location data in the background.
  if (background == true && permission == LocationPermission.whileInUse) {
    // Location permission must always be granted to collect location in the background.
    return false;
  }

  return true;
}
```

위치 들고오기: 이때 위 함수 사용됩니다. API 부르기 전에 사용하시면 됩니다.

```dart
Future<void> _getLocation() async {
  if (await _checkAndRequestPermission()) {
    final Location location = await FlLocation.getLocation();
    print('location: ${location.toJson()}');
    return {
      'latitude': location.latitude,
      'longitude': location.longitude,
    };
  }
}


```
