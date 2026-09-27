import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/primary_button.dart';
import '../auth/auth_error_banner.dart';

/// Cambio de contraseña con sesión iniciada: contraseña actual, nueva y
/// confirmación. Viaja por HTTPS y el backend la guarda con bcrypt; al cambiarla
/// revoca las demás sesiones y devuelve tokens nuevos para este dispositivo.
class ChangePasswordView extends StatefulWidget {
  const ChangePasswordView({super.key});

  @override
  State<ChangePasswordView> createState() => _ChangePasswordViewState();
}

class _ChangePasswordViewState extends State<ChangePasswordView> {
  final _formKey = GlobalKey<FormState>();
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  String? _validateNew(String? value) {
    final error = context.trValidator(FormValidators.password(value));
    if (error != null) return error;
    // El backend también lo rechaza (409); aquí se evita el viaje
    return value == _currentController.text
        ? context.tr('errorPasswordReused')
        : null;
  }

  String? _validateConfirm(String? value) {
    final requiredError = context.trValidator(FormValidators.required(value));
    if (requiredError != null) return requiredError;
    return value == _newController.text
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
      await AppScope.read(context).sessionController.changePassword(
        currentPassword: _currentController.text,
        newPassword: _newController.text,
      );
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text(context.tr('passwordChanged'))),
      );
      context.pop();
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
    appBar: AppBar(title: Text(context.tr('changePassword'))),
    body: SafeArea(
      child: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            AppTextField(
              controller: _currentController,
              label: context.tr('currentPassword'),
              icon: Icons.lock_outline,
              obscureText: true,
              showVisibilityToggle: true,
              validator: (value) =>
                  context.trValidator(FormValidators.required(value)),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _newController,
              label: context.tr('newPassword'),
              icon: Icons.lock_reset_outlined,
              obscureText: true,
              showVisibilityToggle: true,
              validator: _validateNew,
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
              label: context.tr('changePassword'),
              icon: Icons.check,
              isLoading: _isSubmitting,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    ),
  );
}
