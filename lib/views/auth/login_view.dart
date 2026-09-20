import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/biometric_background.dart';
import '../../widgets/language_theme_toggle.dart';
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
    final session = AppScope.of(context).sessionController;
    try {
      // Al autenticar, SessionController notifica y el router redirige solo
      // (refreshListenable): esta vista no navega manualmente.
      await session.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _errorKey = ErrorMessageResolver.keyFor(e.code));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).sessionController;
    return Scaffold(
      body: BiometricBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Align(
                        alignment: Alignment.centerRight,
                        child: LanguageThemeToggle(),
                      ),
                      const AppLogo(),
                      const SizedBox(height: 16),
                      Text(
                        context.tr('appName'),
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      Text(context.tr('subtitle'), textAlign: TextAlign.center),
                      const SizedBox(height: 28),
                      AppCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              context.tr('signIn'),
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            AppTextField(
                              controller: _emailController,
                              label: context.tr('email'),
                              icon: Icons.person_outline,
                              keyboardType: TextInputType.emailAddress,
                              validator: (value) => context.trValidator(
                                FormValidators.email(value),
                              ),
                            ),
                            const SizedBox(height: 12),
                            AppTextField(
                              controller: _passwordController,
                              label: context.tr('password'),
                              icon: Icons.lock_outline,
                              obscureText: true,
                              validator: (value) => context.trValidator(
                                FormValidators.required(value),
                              ),
                            ),
                            if (_errorKey != null)
                              AuthErrorBanner(messageKey: _errorKey!),
                            const SizedBox(height: 8),
                            AnimatedBuilder(
                              animation: session,
                              builder: (context, _) => PrimaryButton(
                                label: context.tr('signIn'),
                                icon: Icons.arrow_forward,
                                isLoading: session.isLoading,
                                onPressed: _handleSignIn,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              context.tr('secure'),
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.labelSmall,
                            ),
                          ],
                        ),
                      ),
                      Wrap(
                        alignment: WrapAlignment.center,
                        children: [
                          Text(context.tr('noAccount')),
                          TextButton(
                            onPressed: () => context.go(AppRoutes.register),
                            child: Text(context.tr('register')),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
