import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/models/auth/current_user.dart';
import 'package:frontend/models/user_role.dart';
import 'package:frontend/repositories/api_jump_analysis_consent_repository.dart';
import 'package:frontend/services/auth/session_controller.dart';
import 'package:frontend/services/users/user_api.dart';

CurrentUser _user({int? consentVersion}) => CurrentUser(
  id: 1,
  email: 'a@a.com',
  fullName: 'Athlete',
  role: UserRole.athlete,
  isActive: true,
  isVerified: true,
  videoConsentVersion: consentVersion,
);

class _FakeSession extends Fake implements SessionController {
  _FakeSession(this.currentUser);

  @override
  CurrentUser? currentUser;

  @override
  void updateCurrentUser(CurrentUser user) => currentUser = user;
}

class _FakeUserApi extends Fake implements UserApi {
  final List<int> grantedVersions = [];

  @override
  Future<CurrentUser> grantVideoConsent(int version) async {
    grantedVersions.add(version);
    return _user(consentVersion: version);
  }
}

void main() {
  test('consent is read from the server-backed session user', () async {
    final repository = ApiJumpAnalysisConsentRepository(
      _FakeUserApi(),
      _FakeSession(_user(consentVersion: 1)),
    );

    expect(await repository.hasConsent(1), isTrue);
    // Un texto legal nuevo exige volver a aceptar
    expect(await repository.hasConsent(2), isFalse);
  });

  test('recording consent calls the API and refreshes the session', () async {
    final api = _FakeUserApi();
    final session = _FakeSession(_user());
    final repository = ApiJumpAnalysisConsentRepository(api, session);

    expect(await repository.hasConsent(1), isFalse);
    await repository.recordConsent(1);

    expect(api.grantedVersions, [1]);
    expect(await repository.hasConsent(1), isTrue);
  });

  test('CurrentUser parses the consent version exposed by /auth/me', () {
    final json = {
      'id': 1,
      'email': 'a@a.com',
      'full_name': 'A',
      'role': 'athlete',
      'is_active': true,
      'is_verified': true,
      'video_consent_version': 3,
    };
    expect(CurrentUser.fromJson(json).videoConsentVersion, 3);
    expect(
      CurrentUser.fromJson(
        {...json}..remove('video_consent_version'),
      ).videoConsentVersion,
      isNull,
    );
  });
}
