import '../../repositories/auth_repository.dart';

class RequestVerificationCodeUseCase {
  const RequestVerificationCodeUseCase(this._repository);
  final AuthRepository _repository;

  Future<void> call({required String email}) =>
      _repository.requestVerificationCode(email: email);
}
