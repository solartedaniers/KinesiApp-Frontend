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
import 'recovery_step_header.dart';

/// Lo que el paso 2 ya validó y el paso 3 necesita para confirmar el cambio.
class PasswordResetTicket {
  const PasswordResetTicket({required this.email, required this.code});

  final String email;
  final String code;
}

/// Paso 3 de la recuperación: nueva contraseña + confirmación con las mismas
/// reglas que el registro. Si coincide con la actual el backend responde
/// `password_reused` y se muestra aquí mismo.
class PasswordRecoveryNewPasswordView extends StatefulWidget {
  const PasswordRecoveryNewPasswordView({super.key, required this.ticket});

  final PasswordResetTicket ticket;

  @override
  State<PasswordRecoveryNewPasswordView> createState() =>
      _PasswordRecoveryNewPasswordViewState();
}

class _PasswordRecoveryNewPasswordViewState
    extends State<PasswordRecoveryNewPasswordView> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  String? _validateConfirm(String? value) {
    final requiredError = context.trValidator(FormValidators.required(value));
    if (requiredError != null) return requiredError;
    return value == _passwordController.text
        ? null
        : context.tr('validatorPasswordMismatch');
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    try {
      await AppScope.read(context).sessionController.confirmPasswordReset(
        email: widget.ticket.email,
        code: widget.ticket.code,
        newPassword: _passwordController.text,
      );
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text(context.tr('passwordRecoverySuccess'))),
      );
      // `go` (no `push`) limpia la pila de recuperación: no se puede volver atrás
      context.go(AppRoutes.login);
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
    subtitleKey: 'passwordRecoveryNewPasswordHint',
    showBackButton: true,
    content: _buildForm(context),
  );

  Widget _buildForm(BuildContext context) => Form(
    key: _formKey,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const RecoveryStepHeader(step: 3),
        AppTextField(
          controller: _passwordController,
          label: context.tr('newPassword'),
          icon: Icons.lock_reset_outlined,
          obscureText: true,
          showVisibilityToggle: true,
          validator: (value) =>
              context.trValidator(FormValidators.password(value)),
        ),
        const SizedBox(height: AppSpacing.md),
        AppTextField(
          controller: _confirmController,
          label: context.tr('confirmPassword'),
          icon: Icons.lock_outline,
          obscureText: true,
          showVisibilityToggle: true,
          validator: _validateConfirm,
        ),
        if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(
          label: context.tr('resetPasswordAction'),
          icon: Icons.password_rounded,
          isLoading: _isSubmitting,
          onPressed: _submit,
        ),
      ],
    ),
  );
}
