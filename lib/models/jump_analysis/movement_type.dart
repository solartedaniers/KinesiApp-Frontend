/// Espejo de `MovementType` del backend (`app/models/jump_analysis.py`).
/// Hoy sólo se guarda y se muestra: el análisis es el mismo para ambos.
enum MovementType {
  jump('jump', 'movementTypeJump'),
  squat('squat', 'movementTypeSquat');

  const MovementType(this.apiValue, this.labelKey);

  final String apiValue;
  final String labelKey;

  static MovementType fromApiValue(String? value) => MovementType.values
      .firstWhere((type) => type.apiValue == value, orElse: () => jump);
}
