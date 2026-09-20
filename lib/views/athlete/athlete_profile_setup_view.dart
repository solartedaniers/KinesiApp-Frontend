import 'package:flutter/material.dart';

import '../../app/app_scope.dart';
import '../../core/error/error_message_resolver.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';
import '../../core/validation/form_validators.dart';
import '../../widgets/app_card.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/primary_button.dart';
import '../auth/auth_error_banner.dart';

/// Alta del perfil de deportista (`POST /athletes/me`): sport, altura, peso y
/// fecha de nacimiento, tal como exige `AthleteProfileSelfCreate` del backend.
class AthleteProfileSetupView extends StatefulWidget {
  const AthleteProfileSetupView({super.key, required this.onCreated});

  /// Se llama tras crear el perfil con éxito para que la vista dueña recargue `GET /athletes/me`.
  final VoidCallback onCreated;

  @override
  State<AthleteProfileSetupView> createState() =>
      _AthleteProfileSetupViewState();
}

class _AthleteProfileSetupViewState extends State<AthleteProfileSetupView> {
  final _formKey = GlobalKey<FormState>();
  final _sportController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  DateTime? _birthDate;
  String? _errorKey;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _sportController.dispose();
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
      await AppScope.of(context).athleteApi.createMine(
        sport: _sportController.text.trim(),
        heightCm: double.parse(_heightController.text),
        weightKg: double.parse(_weightController.text),
        birthDate: _birthDate!,
      );
      widget.onCreated();
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
          context.tr('athleteProfileSetupTitle'),
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Text(context.tr('athleteProfileSetupHint')),
        const SizedBox(height: 20),
        AppCard(
          child: Column(
            children: [
              AppTextField(
                controller: _sportController,
                label: context.tr('sport'),
                icon: Icons.sports_gymnastics_outlined,
                validator: (value) =>
                    context.trValidator(FormValidators.required(value)),
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
          label: context.tr('athleteProfileSetupAction'),
          icon: Icons.check_circle_outline,
          isLoading: _isSubmitting,
          onPressed: _handleSubmit,
        ),
      ],
    ),
  );
}
