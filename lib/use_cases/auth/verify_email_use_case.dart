import '../../models/auth/current_user.dart';
import '../../repositories/auth_repository.dart';

class VerifyEmailUseCase {
  const VerifyEmailUseCase(this._repository);

  final AuthRepository _repository;

  Future<CurrentUser> call({required String email, required String code}) =>
      _repository.verifyEmail(email: email, code: code);
}
