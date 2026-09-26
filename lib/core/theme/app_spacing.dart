/// Design tokens de medidas: único lugar donde se define spacing y radios,
/// para que ningún widget escriba un número de layout suelto.
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 28;
  static const double xxl = 40;
  static const double maxContentWidth = 460;
  static const double actionHeight = 54;
  static const double compactIcon = 20;
  static const double brandMark = 64;
  static const double brandIcon = 36;
}

abstract final class AppRadius {
  static const double card = 18;
  static const double control = 14;
  static const double chip = 16;
  static const double panel = 24;
}
