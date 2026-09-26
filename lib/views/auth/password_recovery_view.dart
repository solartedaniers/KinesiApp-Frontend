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

class PasswordRecoveryView extends StatefulWidget {
  const PasswordRecoveryView({super.key, required this.initialEmail});
  final String initialEmail;

  @override
  State<PasswordRecoveryView> createState() => _PasswordRecoveryViewState();
}

class _PasswordRecoveryViewState extends State<PasswordRecoveryView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String? _errorKey;
  bool _isSubmitting = false;
  bool _codeRequested = false;
  bool _completed = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateConfirmPassword(String? value) {
    final requiredError = context.trValidator(FormValidators.required(value));
    if (requiredError != null) return requiredError;
    return value == _passwordController.text
        ? null
        : context.tr('validatorPasswordMismatch');
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    final session = AppScope.of(context).sessionController;
    try {
      final email = _emailController.text.trim();
      if (!_codeRequested) {
        await session.requestPasswordReset(email: email);
        if (mounted) setState(() => _codeRequested = true);
      } else {
        await session.confirmPasswordReset(
          email: email,
          code: _codeController.text.trim(),
          newPassword: _passwordController.text,
        );
        if (mounted) setState(() => _completed = true);
      }
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(error.code));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => AuthPageShell(
    titleKey: 'passwordRecoveryTitle',
    subtitleKey: _completed
        ? 'passwordRecoveryCompleteHint'
        : _codeRequested
        ? 'passwordRecoveryCodeHint'
        : 'passwordRecoveryHint',
    showBackButton: true,
    content: _completed
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(
                Icons.check_circle_outline_rounded,
                size: AppSpacing.xxl,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                context.tr('passwordRecoverySuccess'),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: context.tr('backToSignIn'),
                icon: Icons.login,
                onPressed: () => context.go(AppRoutes.login),
              ),
            ],
          )
        : Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppTextField(
                  controller: _emailController,
                  label: context.tr('email'),
                  icon: Icons.alternate_email,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) =>
                      context.trValidator(FormValidators.email(value)),
                ),
                if (_codeRequested) ...[
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _codeController,
                    label: context.tr('otpCode'),
                    icon: Icons.password_rounded,
                    keyboardType: TextInputType.number,
                    validator: (value) =>
                        context.trValidator(FormValidators.otp(value)),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _passwordController,
                    label: context.tr('newPassword'),
                    icon: Icons.lock_reset_outlined,
                    obscureText: true,
                    validator: (value) =>
                        context.trValidator(FormValidators.password(value)),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  AppTextField(
                    controller: _confirmPasswordController,
                    label: context.tr('confirmPassword'),
                    icon: Icons.lock_outline,
                    obscureText: true,
                    validator: _validateConfirmPassword,
                  ),
                ],
                if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
                const SizedBox(height: AppSpacing.lg),
                PrimaryButton(
                  label: context.tr(
                    _codeRequested ? 'resetPasswordAction' : 'sendRecoveryCode',
                  ),
                  icon: _codeRequested
                      ? Icons.password_rounded
                      : Icons.mark_email_read_outlined,
                  isLoading: _isSubmitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
  );
}
