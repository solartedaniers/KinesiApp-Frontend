import 'package:flutter/material.dart';

import '../core/localization/app_localizations.dart';

class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    required this.label,
    required this.icon,
    this.obscureText = false,
    this.showVisibilityToggle = false,
    this.controller,
    this.validator,
    this.keyboardType,
  });

  final String label;
  final IconData icon;
  final bool obscureText;
  final bool showVisibilityToggle;
  final TextEditingController? controller;
  final FormFieldValidator<String>? validator;
  final TextInputType? keyboardType;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late bool _isObscured = widget.obscureText;

  @override
  Widget build(BuildContext context) => TextFormField(
    controller: widget.controller,
    obscureText: _isObscured,
    validator: widget.validator,
    keyboardType: widget.keyboardType,
    autovalidateMode: AutovalidateMode.onUserInteraction,
    decoration: InputDecoration(
      labelText: widget.label,
      prefixIcon: Icon(widget.icon),
      suffixIcon: widget.showVisibilityToggle
          ? IconButton(
              tooltip: _isObscured
                  ? context.tr('showPassword')
                  : context.tr('hidePassword'),
              onPressed: () => setState(() => _isObscured = !_isObscured),
              icon: Icon(
                _isObscured ? Icons.visibility_outlined : Icons.visibility_off_outlined,
              ),
            )
          : null,
    ),
  );
}
