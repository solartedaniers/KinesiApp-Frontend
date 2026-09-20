import '../../core/network/api_exception.dart';
import '../../repositories/auth_repository.dart';
import 'restore_session_result.dart';

class RestoreSessionUseCase {
  const RestoreSessionUseCase(this._repository);

  final AuthRepository _repository;

  Future<RestoreSessionResult> call() async {
    if (!await _repository.hasStoredSession()) {
      return const RestoreSessionUnauthenticated();
    }

    try {
      final user = await _repository.fetchCurrentUser();
      return RestoreSessionAuthenticated(user);
    } on ApiException catch (e) {
      // 401 significa que el access token es inválido y el refresh (si se intentó) ya falló;
      // cualquier otro caso (sin conexión, 5xx) es transitorio: no hay que cerrar la sesión.
      if (e.statusCode == 401) return const RestoreSessionUnauthenticated();
      return const RestoreSessionNetworkError();
    }
  }
}
