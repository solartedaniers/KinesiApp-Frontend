import '../../repositories/auth_repository.dart';

class VerifyPasswordResetCodeUseCase {
  const VerifyPasswordResetCodeUseCase(this._repository);
  final AuthRepository _repository;

  Future<void> call({required String email, required String code}) =>
      _repository.verifyPasswordResetCode(email: email, code: code);
}
