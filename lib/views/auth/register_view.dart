import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/biometric_background.dart';
import '../../widgets/primary_button.dart';
import 'auth_error_banner.dart';

/// El backend sólo permite registrar cuentas ATHLETE (`/auth/register`): no
/// hay selector de rol. Registrar no autentica; falta verificar el OTP.
class RegisterView extends StatefulWidget {
  const RegisterView({super.key});

  @override
  State<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends State<RegisterView> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
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

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    final email = _emailController.text.trim();
    try {
      await AppScope.of(context).sessionController.register(
        email: email,
        password: _passwordController.text,
        fullName: _fullNameController.text.trim(),
      );
      if (mounted) context.go(AppRoutes.verifyEmail, extra: email);
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(e.code));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(leading: const BackButton()),
    body: BiometricBackground(
      variant: 1,
      child: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              context.tr('createAccount'),
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 20),
            AppCard(
              child: Column(
                children: [
                  AppTextField(
                    controller: _fullNameController,
                    label: context.tr('fullName'),
                    icon: Icons.badge_outlined,
                    validator: (value) =>
                        context.trValidator(FormValidators.required(value)),
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: _emailController,
                    label: context.tr('email'),
                    icon: Icons.mail_outline,
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) =>
                        context.trValidator(FormValidators.email(value)),
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: _passwordController,
                    label: context.tr('password'),
                    icon: Icons.lock_outline,
                    obscureText: true,
                    validator: (value) =>
                        context.trValidator(FormValidators.password(value)),
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: _confirmPasswordController,
                    label: context.tr('confirmPassword'),
                    icon: Icons.lock_reset_outlined,
                    obscureText: true,
                    validator: _validateConfirmPassword,
                  ),
                ],
              ),
            ),
            if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
            const SizedBox(height: 18),
            PrimaryButton(
              label: context.tr('createAccount'),
              icon: Icons.person_add,
              isLoading: _isSubmitting,
              onPressed: _handleRegister,
            ),
          ],
        ),
      ),
    ),
  );
}
