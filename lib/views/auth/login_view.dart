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

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorKey;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _errorKey = null);
    try {
      await AppScope.of(context).sessionController.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(error.code));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).sessionController;
    return AuthPageShell(
      titleKey: 'signIn',
      subtitleKey: 'authLoginSubtitle',
      content: Form(
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
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _passwordController,
              label: context.tr('password'),
              icon: Icons.lock_outline,
              obscureText: true,
              showVisibilityToggle: true,
              validator: (value) =>
                  context.trValidator(FormValidators.required(value)),
            ),
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextButton(
                onPressed: () => context.go(
                  AppRoutes.passwordRecovery,
                  extra: _emailController.text.trim(),
                ),
                child: Text(context.tr('forgotPassword')),
              ),
            ),
            if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
            const SizedBox(height: AppSpacing.sm),
            AnimatedBuilder(
              animation: session,
              builder: (context, _) => PrimaryButton(
                label: context.tr('signIn'),
                icon: Icons.arrow_forward_rounded,
                isLoading: session.isLoading,
                onPressed: _handleSignIn,
              ),
            ),
          ],
        ),
      ),
      footer: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text(context.tr('noAccount')),
          TextButton(
            onPressed: () => context.go(AppRoutes.register),
            child: Text(context.tr('register')),
          ),
        ],
      ),
    );
  }
}
