import 'package:flutter/material.dart';

/// Campo de texto estándar de la app, con validación integrada de `Form`.
class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.label,
    required this.icon,
    this.obscureText = false,
    this.controller,
    this.validator,
    this.keyboardType,
  });

  final String label;
  final IconData icon;
  final bool obscureText;
  final TextEditingController? controller;
  final FormFieldValidator<String>? validator;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) => TextFormField(
    controller: controller,
    obscureText: obscureText,
    validator: validator,
    keyboardType: keyboardType,
    autovalidateMode: AutovalidateMode.onUserInteraction,
    decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
  );
}
