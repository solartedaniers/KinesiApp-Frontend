import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/validation/form_validators.dart';

void main() {
  test('password policy mirrors the backend StrongPassword rule', () {
    expect(FormValidators.password('abc1'), 'validatorPasswordTooShort');
    expect(FormValidators.password('onlyletters'), 'validatorPasswordWeak');
    expect(FormValidators.password('12345678'), 'validatorPasswordWeak');
    expect(
      FormValidators.password('a' * 128 + '1'),
      'validatorPasswordTooLong',
    );
    expect(FormValidators.password('contraseña1'), isNull);
  });
}
