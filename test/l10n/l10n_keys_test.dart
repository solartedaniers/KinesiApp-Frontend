import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('en.json and es.json expose exactly the same set of keys', () {
    final english =
        jsonDecode(File('lib/l10n/en.json').readAsStringSync())
            as Map<String, dynamic>;
    final spanish =
        jsonDecode(File('lib/l10n/es.json').readAsStringSync())
            as Map<String, dynamic>;

    expect(english.keys.toSet(), spanish.keys.toSet());
  });
}
