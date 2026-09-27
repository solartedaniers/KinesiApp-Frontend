/// Espejo de `Gender` del backend (`app/models/athlete.py`); el `name` de cada
/// valor es el que viaja por la API.
enum Gender {
  male,
  female,
  other;

  static Gender fromApiValue(String value) => Gender.values.firstWhere(
    (gender) => gender.name == value,
    orElse: () => Gender.other,
  );

  String get labelKey => switch (this) {
    Gender.male => 'genderMale',
    Gender.female => 'genderFemale',
    Gender.other => 'genderOther',
  };
}
