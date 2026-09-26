import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/auth_page_shell.dart';
import '../../widgets/primary_button.dart';
import 'auth_error_banner.dart';

class OtpVerificationView extends StatefulWidget {
  const OtpVerificationView({super.key, required this.email});
  final String email;

  @override
  State<OtpVerificationView> createState() => _OtpVerificationViewState();
}

class _OtpVerificationViewState extends State<OtpVerificationView> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  String? _errorKey;
  String? _noticeKey;
  bool _isSubmitting = false;
  bool _isResending = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _errorKey = null;
      _noticeKey = null;
      _isSubmitting = true;
    });
    try {
      await AppScope.of(context).sessionController.verifyEmail(
        email: widget.email,
        code: _codeController.text.trim(),
      );
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(error.code));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _resendCode() async {
    setState(() {
      _errorKey = null;
      _noticeKey = null;
      _isResending = true;
    });
    try {
      await AppScope.of(
        context,
      ).sessionController.requestVerificationCode(email: widget.email);
      if (mounted) setState(() => _noticeKey = 'verificationCodeSent');
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(error.code));
      }
    } finally {
      if (mounted) setState(() => _isResending = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthPageShell(
    titleKey: 'verifyEmailTitle',
    subtitleKey: 'verifyEmailSubtitle',
    showBackButton: true,
    content: Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            context.tr('verifyEmailHint').replaceFirst('{email}', widget.email),
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _codeController,
            label: context.tr('otpCode'),
            icon: Icons.password_rounded,
            keyboardType: TextInputType.number,
            validator: (value) =>
                context.trValidator(FormValidators.otp(value)),
          ),
          if (_noticeKey != null)
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              child: Text(
                context.tr(_noticeKey!),
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
            ),
          if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: context.tr('verifyEmailAction'),
            icon: Icons.verified_user_outlined,
            isLoading: _isSubmitting,
            onPressed: _handleVerify,
          ),
          const SizedBox(height: AppSpacing.xs),
          TextButton.icon(
            onPressed: _isResending ? null : _resendCode,
            icon: _isResending
                ? SizedBox.square(
                    dimension: AppSpacing.compactIcon,
                    child: CircularProgressIndicator(
                      strokeWidth: AppSpacing.xs / 2,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  )
                : const Icon(Icons.mark_email_unread_outlined),
            label: Text(context.tr('resendVerificationCode')),
          ),
        ],
      ),
    ),
  );
}
