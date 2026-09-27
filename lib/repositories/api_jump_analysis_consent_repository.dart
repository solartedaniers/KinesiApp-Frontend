import '../services/auth/session_controller.dart';
import '../services/users/user_api.dart';
import 'jump_analysis_consent_repository.dart';

/// Consentimiento de video guardado en el backend (`POST /users/me/video-consent`).
/// Se lee del usuario de la sesión (viene de `GET /auth/me`), así que sobrevive a
/// reinstalar la app o cambiar de dispositivo; el backend además lo exige al subir.
class ApiJumpAnalysisConsentRepository
    implements JumpAnalysisConsentRepository {
  const ApiJumpAnalysisConsentRepository(this._userApi, this._session);

  final UserApi _userApi;
  final SessionController _session;

  @override
  Future<bool> hasConsent(int version) async =>
      _session.currentUser?.videoConsentVersion == version;

  @override
  Future<void> recordConsent(int version) async {
    // La respuesta es el usuario actualizado: la sesión queda al día sin otro GET
    _session.updateCurrentUser(await _userApi.grantVideoConsent(version));
  }
}
