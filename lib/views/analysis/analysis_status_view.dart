import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/analysis_flow.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../repositories/jump_analysis_status_repository.dart';
import '../../widgets/app_card.dart';
import '../../widgets/retry_state.dart';

class AnalysisStatusView extends StatefulWidget {
  const AnalysisStatusView({super.key, required this.flow});
  final AnalysisFlow flow;
  @override
  State<AnalysisStatusView> createState() => _AnalysisStatusViewState();
}

class _AnalysisStatusViewState extends State<AnalysisStatusView> {
  Timer? _timer;
  ClientAnalysisStatus? _status;
  Object? _error;
  int _attempts = 0;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _poll();
  }

  Future<void> _poll() async {
    if (_loading) return;
    _loading = true;
    try {
      final status = await AppScope.of(
        context,
      ).analysisStatusRepository.getStatus(widget.flow.analysisId);
      if (!mounted) return;
      setState(() {
        _status = status;
        _error = null;
        _attempts++;
      });
      if (status == ClientAnalysisStatus.processed) {
        context.go(AppRoutes.analysisChat, extra: widget.flow.analysisId);
      } else if (_attempts >= 10) {
        setState(() => _error = StateError('Analysis did not finish'));
      } else {
        _timer = Timer(const Duration(seconds: 2), _poll);
      }
    } catch (error) {
      if (mounted) setState(() => _error = error);
    } finally {
      _loading = false;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _statusKey => switch (_status) {
    ClientAnalysisStatus.queued => 'analysisQueued',
    ClientAnalysisStatus.processing => 'analysisProcessing',
    ClientAnalysisStatus.processed => 'analysisProcessed',
    ClientAnalysisStatus.failed => 'analysisFailed',
    null => 'analysisStatusLoading',
  };

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(context.tr('analysisStatusTitle'))),
    body: Center(
      child: _error != null
          ? RetryState(
              messageKey: 'errorGeneric',
              onRetry: () {
                _attempts = 0;
                setState(() => _error = null);
                _poll();
              },
            )
          : Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: AppCard(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      context.tr(_statusKey),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ],
                ),
              ),
            ),
    ),
  );
}
