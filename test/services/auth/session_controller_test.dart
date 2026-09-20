import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/network/api_exception.dart';
import 'package:frontend/core/network/error_code.dart';
import 'package:frontend/models/auth/current_user.dart';
import 'package:frontend/models/auth/session_status.dart';
import 'package:frontend/models/user_role.dart';
import 'package:frontend/repositories/auth_repository.dart';
import 'package:frontend/services/auth/session_controller.dart';
import 'package:frontend/use_cases/auth/login_use_case.dart';
import 'package:frontend/use_cases/auth/logout_use_case.dart';
import 'package:frontend/use_cases/auth/register_use_case.dart';
import 'package:frontend/use_cases/auth/restore_session_use_case.dart';
import 'package:frontend/use_cases/auth/verify_email_use_case.dart';

const _user = CurrentUser(
  id: 1,
  email: 'a@a.com',
  fullName: 'Athlete',
  role: UserRole.athlete,
  isActive: true,
  isVerified: true,
);

/// Fake de [AuthRepository] controlado por el test, sin librería de mocking.
class _FakeAuthRepository implements AuthRepository {
  bool hasSession = false;
  bool loginShouldFail = false;

  @override
  Future<bool> hasStoredSession() async => hasSession;

  @override
  Future<CurrentUser> fetchCurrentUser() async => _user;

  @override
  Future<CurrentUser> login({
    required String email,
    required String password,
  }) async {
    if (loginShouldFail) {
      throw const ApiException('bad credentials', ErrorCode.invalidCredentials);
    }
    return _user;
  }

  @override
  Future<CurrentUser> register({
    required String email,
    required String password,
    required String fullName,
  }) async => _user;

  @override
  Future<CurrentUser> verifyEmail({
    required String email,
    required String code,
  }) async => _user;

  @override
  Future<void> logout() async {}
}

SessionController _buildController(_FakeAuthRepository repository) =>
    SessionController(
      login: LoginUseCase(repository),
      register: RegisterUseCase(repository),
      verifyEmail: VerifyEmailUseCase(repository),
      logout: LogoutUseCase(repository),
      restoreSession: RestoreSessionUseCase(repository),
    );

void main() {
  test('starts as unknown until a restore/login/logout resolves it', () {
    final session = _buildController(_FakeAuthRepository());
    expect(session.status, SessionStatus.unknown);
  });

  test(
    'restoreSession without a stored token settles as unauthenticated',
    () async {
      final session = _buildController(
        _FakeAuthRepository()..hasSession = false,
      );
      await session.restoreSession();
      expect(session.status, SessionStatus.unauthenticated);
    },
  );

  test(
    'a successful login sets status to authenticated with the fetched user',
    () async {
      final session = _buildController(_FakeAuthRepository());
      await session.login(email: 'a@a.com', password: 'password123');
      expect(session.status, SessionStatus.authenticated);
      expect(session.currentUser, _user);
    },
  );

  test(
    'a failed login leaves the session unauthenticated and rethrows',
    () async {
      final repository = _FakeAuthRepository()..loginShouldFail = true;
      final session = _buildController(repository);
      await expectLater(
        session.login(email: 'a@a.com', password: 'wrong'),
        throwsA(isA<ApiException>()),
      );
      expect(session.status, isNot(SessionStatus.authenticated));
      expect(session.isLoading, isFalse);
    },
  );

  test('logout clears the current user and moves to unauthenticated', () async {
    final session = _buildController(_FakeAuthRepository());
    await session.login(email: 'a@a.com', password: 'password123');
    await session.logout();
    expect(session.status, SessionStatus.unauthenticated);
    expect(session.currentUser, isNull);
  });

  test(
    'expireSession (called by the network layer) moves to unauthenticated',
    () async {
      final session = _buildController(_FakeAuthRepository());
      await session.login(email: 'a@a.com', password: 'password123');
      session.expireSession();
      expect(session.status, SessionStatus.unauthenticated);
    },
  );
}
