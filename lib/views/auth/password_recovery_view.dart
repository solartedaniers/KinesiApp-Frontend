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

/// Paso 1 de la recuperación: el correo de la cuenta. El backend responde
/// igual exista o no la cuenta, así que siempre se avanza al paso del código.
class PasswordRecoveryView extends StatefulWidget {
  const PasswordRecoveryView({super.key, required this.initialEmail});
  final String initialEmail;

  @override
  State<PasswordRecoveryView> createState() => _PasswordRecoveryViewState();
}

class _PasswordRecoveryViewState extends State<PasswordRecoveryView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    final email = _emailController.text.trim();
    try {
      await AppScope.read(
        context,
      ).sessionController.requestPasswordReset(email: email);
      if (mounted) context.push(AppRoutes.passwordRecoveryCode, extra: email);
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
    subtitleKey: 'passwordRecoveryHint',
    showBackButton: true,
    content: Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const RecoveryStepHeader(step: 1),
          AppTextField(
            controller: _emailController,
            label: context.tr('email'),
            icon: Icons.alternate_email,
            keyboardType: TextInputType.emailAddress,
            validator: (value) =>
                context.trValidator(FormValidators.email(value)),
          ),
          if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: context.tr('sendRecoveryCode'),
            icon: Icons.mark_email_read_outlined,
            isLoading: _isSubmitting,
            onPressed: _submit,
          ),
        ],
      ),
    ),
  );
}
