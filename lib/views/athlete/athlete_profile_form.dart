import 'package:flutter/material.dart';

import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';
import '../../core/validation/form_validators.dart';
import '../../models/athlete/athlete_profile.dart';
import '../../models/athlete/athlete_profile_form_data.dart';
import '../../models/athlete/gender.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/primary_button.dart';
import '../auth/auth_error_banner.dart';

/// Formulario de ficha física (género, altura, peso, fecha de nacimiento),
/// reutilizado para el alta inicial del deportista, su edición posterior y el
/// CRUD de deportistas gestionados por un coach. Solo captura y valida: quien
/// lo usa decide a qué endpoint enviar los datos vía [onSubmit].
class AthleteProfileForm extends StatefulWidget {
  /// Abre el formulario como pantalla propia; devuelve true si se guardó.
  static Future<bool> openAsPage(
    BuildContext context, {
    required String titleKey,
    required String actionKey,
    required Future<void> Function(AthleteProfileFormData data) onSubmit,
    AthleteProfile? initialProfile,
    bool askFullName = false,
  }) async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (pageContext) => Scaffold(
          appBar: AppBar(),
          body: SafeArea(
            child: AthleteProfileForm(
              titleKey: titleKey,
              actionKey: actionKey,
              initialProfile: initialProfile,
              askFullName: askFullName,
              onSubmit: (data) async {
                await onSubmit(data);
                if (pageContext.mounted) Navigator.of(pageContext).pop(true);
              },
            ),
          ),
        ),
      ),
    );
    return saved ?? false;
  }

  const AthleteProfileForm({
    super.key,
    required this.titleKey,
    required this.actionKey,
    required this.onSubmit,
    this.hintKey,
    this.initialProfile,
    this.askFullName = false,
  });

  final String titleKey;
  final String actionKey;
  final String? hintKey;

  /// Si viene, el formulario arranca precargado (modo edición).
  final AthleteProfile? initialProfile;

  /// Solo los deportistas gestionados por un coach guardan un nombre propio.
  final bool askFullName;

  /// Persiste los datos; un [ApiException] se muestra en el banner de error.
  final Future<void> Function(AthleteProfileFormData data) onSubmit;

  @override
  State<AthleteProfileForm> createState() => _AthleteProfileFormState();
}

class _AthleteProfileFormState extends State<AthleteProfileForm> {
  final _formKey = GlobalKey<FormState>();
  late final _fullNameController = TextEditingController(
    text: widget.initialProfile?.displayName,
  );
  late Gender? _gender = widget.initialProfile?.gender;
  late final _heightController = TextEditingController(
    text: widget.initialProfile?.heightCm.toString(),
  );
  late final _weightController = TextEditingController(
    text: widget.initialProfile?.weightKg.toString(),
  );
  late DateTime? _birthDate = widget.initialProfile?.birthDate;
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  String? _validateNumber(String? value) {
    final requiredError = context.trValidator(FormValidators.required(value));
    if (requiredError != null) return requiredError;
    return double.tryParse(value!) == null
        ? context.tr('validatorInvalidNumber')
        : null;
  }

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime(now.year - 20),
      firstDate: DateTime(now.year - 100),
      lastDate: now,
    );
    if (picked != null) setState(() => _birthDate = picked);
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate() || _birthDate == null) {
      if (_birthDate == null) setState(() => _errorKey = 'validatorRequired');
      return;
    }
    setState(() {
      _errorKey = null;
      _isSubmitting = true;
    });
    try {
      await widget.onSubmit(
        AthleteProfileFormData(
          fullName: widget.askFullName ? _fullNameController.text.trim() : null,
          gender: _gender!,
          heightCm: double.parse(_heightController.text),
          weightKg: double.parse(_weightController.text),
          birthDate: _birthDate!,
        ),
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
  Widget build(BuildContext context) => Form(
    key: _formKey,
    child: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          context.tr(widget.titleKey),
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        if (widget.hintKey != null) ...[
          const SizedBox(height: 8),
          Text(context.tr(widget.hintKey!)),
        ],
        const SizedBox(height: 20),
        AppCard(
          child: Column(
            children: [
              if (widget.askFullName) ...[
                AppTextField(
                  controller: _fullNameController,
                  label: context.tr('fullName'),
                  icon: Icons.badge_outlined,
                  validator: (value) =>
                      context.trValidator(FormValidators.required(value)),
                ),
                const SizedBox(height: 12),
              ],
              DropdownButtonFormField<Gender>(
                initialValue: _gender,
                decoration: InputDecoration(
                  labelText: context.tr('gender'),
                  prefixIcon: const Icon(Icons.wc_outlined),
                ),
                items: Gender.values
                    .map(
                      (gender) => DropdownMenuItem(
                        value: gender,
                        child: Text(context.tr(gender.labelKey)),
                      ),
                    )
                    .toList(),
                onChanged: (gender) => setState(() => _gender = gender),
                validator: (gender) =>
                    gender == null ? context.tr('validatorRequired') : null,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _heightController,
                label: context.tr('heightCm'),
                icon: Icons.height,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                validator: _validateNumber,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: _weightController,
                label: context.tr('weightKg'),
                icon: Icons.monitor_weight_outlined,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                validator: _validateNumber,
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.cake_outlined),
                title: Text(
                  _birthDate == null
                      ? context.tr('birthDate')
                      : _birthDate!.toIso8601String().split('T').first,
                ),
                onTap: _pickBirthDate,
              ),
            ],
          ),
        ),
        if (_errorKey != null) AuthErrorBanner(messageKey: _errorKey!),
        const SizedBox(height: 18),
        PrimaryButton(
          label: context.tr(widget.actionKey),
          icon: Icons.check_circle_outline,
          isLoading: _isSubmitting,
          onPressed: _handleSubmit,
        ),
      ],
    ),
  );
}
