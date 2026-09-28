import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/network/api_exception.dart';
import 'package:frontend/core/network/error_code.dart';
import 'package:frontend/views/analysis/delete_analysis_button.dart';

import '../support/localized_app.dart';

/// Registra cuántas veces se pidió borrar y cuántas se avisó que se borró.
class _Calls {
  int deletes = 0;
  int deletedNotices = 0;
  bool fail = false;

  Future<void> delete() async {
    deletes++;
    if (fail) throw const ApiException('boom', ErrorCode.forbidden);
  }
}

Future<void> _pump(WidgetTester tester, _Calls calls) => tester.pumpWidget(
  localized(
    MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          actions: [
            DeleteAnalysisButton(
              delete: calls.delete,
              onDeleted: () => calls.deletedNotices++,
            ),
          ],
        ),
      ),
    ),
  ),
);

void main() {
  testWidgets('tapping delete asks for confirmation before deleting', (
    tester,
  ) async {
    final calls = _Calls();
    await _pump(tester, calls);

    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();

    // Un solo toque nunca borra: primero aparece el diálogo
    expect(find.text('deleteAnalysisTitle'), findsOneWidget);
    expect(calls.deletes, 0);

    await tester.tap(find.text('delete'));
    await tester.pumpAndSettle();
    expect(calls.deletes, 1);
    expect(calls.deletedNotices, 1);
  });

  testWidgets('cancelling (button or tapping outside) deletes nothing', (
    tester,
  ) async {
    final calls = _Calls();
    await _pump(tester, calls);

    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();
    await tester.tap(find.text('cancel'));
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();
    await tester.tapAt(const Offset(5, 500));
    await tester.pumpAndSettle();

    expect(find.text('deleteAnalysisTitle'), findsNothing);
    expect(calls.deletes, 0);
    expect(calls.deletedNotices, 0);
  });

  testWidgets('a failed delete shows the error and does not leave the screen', (
    tester,
  ) async {
    final calls = _Calls()..fail = true;
    await _pump(tester, calls);

    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();
    await tester.tap(find.text('delete'));
    await tester.pumpAndSettle();

    expect(calls.deletes, 1);
    expect(calls.deletedNotices, 0);
    expect(find.text('errorForbidden'), findsOneWidget);
  });
}
