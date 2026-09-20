import '../../models/auth/current_user.dart';
import '../../repositories/auth_repository.dart';

class LoginUseCase {
  const LoginUseCase(this._repository);

  final AuthRepository _repository;

  Future<CurrentUser> call({required String email, required String password}) =>
      _repository.login(email: email, password: password);
}
