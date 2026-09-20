import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/biometric_background.dart';
import '../../widgets/primary_button.dart';
import 'auth_error_banner.dart';

/// Verifica el código OTP enviado por correo tras `/auth/register`. El
/// backend no expone un endpoint de reenvío, así que no hay botón "reenviar".
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
  bool _isSubmitting = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    try {
      // Al verificar, SessionController queda autenticado y el router
      // redirige solo a la home del rol (refreshListenable).
      await AppScope.of(context).sessionController.verifyEmail(
        email: widget.email,
        code: _codeController.text.trim(),
      );
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
      variant: 2,
      child: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              context.tr('verifyEmailTitle'),
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              context
                  .tr('verifyEmailHint')
                  .replaceFirst('{email}', widget.email),
            ),
            const SizedBox(height: 20),
            AppCard(
              child: Column(
                children: [
                  AppTextField(
                    controller: _codeController,
                    label: context.tr('otpCode'),
                    icon: Icons.pin_outlined,
                    keyboardType: TextInputType.number,
                    validator: (value) =>
                        context.trValidator(FormValidators.required(value)),
                  ),
                ],
              ),
            ),
            if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
            const SizedBox(height: 18),
            PrimaryButton(
              label: context.tr('verifyEmailAction'),
              icon: Icons.check_circle_outline,
              isLoading: _isSubmitting,
              onPressed: _handleVerify,
            ),
          ],
        ),
      ),
    ),
  );
}
