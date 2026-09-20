import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/error/error_message_resolver.dart';
import 'package:frontend/core/network/error_code.dart';

void main() {
  test('maps a known code to its own i18n key', () {
    expect(
      ErrorMessageResolver.keyFor(ErrorCode.invalidCredentials),
      'errorInvalidCredentials',
    );
  });

  test('falls back to the generic key for unknown/unmapped codes', () {
    expect(
      ErrorMessageResolver.keyFor(ErrorCode.unknown),
      ErrorMessageResolver.genericKey,
    );
    expect(
      ErrorMessageResolver.keyFor(ErrorCode.conflict),
      ErrorMessageResolver.genericKey,
    );
  });
}
