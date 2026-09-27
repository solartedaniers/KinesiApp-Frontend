import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/navigation/app_routes.dart';
import 'package:frontend/models/jump_analysis/jump_analysis_status.dart';
import 'package:frontend/models/jump_analysis/jump_analysis_summary.dart';
import 'package:frontend/models/jump_analysis/movement_type.dart';
import 'package:frontend/views/athlete/analysis_statistics_panel.dart';
import 'package:frontend/views/athlete/jump_analysis_list.dart';
import 'package:go_router/go_router.dart';

import '../support/localized_app.dart';

final _analysis = JumpAnalysisSummary(
  id: 42,
  athleteId: 7,
  movementType: MovementType.jump,
  status: JumpAnalysisStatus.processed,
  riskScore: 0.3,
  recordedAt: DateTime(2026, 9, 27),
);

/// Router mínimo: la lista en "/" y una pantalla de detalle falsa que muestra
/// el id que recibió por la query, igual que la ruta real.
GoRouter _router(Widget home) => GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (_, _) => Scaffold(body: home),
    ),
    GoRoute(
      path: AppRoutes.analysisDetail,
      builder: (_, state) => Text(
        'detail:${state.uri.queryParameters[AppRoutes.analysisIdParam]}',
      ),
    ),
  ],
);

void main() {
  // JumpAnalysisList es la lista de la pestaña Equipo del coach, de la ficha de
  // un deportista y de Inicio/Grabaciones del deportista (flujos 1 y 3)
  final cases = {
    'athlete list': const <int, String>{},
    'coach team list': const {7: 'Ana'},
  };
  for (final MapEntry(key: description, value: names) in cases.entries) {
    testWidgets('tapping a recording in the $description opens its detail', (
      tester,
    ) async {
      await tester.pumpWidget(
        localized(
          MaterialApp.router(
            routerConfig: _router(
              JumpAnalysisList(analyses: [_analysis], athleteNames: names),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(ListTile));
      await tester.pumpAndSettle();

      expect(find.text('detail:42'), findsOneWidget);
    });
  }

  testWidgets('the recordings stat card opens the recordings list (flow 2)', (
    tester,
  ) async {
    var opened = 0;
    await tester.pumpWidget(
      localized(
        MaterialApp(
          home: Scaffold(
            body: ListView(
              children: [
                AnalysisStatisticsPanel(
                  analyses: [_analysis],
                  onRecordingsTap: () => opened++,
                ),
              ],
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('statsRecordings'));
    expect(opened, 1);
  });

  test('detail route carries the id in the query, not in `extra`', () {
    expect(
      AppRoutes.analysisDetailFor(42),
      '${AppRoutes.analysisDetail}?${AppRoutes.analysisIdParam}=42',
    );
  });
}
