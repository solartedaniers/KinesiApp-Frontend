import '../../models/auth/current_user.dart';
import '../../repositories/auth_repository.dart';

/// El registro sólo crea la cuenta (ATHLETE, sin verificar); no autentica.
class RegisterUseCase {
  const RegisterUseCase(this._repository);

  final AuthRepository _repository;

  Future<CurrentUser> call({
    required String email,
    required String password,
    required String fullName,
  }) => _repository.register(
    email: email,
    password: password,
    fullName: fullName,
  );
}
