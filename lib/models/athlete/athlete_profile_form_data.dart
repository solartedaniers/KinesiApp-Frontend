import 'gender.dart';

/// Datos capturados por el formulario de ficha física. [fullName] solo se usa
/// en deportistas gestionados por un coach (los demás usan el nombre de su cuenta).
class AthleteProfileFormData {
  const AthleteProfileFormData({
    required this.gender,
    required this.heightCm,
    required this.weightKg,
    required this.birthDate,
    this.fullName,
  });

  final String? fullName;
  final Gender gender;
  final double heightCm;
  final double weightKg;
  final DateTime birthDate;

  Map<String, dynamic> toJson() => {
    if (fullName != null) 'full_name': fullName,
    'gender': gender.name,
    'height_cm': heightCm,
    'weight_kg': weightKg,
    'birth_date': _isoDate(birthDate),
  };

  static String _isoDate(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}
