import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/auth_page_shell.dart';
import '../../widgets/primary_button.dart';
import 'auth_error_banner.dart';
import 'password_recovery_new_password_view.dart';
import 'recovery_step_header.dart';

/// Paso 2 de la recuperación: valida el código OTP contra el backend sin
/// consumirlo (se consume al guardar la contraseña en el paso 3).
class PasswordRecoveryCodeView extends StatefulWidget {
  const PasswordRecoveryCodeView({super.key, required this.email});

  final String email;

  @override
  State<PasswordRecoveryCodeView> createState() =>
      _PasswordRecoveryCodeViewState();
}

class _PasswordRecoveryCodeViewState extends State<PasswordRecoveryCodeView> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _run(Future<void> Function() action) async {
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    try {
      await action();
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(error.code));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _verify() async {
    if (!_formKey.currentState!.validate()) return;
    final code = _codeController.text.trim();
    final session = AppScope.read(context).sessionController;
    await _run(() async {
      await session.verifyPasswordResetCode(email: widget.email, code: code);
      if (mounted) {
        context.push(
          AppRoutes.passwordRecoveryNewPassword,
          extra: PasswordResetTicket(email: widget.email, code: code),
        );
      }
    });
  }

  Future<void> _resend() {
    final session = AppScope.read(context).sessionController;
    return _run(() => session.requestPasswordReset(email: widget.email));
  }

  @override
  Widget build(BuildContext context) => AuthPageShell(
    titleKey: 'passwordRecoveryTitle',
    subtitleKey: 'passwordRecoveryCodeHint',
    showBackButton: true,
    content: Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const RecoveryStepHeader(step: 2),
          Text(widget.email, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppSpacing.md),
          AppTextField(
            controller: _codeController,
            label: context.tr('otpCode'),
            icon: Icons.password_rounded,
            keyboardType: TextInputType.number,
            validator: (value) =>
                context.trValidator(FormValidators.otp(value)),
          ),
          if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: context.tr('verifyCodeAction'),
            icon: Icons.verified_outlined,
            isLoading: _isSubmitting,
            onPressed: _verify,
          ),
          TextButton(
            onPressed: _isSubmitting ? null : _resend,
            child: Text(context.tr('resendVerificationCode')),
          ),
        ],
      ),
    ),
  );
}
