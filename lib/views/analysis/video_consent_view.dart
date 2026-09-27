import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/config/api_config.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/app_card.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/role_home_button.dart';

class VideoConsentView extends StatefulWidget {
  const VideoConsentView({super.key, required this.athleteId});
  final int athleteId;
  @override
  State<VideoConsentView> createState() => _VideoConsentViewState();
}

class _VideoConsentViewState extends State<VideoConsentView> {
  bool _accepted = false;
  bool _loading = false;
  bool _checkingConsent = true;

  @override
  void initState() {
    super.initState();
    _checkExistingConsent();
  }

  Future<void> _checkExistingConsent() async {
    final hasConsent = await AppScope.read(
      context,
    ).consentRepository.hasConsent(ApiConfig.consentVersion);
    if (!mounted) return;
    if (hasConsent) {
      context.go(AppRoutes.videoCapture, extra: widget.athleteId);
    } else {
      setState(() => _checkingConsent = false);
    }
  }

  Future<void> _continue() async {
    if (!_accepted) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _loading = true);
    try {
      await AppScope.read(
        context,
      ).consentRepository.recordConsent(ApiConfig.consentVersion);
      if (mounted) context.go(AppRoutes.videoCapture, extra: widget.athleteId);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      messenger.showSnackBar(
        SnackBar(
          content: Text(context.tr(ErrorMessageResolver.keyFor(e.code))),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(context.tr('videoConsentTitle')),
      actions: const [RoleHomeButton()],
    ),
    body: SafeArea(
      child: _checkingConsent
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Icon(
                  Icons.privacy_tip_outlined,
                  size: AppSpacing.brandMark,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: AppSpacing.md),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.tr('videoConsentTitle'),
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        context.tr('videoConsentExplanation'),
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                AppCard(
                  child: CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _accepted,
                    onChanged: (value) =>
                        setState(() => _accepted = value ?? false),
                    title: Text(context.tr('videoConsentCheckbox')),
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                PrimaryButton(
                  label: context.tr('videoConsentContinue'),
                  icon: Icons.videocam,
                  isLoading: _loading,
                  onPressed: _accepted ? _continue : null,
                ),
              ],
            ),
    ),
  );
}
