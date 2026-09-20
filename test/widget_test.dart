import 'package:flutter_secure_storage_platform_interface/flutter_secure_storage_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/app/kinesi_app.dart';
import 'package:frontend/views/auth/login_view.dart';

import 'support/fake_secure_storage_platform.dart';

void main() {
  setUp(
    () => FlutterSecureStoragePlatform.instance = FakeSecureStoragePlatform(),
  );

  testWidgets(
    'KinesiApp shows the login view when there is no stored session',
    (WidgetTester tester) async {
      await tester.pumpWidget(const KinesiApp());
      await tester.pumpAndSettle();

      expect(find.byType(LoginView), findsOneWidget);
    },
  );
}
