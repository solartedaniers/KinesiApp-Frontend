import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/app/kinesi_app.dart';
import 'package:frontend/views/auth/login_view.dart';

void main() {
  testWidgets('KinesiApp shows the login view', (WidgetTester tester) async {
    await tester.pumpWidget(const KinesiApp());
    await tester.pumpAndSettle();

    expect(find.byType(LoginView), findsOneWidget);
  });
}
