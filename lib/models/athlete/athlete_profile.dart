/// DTO de AthleteProfileRead (backend `app/schemas/athlete.py`).
class AthleteProfile {
  const AthleteProfile({
    required this.id,
    required this.userId,
    required this.coachId,
    required this.displayName,
    required this.isManaged,
    required this.sport,
    required this.heightCm,
    required this.weightKg,
    required this.birthDate,
  });

  final int id;

  /// Nulo en deportistas gestionados por un coach (sin cuenta propia).
  final int? userId;
  final int? coachId;
  final String displayName;
  final bool isManaged;
  final String sport;
  final double heightCm;
  final double weightKg;
  final DateTime birthDate;

  factory AthleteProfile.fromJson(Map<String, dynamic> json) => AthleteProfile(
    id: json['id'] as int,
    userId: json['user_id'] as int?,
    coachId: json['coach_id'] as int?,
    displayName: json['display_name'] as String,
    isManaged: json['is_managed'] as bool,
    sport: json['sport'] as String,
    heightCm: (json['height_cm'] as num).toDouble(),
    weightKg: (json['weight_kg'] as num).toDouble(),
    birthDate: DateTime.parse(json['birth_date'] as String),
  );
}
