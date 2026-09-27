import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/validation/form_validators.dart';
import '../../models/user_role.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/auth_page_shell.dart';
import '../../widgets/primary_button.dart';
import 'auth_error_banner.dart';

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
  // El registro público solo ofrece estos roles; admin se asigna internamente.
  static const _signupRoles = [UserRole.athlete, UserRole.coach];
  UserRole _role = UserRole.athlete;
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
        role: _role,
      );
      if (mounted) context.go(AppRoutes.verifyEmail, extra: email);
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
    titleKey: 'createAccount',
    subtitleKey: 'authRegisterSubtitle',
    showBackButton: true,
    content: Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(context.tr('registerRoleLabel')),
          const SizedBox(height: AppSpacing.sm),
          SegmentedButton<UserRole>(
            segments: _signupRoles
                .map(
                  (role) => ButtonSegment(
                    value: role,
                    label: Text(context.tr(role.name)),
                  ),
                )
                .toList(),
            selected: {_role},
            onSelectionChanged: (selection) =>
                setState(() => _role = selection.first),
          ),
          const SizedBox(height: AppSpacing.md),
          AppTextField(
            controller: _fullNameController,
            label: context.tr('fullName'),
            icon: Icons.badge_outlined,
            validator: (value) =>
                context.trValidator(FormValidators.required(value)),
          ),
          const SizedBox(height: AppSpacing.md),
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
                context.trValidator(FormValidators.password(value)),
          ),
          const SizedBox(height: AppSpacing.md),
          AppTextField(
            controller: _confirmPasswordController,
            label: context.tr('confirmPassword'),
            icon: Icons.lock_reset_outlined,
            obscureText: true,
            showVisibilityToggle: true,
            validator: _validateConfirmPassword,
          ),
          if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(
            label: context.tr('createAccount'),
            icon: Icons.person_add_alt_1,
            isLoading: _isSubmitting,
            onPressed: _handleRegister,
          ),
        ],
      ),
    ),
    footer: Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Text(context.tr('hasAccount')),
        TextButton(
          onPressed: () => context.go(AppRoutes.login),
          child: Text(context.tr('signIn')),
        ),
      ],
    ),
  );
}
