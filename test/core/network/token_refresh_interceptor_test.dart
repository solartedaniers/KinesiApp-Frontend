import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/network/bearer_auth_interceptor.dart';
import 'package:frontend/core/network/token_refresh_interceptor.dart';
import 'package:frontend/core/storage/secure_session_storage.dart';

import '../../support/fake_secure_storage_platform.dart';

/// Adapter fake que responde según una función, sin tocar la red real.
class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter(this.responder);

  final ResponseBody Function(RequestOptions options) responder;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) => Future.value(responder(options));

  @override
  void close({bool force = false}) {}
}

ResponseBody _json(Object data, int statusCode) => ResponseBody.fromString(
  jsonEncode(data),
  statusCode,
  headers: {
    Headers.contentTypeHeader: [Headers.jsonContentType],
  },
);

void main() {
  late FakeSecureStoragePlatform fakePlatform;
  late SecureSessionStorage storage;

  setUp(() async {
    fakePlatform = FakeSecureStoragePlatform();
    FlutterSecureStoragePlatform.instance = fakePlatform;
    storage = SecureSessionStorage();
    fakePlatform.data['access_token'] = 'old-access';
    fakePlatform.data['refresh_token'] = 'old-refresh';
  });

  Dio buildAuthenticatedDio({
    required Future<void> Function() onSessionExpired,
    required _FakeAdapter refreshAdapter,
  }) {
    final refreshDio = Dio(BaseOptions(baseUrl: 'https://api.test'))
      ..httpClientAdapter = refreshAdapter;
    final dio = Dio(BaseOptions(baseUrl: 'https://api.test'))
      ..httpClientAdapter = _FakeAdapter(
        (options) => _json({'detail': 'unauthorized'}, 401),
      )
      ..interceptors.addAll([
        BearerAuthInterceptor(storage),
        TokenRefreshInterceptor(
          storage,
          refreshDio,
          onSessionExpired: onSessionExpired,
        ),
      ]);
    return dio;
  }

  test(
    'concurrent 401s share a single refresh and each request retries once',
    () async {
      var refreshCalls = 0;
      final refreshAdapter = _FakeAdapter((options) {
        if (options.path.contains('/auth/refresh')) {
          refreshCalls++;
          return _json({
            'access_token': 'new-access',
            'refresh_token': 'new-refresh',
            'token_type': 'bearer',
          }, 200);
        }
        final authHeader = options.headers['Authorization'];
        return authHeader == 'Bearer new-access'
            ? _json({'ok': true}, 200)
            : _json({'detail': 'unauthorized'}, 401);
      });

      final dio = buildAuthenticatedDio(
        onSessionExpired: () async {},
        refreshAdapter: refreshAdapter,
      );

      final responses = await Future.wait([
        dio.get('/protected'),
        dio.get('/protected'),
      ]);

      expect(responses[0].statusCode, 200);
      expect(responses[1].statusCode, 200);
      expect(
        refreshCalls,
        1,
        reason: 'both requests must share the same in-flight refresh',
      );
      expect(fakePlatform.data['access_token'], 'new-access');
    },
  );

  test(
    'a failed refresh clears the session and reports it exactly once',
    () async {
      var sessionExpiredCalls = 0;
      final refreshAdapter = _FakeAdapter(
        (options) => _json({'detail': 'invalid refresh token'}, 401),
      );

      final dio = buildAuthenticatedDio(
        onSessionExpired: () async => sessionExpiredCalls++,
        refreshAdapter: refreshAdapter,
      );

      final results = await Future.wait([
        dio
            .get('/protected')
            .catchError((error) => (error as DioException).response!),
        dio
            .get('/protected')
            .catchError((error) => (error as DioException).response!),
      ]);

      expect(results.every((response) => response.statusCode == 401), isTrue);
      expect(sessionExpiredCalls, 1);
      expect(fakePlatform.data.containsKey('access_token'), isFalse);
    },
  );
}
