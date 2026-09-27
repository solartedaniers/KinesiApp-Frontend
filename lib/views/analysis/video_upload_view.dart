import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/analysis_flow.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/app_card.dart';
import '../../widgets/retry_state.dart';
import '../../widgets/role_home_button.dart';

class VideoUploadView extends StatefulWidget {
  const VideoUploadView({super.key, required this.flow});
  final AnalysisFlow flow;
  @override
  State<VideoUploadView> createState() => _VideoUploadViewState();
}

class _VideoUploadViewState extends State<VideoUploadView> {
  StreamSubscription<double>? _subscription;
  double _progress = 0;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _upload();
  }

  void _upload() {
    _subscription?.cancel();
    setState(() {
      _progress = 0;
      _error = null;
    });
    _subscription = AppScope.read(context).videoUploadRepository
        .upload(widget.flow.video)
        .listen(
          (progress) => setState(() => _progress = progress),
          onError: (Object error) => setState(() => _error = error),
          onDone: () {
            if (mounted) {
              context.go(AppRoutes.analysisStatus, extra: widget.flow);
            }
          },
        );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(context.tr('videoUploadTitle')),
      actions: const [RoleHomeButton()],
    ),
    body: Center(
      child: _error != null
          ? RetryState(messageKey: 'errorGeneric', onRetry: _upload)
          : Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: AppCard(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.cloud_upload_outlined,
                      size: AppSpacing.brandMark,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      context.tr('videoUploadProgress'),
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.card),
                      child: LinearProgressIndicator(
                        value: _progress,
                        minHeight: AppSpacing.xs,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      '${(_progress * 100).round()}%',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
              ),
            ),
    ),
  );
}
