import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/controllers/loadable_controller.dart';

void main() {
  test('keeps a nullable result apart from "not loaded yet"', () async {
    final controller = LoadableController<int?>(() async => null);
    expect(controller.hasData, isFalse);
    await controller.load();
    expect(controller.hasData, isTrue);
    expect(controller.data, isNull);
  });

  test(
    'a failed load flags the error; replace() sets data without fetching',
    () async {
      final controller = LoadableController<int>(() async => throw Exception());
      await controller.load();
      expect(controller.hasError, isTrue);
      expect(controller.hasData, isFalse);
      controller.replace(7);
      expect(controller.data, 7);
    },
  );
}
