import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/core/localization/app_localizations.dart';
import 'package:frontend/core/localization/translation_service.dart';
import 'package:frontend/widgets/stat_grid.dart';

void main() {
  testWidgets('stat cards grow instead of overflowing on a narrow screen '
      'with large system text', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      AppLocalizationScope(
        localizations: AppLocalizations(
          const TranslationCatalog(english: {}, spanish: {}),
          AppLanguage.spanish,
        ),
        child: MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(2)),
            child: Scaffold(
              body: ListView(
                children: const [
                  StatGrid(
                    items: [
                      StatItem(labelKey: 'a', value: '12', icon: Icons.speed),
                      StatItem(labelKey: 'b', value: '0.42', icon: Icons.speed),
                      StatItem(labelKey: 'c', value: '3', icon: Icons.speed),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    // Un overflow de RenderFlex se reporta como excepción del framework
    expect(tester.takeException(), isNull);
    expect(find.text('0.42'), findsOneWidget);
  });
}
