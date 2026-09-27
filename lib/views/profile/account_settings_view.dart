import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/validation/form_validators.dart';
import '../../models/auth/current_user.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/avatar_editor.dart';
import '../../widgets/primary_button.dart';

/// Pestaña de perfil de cualquier rol: foto, nombre y acceso a cambiar la
/// contraseña. El deportista añade su ficha física en [extraSections].
class AccountSettingsView extends StatefulWidget {
  const AccountSettingsView({super.key, this.extraSections = const []});

  final List<Widget> extraSections;

  @override
  State<AccountSettingsView> createState() => _AccountSettingsViewState();
}

class _AccountSettingsViewState extends State<AccountSettingsView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: AppScope.read(context).sessionController.currentUser!.fullName,
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  /// Cada cambio de cuenta devuelve el usuario actualizado: se refleja en la
  /// sesión para que avatar y nombre cambien en toda la app.
  Future<void> _apply(Future<CurrentUser> request) async {
    final user = await request;
    if (!mounted) return;
    AppScope.read(context).sessionController.updateCurrentUser(user);
  }

  Future<void> _saveName() async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    final userApi = AppScope.read(context).userApi;
    setState(() => _isSaving = true);
    try {
      await _apply(
        userApi.updateMyProfile(fullName: _nameController.text.trim()),
      );
      if (mounted) {
        messenger.showSnackBar(
          SnackBar(content: Text(context.tr('accountNameUpdated'))),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        messenger.showSnackBar(
          SnackBar(
            content: Text(context.tr(ErrorMessageResolver.keyFor(e.code))),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).sessionController;
    return ListenableBuilder(
      listenable: session,
      builder: (context, _) {
        final user = session.currentUser;
        return user == null ? const SizedBox.shrink() : _content(context, user);
      },
    );
  }

  Widget _content(BuildContext context, CurrentUser user) {
    final scope = AppScope.of(context);
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Center(
          child: AvatarEditor(
            name: user.fullName,
            bytes: user.avatarBytes,
            onUpload: (avatar) => _apply(scope.userApi.uploadMyAvatar(avatar)),
            onRemove: () => _apply(scope.userApi.deleteMyAvatar()),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          user.fullName,
          textAlign: TextAlign.center,
          style: theme.textTheme.titleLarge,
        ),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(titleKey: 'accountSection'),
        AppCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppTextField(
                  controller: _nameController,
                  label: context.tr('fullName'),
                  icon: Icons.badge_outlined,
                  validator: (value) =>
                      context.trValidator(FormValidators.required(value)),
                ),
                const SizedBox(height: AppSpacing.md),
                PrimaryButton(
                  label: context.tr('saveChanges'),
                  icon: Icons.save_outlined,
                  isLoading: _isSaving,
                  onPressed: _saveName,
                ),
              ],
            ),
          ),
        ),
        ...widget.extraSections,
        _SectionTitle(titleKey: 'securitySection'),
        AppCard(
          onTap: () => context.push(AppRoutes.changePassword),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.lock_reset_outlined),
            title: Text(context.tr('changePassword')),
            trailing: const Icon(Icons.chevron_right),
          ),
        ),
      ],
    );
  }
}

/// Título de sección dentro de la pestaña de perfil.
class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.titleKey});

  final String titleKey;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
    child: Text(
      context.tr(titleKey),
      style: Theme.of(context).textTheme.titleMedium,
    ),
  );
}
